-- Add Apify/scraping columns to fuentes table
ALTER TABLE fuentes
  ADD COLUMN IF NOT EXISTS url        TEXT,
  ADD COLUMN IF NOT EXISTS tipo       TEXT NOT NULL DEFAULT 'facebook',
  ADD COLUMN IF NOT EXISTS activo     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_posts  INTEGER NOT NULL DEFAULT 50;
