/*
# Create request_logs table for ULIP API request history

1. New Tables
- `request_logs`
  - `id` (uuid, primary key)
  - `module` (text) - which module was used (e.g. "FOIS 01", "FOIS 02", "FOIS 04")
  - `endpoint` (text) - the API endpoint called
  - `method` (text) - HTTP method (GET, POST)
  - `params` (jsonb) - request parameters
  - `status` (text) - "success" or "error"
  - `latency_ms` (integer) - response time in milliseconds
  - `response_summary` (text) - brief summary of the response
  - `created_at` (timestamptz) - when the request was made
2. Indexes
  - Index on `created_at` for time-based queries
  - Index on `module` for filtering by module
3. Security
  - Enable RLS on `request_logs`.
  - Single-tenant no-auth app: allow anon + authenticated full CRUD (data is intentionally shared).
*/

CREATE TABLE IF NOT EXISTS request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  params jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'success',
  latency_ms integer,
  response_summary text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_module ON request_logs (module);

ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_request_logs" ON request_logs;
CREATE POLICY "anon_select_request_logs" ON request_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_request_logs" ON request_logs;
CREATE POLICY "anon_insert_request_logs" ON request_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_request_logs" ON request_logs;
CREATE POLICY "anon_update_request_logs" ON request_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_request_logs" ON request_logs;
CREATE POLICY "anon_delete_request_logs" ON request_logs FOR DELETE
  TO anon, authenticated USING (true);
