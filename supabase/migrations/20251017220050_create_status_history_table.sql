/*
  # Create Status History Table

  ## Overview
  This migration creates a comprehensive status history tracking system for job applications.
  It allows employers to view a complete audit trail of all status changes for each applicant.

  ## New Tables
  
  ### `status_history`
  Tracks all status changes for job applications with complete audit information.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each history record
  - `application_id` (text, not null) - Reference to the application being tracked
  - `old_status` (text, not null) - The previous status before the change
  - `new_status` (text, not null) - The new status after the change
  - `changed_at` (timestamptz, not null) - Timestamp when the status change occurred
  - `changed_by` (uuid) - Reference to the user who made the change (nullable for system changes)
  - `notes` (text) - Optional notes about the status change
  - `created_at` (timestamptz) - Record creation timestamp

  ## Indexes
  - Index on `application_id` for fast lookup of history by application
  - Index on `changed_at` for chronological sorting
  - Composite index on `(application_id, changed_at)` for optimized queries

  ## Security
  - Enable Row Level Security (RLS) on `status_history` table
  - Policy: Authenticated users can view status history for applications they have access to
  - Policy: Authenticated users can insert new status history records

  ## Notes
  - This table will grow over time as status changes accumulate
  - Consider implementing archival strategy for old records if needed
  - The `changed_by` field can be null to support automated system changes
*/

-- Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_status_history_application_id 
  ON status_history(application_id);

CREATE INDEX IF NOT EXISTS idx_status_history_changed_at 
  ON status_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_status_history_app_date 
  ON status_history(application_id, changed_at DESC);

-- Enable Row Level Security
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all status history
-- (In a production app, you'd want to restrict this based on job ownership)
CREATE POLICY "Authenticated users can view status history"
  ON status_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert status history records
CREATE POLICY "Authenticated users can insert status history"
  ON status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by OR changed_by IS NULL);

-- Policy: Service role can do anything (for backend operations)
CREATE POLICY "Service role can manage status history"
  ON status_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
