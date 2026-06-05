
-- Driver applications table
CREATE TABLE IF NOT EXISTS driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  vehicle_plate text,
  vehicle_type text DEFAULT 'sedan',
  completed_count integer DEFAULT 0,
  carbon_kg numeric(10,2) DEFAULT 0,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE driver_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_driver_applications" ON driver_applications FOR SELECT TO anon USING (true);
CREATE POLICY "insert_driver_applications" ON driver_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_driver_applications" ON driver_applications FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_driver_applications" ON driver_applications FOR DELETE TO anon USING (true);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  driver_id text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('requester', 'driver')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_chat_messages" ON chat_messages FOR SELECT TO anon USING (true);
CREATE POLICY "insert_chat_messages" ON chat_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_chat_messages" ON chat_messages FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_chat_messages" ON chat_messages FOR DELETE TO anon USING (true);

-- Carbon records table
CREATE TABLE IF NOT EXISTS carbon_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  driver_id text NOT NULL,
  distance_km numeric(8,2) NOT NULL,
  vehicle_type text NOT NULL,
  carbon_saved_kg numeric(8,3) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE carbon_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_carbon_records" ON carbon_records FOR SELECT TO anon USING (true);
CREATE POLICY "insert_carbon_records" ON carbon_records FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_carbon_records" ON carbon_records FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_carbon_records" ON carbon_records FOR DELETE TO anon USING (true);

-- Safe numbers table
CREATE TABLE IF NOT EXISTS safe_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_phone text NOT NULL,
  safe_number text NOT NULL UNIQUE,
  post_id text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);
ALTER TABLE safe_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_safe_numbers" ON safe_numbers FOR SELECT TO anon USING (true);
CREATE POLICY "insert_safe_numbers" ON safe_numbers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_safe_numbers" ON safe_numbers FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_safe_numbers" ON safe_numbers FOR DELETE TO anon USING (true);
