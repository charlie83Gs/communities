-- Add homepage pinning fields to forum_threads table
ALTER TABLE forum_threads
ADD COLUMN is_pinned_to_homepage BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN homepage_pin_priority INTEGER DEFAULT 0 NOT NULL;
