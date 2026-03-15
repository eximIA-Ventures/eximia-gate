export const GATE_CONTRACT_VERSION = "v1";
export const GATE_APP_NAME = "eximia-gate";
export const GATE_APP_VERSION = "1.0.0";

export interface GateContractSpec {
  app: string;
  version: string;
  contract: string;
  auth_methods: string[];
  features: string[];
  endpoints: GateEndpoint[];
  registered_apps: RegisteredApp[];
  scopes: string[];
  token: TokenSpec;
}

export interface GateEndpoint {
  method: string;
  path: string;
  description: string;
  auth_required: boolean;
  admin_only: boolean;
}

export interface RegisteredApp {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
}

export interface TokenSpec {
  type: "JWT";
  algorithm: "HS256";
  access_token_ttl: string;
  refresh_token_ttl: string;
  payload_fields: string[];
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: "user" | "admin";
  apps: string[];
  scopes: string[];
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  apps: string[];
  created_at: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export const CONTRACT_SPEC: GateContractSpec = {
  app: GATE_APP_NAME,
  version: GATE_APP_VERSION,
  contract: `eximia-gate/${GATE_CONTRACT_VERSION}`,
  auth_methods: ["email_password"],
  features: ["sso", "rbac", "app_access_control", "unified_profile"],
  endpoints: [
    { method: "POST", path: "/api/v1/gate/register", description: "Register new user", auth_required: false, admin_only: false },
    { method: "POST", path: "/api/v1/gate/login", description: "Authenticate and receive JWT", auth_required: false, admin_only: false },
    { method: "POST", path: "/api/v1/gate/verify", description: "Verify token — returns user + scopes + apps", auth_required: false, admin_only: false },
    { method: "POST", path: "/api/v1/gate/refresh", description: "Refresh expired token", auth_required: false, admin_only: false },
    { method: "GET", path: "/api/v1/gate/catalog", description: "Gate capabilities and registered apps", auth_required: false, admin_only: false },
    { method: "GET", path: "/api/v1/gate/profile/:id", description: "Get user profile with app access", auth_required: true, admin_only: false },
    { method: "PUT", path: "/api/v1/gate/profile/:id", description: "Update user profile", auth_required: true, admin_only: false },
    { method: "GET", path: "/api/v1/gate/apps", description: "List registered apps", auth_required: true, admin_only: true },
    { method: "POST", path: "/api/v1/gate/apps", description: "Register new app", auth_required: true, admin_only: true },
    { method: "PUT", path: "/api/v1/gate/apps/:id", description: "Update app", auth_required: true, admin_only: true },
    { method: "PUT", path: "/api/v1/gate/apps/:id/access", description: "Grant/revoke user access to app", auth_required: true, admin_only: true },
  ],
  registered_apps: [],
  scopes: ["read", "write", "admin"],
  token: {
    type: "JWT",
    algorithm: "HS256",
    access_token_ttl: "1h",
    refresh_token_ttl: "30d",
    payload_fields: ["sub", "email", "name", "role", "apps", "scopes", "iat", "exp"],
  },
};
