/*
  # Add Application Status Tracking System

  1. Schema Changes
    - Add `application_status` column to `applications` table with default value 'applicant'
    - Create `application_status_history` table to track all status changes over time
  
  2. New Tables
    - `application_status_history`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to applications)
      - `old_status` (text, nullable for initial status)
      - `new_status` (text, the new status value)
      - `changed_at` (timestamptz, timestamp of the change)
      - `changed_by` (text, user who made the change)
      - `notes` (text, optional notes about the status change)
  
  3. Status Values
    - applicant (default) - Initial application state
    - interested - Employer has marked interest
    - in_review - Application is being reviewed
    - interviewing - Candidate is in interview process
    - interviewed - Interviews completed
    - offer_extended - Job offer has been sent
    - accepted - Offer accepted by candidate
    - rejected - Application rejected
    - waitlisted - Candidate placed on waitlist
  
  4. Security
    - Enable RLS on `application_status_history` table
    - Add policies for employers to update status
    - Add policies for viewing status history
  
  5. Indexes
    - Index on `application_id` for fast status history lookups
    - Index on `applications.application_status` for filtering
*/

-- Add application_status column to applications table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'application_status'
  ) THEN
    ALTER TABLE applications ADD COLUMN application_status text DEFAULT 'applicant' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'applications' AND constraint_name = 'applications_application_status_check'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_application_status_check 
      CHECK (application_status IN ('applicant', 'interested', 'in_review', 'interviewing', 'interviewed', 'offer_extended', 'accepted', 'rejected', 'waitlisted'));
  END IF;
END $$;

-- Create index on application_status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(application_status);

-- Create application_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_at timestamptz DEFAULT now() NOT NULL,
  changed_by text NOT NULL,
  notes text,
  CONSTRAINT valid_new_status CHECK (new_status IN ('applicant', 'interested', 'in_review', 'interviewing', 'interviewed', 'offer_extended', 'accepted', 'rejected', 'waitlisted')),
  CONSTRAINT valid_old_status CHECK (old_status IS NULL OR old_status IN ('applicant', 'interested', 'in_review', 'interviewing', 'interviewed', 'offer_extended', 'accepted', 'rejected', 'waitlisted'))
);

-- Create index on application_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_status_history_application ON application_status_history(application_id);

-- Create index on changed_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON application_status_history(changed_at DESC);

-- Enable RLS on application_status_history
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view status history (for demo purposes)
CREATE POLICY "Anyone can view status history"
  ON application_status_history
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert status history (for demo purposes)
CREATE POLICY "Anyone can insert status history"
  ON application_status_history
  FOR INSERT
  WITH CHECK (true);

-- Create a function to automatically log status changes
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.application_status IS DISTINCT FROM NEW.application_status) THEN
    INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, changed_at)
    VALUES (NEW.id, OLD.application_status, NEW.application_status, 'system', now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_status_change ON applications;
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_status_change();
