-- Sauna App - Supabase schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups (Ženy, Muži)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  visit_day INTEGER NOT NULL, -- 0=Ne,1=Po,2=Út,3=St,4=Čt,5=Pá,6=So
  poll_day INTEGER NOT NULL,  -- day before visit
  manager_phone TEXT,         -- phone for SMS when 6+ confirm
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id)
);

-- Sessions (one per sauna day)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sms_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, date)
);

-- Poll responses (přijdu / nepřijdu)
CREATE TABLE poll_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  coming BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id)
);

-- Visits recorded by QR check-in
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id)
);

-- RLS: disable for simplicity (community app, no sensitive data)
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;

-- Seed: two groups
INSERT INTO groups (name, slug, visit_day, poll_day) VALUES
  ('Ženy', 'zeny', 4, 3),  -- čtvrtek (4), anketa ve středu (3)
  ('Muži', 'muzi', 5, 4);  -- pátek (5), anketa ve čtvrtek (4)

-- Seed: women's members (Katka is admin)
WITH g AS (SELECT id FROM groups WHERE slug = 'zeny')
INSERT INTO members (group_id, name, is_admin)
SELECT g.id, m.name, m.is_admin FROM g,
  (VALUES ('Katka', true), ('Hanka', false), ('Eva', false),
          ('Zdena', false), ('Dáša', false), ('Hana', false),
          ('Magda', false)) AS m(name, is_admin);
