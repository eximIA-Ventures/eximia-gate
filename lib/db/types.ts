export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface UserAppAccess {
  id: string;
  user_id: string;
  app_id: string;
  granted_at: string;
  granted_by: string;
  status: "active" | "revoked";
}

export interface AuthLog {
  id: string;
  user_id: string | null;
  action: "login" | "register" | "verify" | "refresh" | "logout";
  ip: string;
  user_agent: string;
  success: boolean;
  created_at: string;
}
