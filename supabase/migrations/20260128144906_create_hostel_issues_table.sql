/*
  # Create Hostel Issues Table

  1. New Tables
    - `hostel_issues`
      - `id` (uuid, primary key) - Unique identifier for each issue
      - `student_name` (text) - Name of the student submitting the issue
      - `description` (text) - Description of the hostel issue
      - `status` (text) - Status of the issue (pending/resolved)
      - `created_at` (timestamptz) - Timestamp when issue was created
      - `updated_at` (timestamptz) - Timestamp when issue was last updated

  2. Security
    - Enable RLS on `hostel_issues` table
    - Add policy for public to read all issues (for real-time updates)
    - Add policy for public to insert new issues (student submissions)
    - Add policy for public to update issues (admin marking as resolved)

  Note: This is a simple public access system since the app uses localStorage
  for role management without Supabase authentication.
*/

CREATE TABLE IF NOT EXISTS hostel_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hostel_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hostel issues"
  ON hostel_issues
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit hostel issues"
  ON hostel_issues
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update hostel issues"
  ON hostel_issues
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS hostel_issues_status_idx ON hostel_issues(status);
CREATE INDEX IF NOT EXISTS hostel_issues_created_at_idx ON hostel_issues(created_at DESC);