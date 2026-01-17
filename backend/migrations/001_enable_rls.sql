-- =====================================================
-- SUPABASE RLS (Row Level Security) Migration
-- Phase 8: Authentication & Security
-- =====================================================

-- Step 1: Add user_id column to analyses table
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Set default value to current user (for new inserts)
ALTER TABLE analyses 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Step 3: Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if any (cleanup)
DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

-- Step 5: Create RLS Policies

-- Policy 1: Users can SELECT (view) only their own analyses
CREATE POLICY "Users can view their own analyses"
ON analyses
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own analyses
CREATE POLICY "Users can insert their own analyses"
ON analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE only their own analyses
CREATE POLICY "Users can update their own analyses"
ON analyses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE only their own analyses
CREATE POLICY "Users can delete their own analyses"
ON analyses
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- Verification Queries (Run these to check)
-- =====================================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'analyses';

-- Check all policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'analyses';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. This migration enables RLS on the 'analyses' table
-- 2. Users can ONLY see/edit/delete their OWN data
-- 3. The user_id column is automatically set via auth.uid()
-- 4. Run this in Supabase SQL Editor
-- 5. Test with: SELECT * FROM analyses; (should be empty until you insert with auth)
