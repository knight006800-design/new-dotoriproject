CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  product TEXT NOT NULL,
  product_images JSONB DEFAULT '[]',
  fee INTEGER NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'escrow',
  from_area TEXT NOT NULL DEFAULT '',
  to_area TEXT NOT NULL DEFAULT '',
  from_detail TEXT DEFAULT '',
  to_detail TEXT DEFAULT '',
  receiver_phone TEXT DEFAULT '',
  receive_method TEXT NOT NULL DEFAULT 'direct',
  receive_method_detail TEXT DEFAULT '',
  pickup_window TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  ai_estimate TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  cautions JSONB DEFAULT '[]',
  requester_name TEXT DEFAULT '',
  requester_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_posts" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "public_insert_posts" ON posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_posts" ON posts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_posts" ON posts FOR DELETE TO anon USING (true);
