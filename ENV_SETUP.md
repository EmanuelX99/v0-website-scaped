# Frontend Environment Variables Setup

## Required Variables:

Create a `.env.local` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## How to get the Anon Key:

1. Go to: https://supabase.com/dashboard/project/kljyofskcpwcmrlgiwxz/settings/api
2. Copy the **"anon"** or **"public"** key (NOT the service_role key!)
3. Paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
4. Restart frontend: `npm run dev`

## Also needed in Backend:

Add to `backend/.env`:

```bash
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

Get JWT Secret from: https://supabase.com/dashboard/project/kljyofskcpwcmrlgiwxz/settings/api
(Scroll down to "JWT Secret")
