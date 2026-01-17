"""
Authentication & Authorization Module
JWT Token validation for Supabase Auth
"""
import os
import logging
import requests
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

SUPABASE_ISSUER = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else None
SUPABASE_PROJECT_REF = SUPABASE_URL.split("//")[1].split(".")[0] if SUPABASE_URL else None
JWKS_URL = f"https://{SUPABASE_PROJECT_REF}.supabase.co/auth/v1/keys" if SUPABASE_PROJECT_REF else None

if not SUPABASE_URL:
    logger.warning("⚠️  SUPABASE_URL not found in environment variables!")
if not SUPABASE_KEY:
    logger.warning("⚠️  SUPABASE_KEY not found in environment variables!")
if not SUPABASE_JWT_SECRET:
    logger.warning("⚠️  SUPABASE_JWT_SECRET not found in environment variables!")

_jwks_cache = None


def _get_jwks_keys() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        if not JWKS_URL:
            raise HTTPException(status_code=401, detail="JWKS URL is not configured")
        try:
            headers = {}
            if SUPABASE_KEY:
                headers["apikey"] = SUPABASE_KEY
            response = requests.get(JWKS_URL, headers=headers, timeout=5)
            response.raise_for_status()
            _jwks_cache = response.json()
            logger.info(f"✅ Loaded JWKS keys from {JWKS_URL}")
        except Exception as exc:
            logger.error(f"❌ Failed to fetch JWKS keys: {str(exc)}")
            raise HTTPException(status_code=401, detail="Unable to fetch JWKS keys")
    return _jwks_cache


def _get_user_from_supabase(token: str) -> dict:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=401, detail="Supabase auth not configured")
    try:
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_KEY,
            },
            timeout=5,
        )
        if response.status_code != 200:
            logger.warning(f"❌ Supabase auth lookup failed: {response.status_code}")
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return response.json()
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"❌ Supabase auth lookup error: {str(exc)}")
        raise HTTPException(status_code=401, detail="Authentication failed")


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify Supabase JWT Token
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        Decoded JWT payload with user_id, email, etc.
        
    Raises:
        HTTPException 401: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Prefer Supabase Auth API validation to avoid JWKS issues
        user = _get_user_from_supabase(token)
        user_id = user.get("id")
        email = user.get("email")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        logger.info(f"✅ Authenticated user via Supabase: {email} ({user_id})")
        return {
            "user_id": user_id,
            "email": email,
            "role": user.get("role", "authenticated"),
            "payload": user,
        }
    except HTTPException:
        # Fall back to local JWT verification when Supabase API is unavailable
        pass

    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg")
        logger.info(f"🔍 Token algorithm: {alg}")

        decode_options = {
            "verify_aud": False,
            "verify_iss": SUPABASE_ISSUER is not None,
        }

        if alg and (alg.startswith("RS") or alg.startswith("ES")):
            jwks = _get_jwks_keys()
            jwk_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == unverified_header.get("kid"):
                    jwk_key = key
                    break
            if not jwk_key:
                raise HTTPException(status_code=401, detail="No matching JWKS key")
            payload = jwt.decode(
                token,
                jwk_key,
                algorithms=["RS256", "ES256"],
                issuer=SUPABASE_ISSUER,
                options=decode_options,
            )
        elif alg and alg.startswith("HS"):
            if not SUPABASE_JWT_SECRET:
                raise HTTPException(status_code=401, detail="JWT secret not configured")
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                issuer=SUPABASE_ISSUER,
                options=decode_options,
            )
        else:
            raise HTTPException(status_code=401, detail="Unsupported token algorithm")

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        logger.info(f"✅ Authenticated user: {email} ({user_id})")

        return {
            "user_id": user_id,
            "email": email,
            "role": payload.get("role", "authenticated"),
            "payload": payload,
        }

    except JWTError as e:
        logger.warning(f"❌ JWT validation error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Dependency injection function for FastAPI endpoints
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            return {"user_id": user["user_id"]}
    """
    return verify_token(credentials)


# Optional: Extract user_id directly
def get_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Get only the user_id from token
    
    Usage:
        @app.post("/data")
        async def create_data(user_id: str = Depends(get_user_id)):
            # Save data with user_id
            pass
    """
    user = verify_token(credentials)
    return user["user_id"]
