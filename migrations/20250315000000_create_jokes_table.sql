-- Create jokes table
CREATE TABLE IF NOT EXISTS jokes (
    id SERIAL PRIMARY KEY,
    joke_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
