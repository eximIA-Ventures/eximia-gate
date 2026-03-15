import type { User, App, UserAppAccess, AuthLog } from "./types";
import { hashSync } from "bcryptjs";

function uuid(): string {
  return crypto.randomUUID();
}

const now = new Date().toISOString();

const SEED_APPS: App[] = [
  { id: uuid(), slug: "academy", name: "eximIA Academy", url: "https://academy.eximiaventures.com.br", description: "Plataforma de ensino multi-tenant", icon: "🎓", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "forms", name: "eximIA Forms", url: "https://forms.eximiaventures.com.br", description: "Formulários inteligentes com IA", icon: "📝", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "profiler", name: "eximIA Profiler", url: "https://profiler.eximiaventures.com.br", description: "Avaliações psicométricas", icon: "🧠", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "maps", name: "eximIA Maps", url: "https://maps.eximiaventures.com.br", description: "Mapas mentais com IA", icon: "🗺️", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "hub", name: "eximIA Hub", url: "https://hub.eximiaventures.com.br", description: "Contrato universal de integração", icon: "🔗", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "content-platform", name: "Content Platform", url: "https://content.eximiaventures.com.br", description: "Hub de conteúdo editorial", icon: "📰", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "work-timer", name: "Work Timer", url: "https://timer.eximiaventures.com.br", description: "Tracking de horas", icon: "⏱️", status: "active", created_at: now, updated_at: now },
  { id: uuid(), slug: "news-dashboard", name: "News Dashboard", url: "https://news.eximiaventures.com.br", description: "Monitoramento de notícias", icon: "📊", status: "active", created_at: now, updated_at: now },
];

const adminId = uuid();

const SEED_USERS: User[] = [
  {
    id: adminId,
    email: "hugo.capitelli@eximiaventures.com.br",
    password_hash: hashSync("Eximia@@171227", 10),
    name: "Hugo Capitelli",
    role: "admin",
    avatar_url: null,
    created_at: now,
    updated_at: now,
    last_login: null,
  },
];

const SEED_ACCESS: UserAppAccess[] = SEED_APPS.map((app) => ({
  id: uuid(),
  user_id: adminId,
  app_id: app.id,
  granted_at: now,
  granted_by: "system",
  status: "active" as const,
}));

class InMemoryStore {
  users: User[] = [...SEED_USERS];
  apps: App[] = [...SEED_APPS];
  access: UserAppAccess[] = [...SEED_ACCESS];
  logs: AuthLog[] = [];
  refreshTokens: Map<string, string> = new Map(); // token -> userId

  // Users
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(data: Omit<User, "id" | "created_at" | "updated_at" | "last_login">): User {
    const user: User = { ...data, id: uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_login: null };
    this.users.push(user);
    return user;
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...data, updated_at: new Date().toISOString() };
    return this.users[idx];
  }

  getAllUsers(): User[] {
    return this.users;
  }

  // Apps
  findAppById(id: string): App | undefined {
    return this.apps.find((a) => a.id === id);
  }

  findAppBySlug(slug: string): App | undefined {
    return this.apps.find((a) => a.slug === slug);
  }

  getAllApps(): App[] {
    return this.apps;
  }

  createApp(data: Omit<App, "id" | "created_at" | "updated_at">): App {
    const app: App = { ...data, id: uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.apps.push(app);
    return app;
  }

  updateApp(id: string, data: Partial<App>): App | undefined {
    const idx = this.apps.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.apps[idx] = { ...this.apps[idx], ...data, updated_at: new Date().toISOString() };
    return this.apps[idx];
  }

  // Access
  getUserApps(userId: string): App[] {
    const appIds = this.access.filter((a) => a.user_id === userId && a.status === "active").map((a) => a.app_id);
    return this.apps.filter((a) => appIds.includes(a.id) && a.status === "active");
  }

  getUserAppSlugs(userId: string): string[] {
    return this.getUserApps(userId).map((a) => a.slug);
  }

  grantAccess(userId: string, appId: string, grantedBy: string): UserAppAccess {
    const existing = this.access.find((a) => a.user_id === userId && a.app_id === appId);
    if (existing) {
      existing.status = "active";
      existing.granted_at = new Date().toISOString();
      existing.granted_by = grantedBy;
      return existing;
    }
    const access: UserAppAccess = { id: uuid(), user_id: userId, app_id: appId, granted_at: new Date().toISOString(), granted_by: grantedBy, status: "active" };
    this.access.push(access);
    return access;
  }

  revokeAccess(userId: string, appId: string): boolean {
    const existing = this.access.find((a) => a.user_id === userId && a.app_id === appId);
    if (!existing) return false;
    existing.status = "revoked";
    return true;
  }

  getAppUsers(appId: string): { user: User; access: UserAppAccess }[] {
    return this.access
      .filter((a) => a.app_id === appId)
      .map((a) => ({ user: this.findUserById(a.user_id)!, access: a }))
      .filter((a) => a.user);
  }

  getUserAccessList(userId: string): { app: App; access: UserAppAccess }[] {
    return this.access
      .filter((a) => a.user_id === userId)
      .map((a) => ({ app: this.findAppById(a.app_id)!, access: a }))
      .filter((a) => a.app);
  }

  // Logs
  addLog(data: Omit<AuthLog, "id" | "created_at">): AuthLog {
    const log: AuthLog = { ...data, id: uuid(), created_at: new Date().toISOString() };
    this.logs.unshift(log);
    if (this.logs.length > 1000) this.logs.pop();
    return log;
  }

  getLogs(limit = 50, filters?: { action?: string; user_id?: string; success?: boolean }): AuthLog[] {
    let result = this.logs;
    if (filters?.action) result = result.filter((l) => l.action === filters.action);
    if (filters?.user_id) result = result.filter((l) => l.user_id === filters.user_id);
    if (filters?.success !== undefined) result = result.filter((l) => l.success === filters.success);
    return result.slice(0, limit);
  }

  // Refresh tokens
  storeRefreshToken(token: string, userId: string): void {
    this.refreshTokens.set(token, userId);
  }

  validateRefreshToken(token: string): string | undefined {
    return this.refreshTokens.get(token);
  }

  revokeRefreshToken(token: string): void {
    this.refreshTokens.delete(token);
  }
}

export const store = new InMemoryStore();
