/*
  # Rush Working Database Schema

  1. New Tables
    - `profiles` - Extended user profile information
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `phone` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `age` (integer)
      - `gender` (text)
      - `is_veteran` (boolean)
      - `is_citizen` (boolean)
      - `highest_degree` (text)
      - `has_criminal_record` (boolean)
      - `profile_picture` (text)
      - `bio` (text)
      - `skills` (text array)
      - `points` (integer, default 50)
      - `is_employer` (boolean, default false)
      - `is_verified` (boolean, default false)
      - `company_name` (text)
      - `company_id` (text)
      - `company_location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `jobs` - Job postings
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `type` (text)
      - `salary_min` (integer)
      - `salary_max` (integer)
      - `description` (text)
      - `requirements` (text array)
      - `experience_level` (text)
      - `education_level` (text)
      - `minimum_points` (integer)
      - `is_event` (boolean, default false)
      - `event_date` (timestamp)
      - `requires_application` (boolean, default true)
      - `featured` (boolean, default false)
      - `posted_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `applications` - Job applications
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `user_id` (uuid, references profiles)
      - `resume_id` (uuid, references resumes)
      - `points_used` (integer)
      - `added_points` (integer, default 0)
      - `status` (text, default 'pending')
      - `response` (text)
      - `has_direct_message` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `resumes` - Resume files
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `file_name` (text)
      - `file_size` (integer)
      - `file_url` (text)
      - `folder_id` (text, default 'uncategorized')
      - `is_default` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `resume_folders` - Resume organization folders
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `sort_by` (text, default 'date')
      - `sort_order` (text, default 'desc')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `points_history` - Points transaction history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) -- 'earned' or 'spent'
      - `amount` (integer)
      - `description` (text)
      - `category` (text)
      - `related_job_id` (uuid, references jobs, nullable)
      - `created_at` (timestamp)

    - `companies` - Verified companies
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `address` (text)
      - `verification_status` (text, default 'pending')
      - `verified_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for employers to manage their job postings
    - Add policies for public read access to jobs and events

  3. Functions
    - Trigger to update updated_at timestamps
    - Function to handle new user registration
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text,
  first_name text,
  last_name text,
  age integer,
  gender text,
  is_veteran boolean DEFAULT false,
  is_citizen boolean DEFAULT false,
  highest_degree text,
  has_criminal_record boolean DEFAULT false,
  profile_picture text,
  bio text,
  skills text[] DEFAULT '{}',
  points integer DEFAULT 50,
  is_employer boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  company_name text,
  company_id text,
  company_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  address text NOT NULL,
  verification_status text DEFAULT 'pending',
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  experience_level text NOT NULL,
  education_level text NOT NULL,
  minimum_points integer DEFAULT 0,
  is_event boolean DEFAULT false,
  event_date timestamptz,
  requires_application boolean DEFAULT true,
  featured boolean DEFAULT false,
  posted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resume_folders table
CREATE TABLE IF NOT EXISTS resume_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_by text DEFAULT 'date',
  sort_order text DEFAULT 'desc',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  folder_id text DEFAULT 'uncategorized',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id),
  points_used integer DEFAULT 0,
  added_points integer DEFAULT 0,
  status text DEFAULT 'pending',
  response text,
  has_direct_message boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create points_history table
CREATE TABLE IF NOT EXISTS points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'earned' or 'spent'
  amount integer NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  related_job_id uuid REFERENCES jobs(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can read verified companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (verification_status = 'verified');

CREATE POLICY "Verified users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_verified = true
  ));

-- Jobs policies
CREATE POLICY "Anyone can read jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Verified employers can insert jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_verified = true AND is_employer = true
  ));

CREATE POLICY "Job owners can update their jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY "Job owners can delete their jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());

-- Resume folders policies
CREATE POLICY "Users can manage own resume folders"
  ON resume_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Resumes policies
CREATE POLICY "Users can manage own resumes"
  ON resumes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Applications policies
CREATE POLICY "Users can read own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Job owners can read applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = job_id AND posted_by = auth.uid()
  ));

-- Points history policies
CREATE POLICY "Users can read own points history"
  ON points_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own points history"
  ON points_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER resume_folders_updated_at
  BEFORE UPDATE ON resume_folders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, points)
  VALUES (NEW.id, NEW.email, 50);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_is_event ON jobs(is_event);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_folders_user_id ON resume_folders(user_id);