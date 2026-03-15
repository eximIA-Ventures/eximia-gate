-- eximIA Gate — Database Schema Reference
-- This file serves as reference for Supabase migrations.
-- The app currently uses an in-memory store (lib/db/store.ts).

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Registered Apps
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🔗',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User ↔ App access control
CREATE TABLE user_app_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  UNIQUE(user_id, app_id)
);

-- Auth logs
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'register', 'verify', 'refresh', 'logout')),
  ip TEXT NOT NULL DEFAULT '0.0.0.0',
  user_agent TEXT NOT NULL DEFAULT '',
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_access_user ON user_app_access(user_id);
CREATE INDEX idx_access_app ON user_app_access(app_id);
CREATE INDEX idx_logs_user ON auth_logs(user_id);
CREATE INDEX idx_logs_created ON auth_logs(created_at DESC);
