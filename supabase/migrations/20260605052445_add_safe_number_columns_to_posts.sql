
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS receiver_safe_phone text,
  ADD COLUMN IF NOT EXISTS requester_safe_phone text,
  ADD COLUMN IF NOT EXISTS use_safe_number boolean DEFAULT false;
