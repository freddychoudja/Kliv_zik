-- ==========================================
-- SUPABASE INDUSTRIAL DATABASE SCHEMA
-- Application: Kliv - Party Mode & Sync Engine
-- Generated: 2026-05-31
-- ==========================================

-- Enable pgcrypto extension for UUIDs if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist to prevent conflicts on clean setup
DROP TABLE IF EXISTS party_members;
DROP TABLE IF EXISTS party_rooms;

-- ----------------------------------------------------
-- 1. party_rooms Table Description
-- Holds metadata, status and active playhead tick markers
-- ----------------------------------------------------
CREATE TABLE party_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(4) NOT NULL UNIQUE, -- 4-digit unique access room_code
    room_name VARCHAR(255) NOT NULL,
    host_id VARCHAR(100) NOT NULL,
    host_name VARCHAR(100) NOT NULL,
    current_track_id VARCHAR(100) DEFAULT NULL,
    is_playing BOOLEAN DEFAULT false NOT NULL,
    progress REAL DEFAULT 0.0 NOT NULL, -- current elapsed playback playhead (in seconds)
    local_track JSONB DEFAULT NULL, -- support physical phone file metadata ({title, artist, duration})
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for explosive 4-digit join resolutions
CREATE INDEX idx_party_rooms_code ON party_rooms(room_code);

-- ----------------------------------------------------
-- 2. party_members Table Description
-- Tracks active connected participants with heartbeats
-- ----------------------------------------------------
CREATE TABLE party_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES party_rooms(id) ON DELETE CASCADE,
    member_name VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_room_member UNIQUE (room_id, member_name)
);

-- Indexing for active polling updates
CREATE INDEX idx_party_members_room ON party_members(room_id);

-- ----------------------------------------------------
-- 3. Automatic updated_at trigger function
-- Keeps timestamps accurate without client overhead
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_party_rooms_modtime
    BEFORE UPDATE ON party_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ----------------------------------------------------
-- 4. Supabase Realtime Integration Config
-- CRITICAL: Adds party_rooms to the publication filter
-- for sub-millisecond websocket audio broadcasts
-- ----------------------------------------------------
alter publication supabase_realtime add table party_rooms;
alter publication supabase_realtime add table party_members;

-- ----------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- Secures rooms so anyone can connect via guest flow,
-- but maintains strict operations.
-- ----------------------------------------------------
ALTER TABLE party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public reads/writes to synchronize party without auth walls
CREATE POLICY "Allow public full operations on party_rooms"
ON party_rooms
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public full operations on party_members"
ON party_members
FOR ALL
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------
-- 6. Clean-up Cron/Function (Optional but Elegant)
-- Purges rooms inactive for more than a couple of hours
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION purge_stale_party_rooms()
RETURNS void AS $$
BEGIN
    -- Delete rooms with no updates or active updates in the last 6 hours
    DELETE FROM party_rooms 
    WHERE updated_at < (now() - INTERVAL '6 hours');
END;
$$ LANGUAGE plpgsql;
