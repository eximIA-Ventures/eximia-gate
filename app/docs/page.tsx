"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Rocket,
  Code2,
  Shield,
  Terminal,
  Puzzle,
  AlertTriangle,
  AppWindow,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded bg-elevated/80 hover:bg-elevated text-muted hover:text-primary transition-colors"
      title="Copiar"
    >
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <CopyButton text={code} />
      <pre className="!mt-0 !rounded-md overflow-x-auto">
        <code className={lang ? `language-${lang}` : ""}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-sage/20 text-sage",
    POST: "bg-accent/20 text-accent",
    PUT: "bg-warning/20 text-warning",
    DELETE: "bg-danger/20 text-danger",
  };

  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${colors[method] || "bg-muted/20 text-muted"}`}>
      {method}
    </span>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full text-left mb-5 group"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
        )}
        {Icon && <Icon className="w-4 h-4 text-accent" />}
        <h2 className="font-display text-xl font-semibold text-primary group-hover:text-accent transition-colors">
          {title}
        </h2>
      </button>
      {open && <div className="pl-6">{children}</div>}
    </section>
  );
}

function StepHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
        {num}
      </span>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
    </div>
  );
}

/* ─── Code Snippets ─── */

const ENV_CODE = `# .env.local
GATE_URL=http://localhost:3011
NEXT_PUBLIC_GATE_URL=http://localhost:3011`;

const GATE_LIB_CODE = `// lib/gate.ts
// eximIA Gate integration — contract v1
// Troque APP_SLUG pelo slug do seu app registrado no Gate

const GATE_URL = process.env.GATE_URL || process.env.NEXT_PUBLIC_GATE_URL || "http://localhost:3011";
const APP_SLUG = "YOUR_APP_SLUG"; // ← TROCAR: academy, forms, profiler, etc.

// ─── Types ───

export interface GateUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  apps: string[];
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: GateUser;
}

export interface VerifyResponse {
  user: GateUser;
  scopes: string[];
  apps_allowed: string[];
}

// ─── Client-side: Auth actions ───

export async function gateLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(\`\${GATE_URL}/api/v1/gate/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function gateRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(\`\${GATE_URL}/api/v1/gate/register\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function gateRefresh(refresh_token: string): Promise<{ token: string; refresh_token: string }> {
  const res = await fetch(\`\${GATE_URL}/api/v1/gate/refresh\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Refresh failed");
  return data;
}

// ─── Client-side: Token management (localStorage) ───

export function saveAuth(data: AuthResponse): void {
  localStorage.setItem("gate_token", data.token);
  localStorage.setItem("gate_refresh", data.refresh_token);
  localStorage.setItem("gate_user", JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gate_token");
}

export function getUser(): GateUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("gate_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem("gate_token");
  localStorage.removeItem("gate_refresh");
  localStorage.removeItem("gate_user");
}

export async function getValidToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn < 5 * 60 * 1000) {
      const refresh = localStorage.getItem("gate_refresh");
      if (!refresh) return null;
      try {
        const data = await gateRefresh(refresh);
        localStorage.setItem("gate_token", data.token);
        localStorage.setItem("gate_refresh", data.refresh_token);
        return data.token;
      } catch {
        logout();
        return null;
      }
    }
    return token;
  } catch {
    return token;
  }
}

// ─── Server-side: Protect API routes ───

export async function withGateAuth(req: Request): Promise<
  { user: VerifyResponse["user"]; scopes: string[]; error?: never } |
  { user?: never; scopes?: never; error: Response }
> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: Response.json({ error: "Missing authorization", code: "UNAUTHORIZED" }, { status: 401 }) };
  }
  try {
    const res = await fetch(\`\${GATE_URL}/api/v1/gate/verify\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: authHeader.slice(7) }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { error: Response.json({ error: "Invalid token", code: "INVALID_TOKEN" }, { status: 401 }) };
    }
    const data: VerifyResponse = await res.json();
    if (!data.apps_allowed.includes(APP_SLUG)) {
      return { error: Response.json({ error: "No access to this app", code: "APP_ACCESS_DENIED" }, { status: 403 }) };
    }
    return { user: data.user, scopes: data.scopes };
  } catch {
    return { error: Response.json({ error: "Gate unavailable", code: "GATE_UNAVAILABLE" }, { status: 503 }) };
  }
}`;

const LOGIN_PAGE_CODE = `// app/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { gateLogin, saveAuth } from "@/lib/gate";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await gateLogin(email, password);
      saveAuth(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="Senha" required />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}`;

const PROTECT_ROUTE_CODE = `// app/api/minha-rota-protegida/route.ts
import { withGateAuth } from "@/lib/gate";

export async function GET(req: Request) {
  const auth = await withGateAuth(req);
  if (auth.error) return auth.error;

  // auth.user disponível: { id, email, name, role, apps }
  // auth.scopes disponível: ["read", "write"]
  return Response.json({
    message: \`Olá \${auth.user.name}\`,
    role: auth.user.role,
  });
}`;

const PROTECT_PAGE_CODE = `// Em qualquer página "use client" protegida
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser } from "@/lib/gate";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const user = getUser();
  if (!user) return null;

  return <div>Bem-vindo, {user.name}</div>;
}`;

const FETCH_WITH_TOKEN_CODE = `// Chamada autenticada a partir do client
import { getValidToken, logout } from "@/lib/gate";

async function fetchData() {
  const token = await getValidToken(); // auto-refresh se expirado
  if (!token) {
    logout();
    window.location.href = "/login";
    return;
  }

  const res = await fetch("/api/minha-rota-protegida", {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  return res.json();
}`;

const EXISTING_LOGIN_CODE = `// Se seu app JÁ tem um form de login, troque apenas o handler:

// ❌ Antes (auth local):
const res = await fetch("/api/auth/login", { method: "POST", body: ... });

// ✅ Depois (Gate):
import { gateLogin, saveAuth } from "@/lib/gate";

const data = await gateLogin(email, password);
saveAuth(data);
router.push("/dashboard");`;

const AUTH_FLOW = `┌──────────┐      ┌──────────┐      ┌──────────┐
│  Usuário │      │   Gate   │      │ Seu App  │
│ (Browser)│      │  Server  │      │  Server  │
└────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │
     │  1. POST /login (email, senha)     │
     │────────────────>│                  │
     │                 │                  │
     │  2. JWT + refresh token            │
     │<────────────────│                  │
     │                 │                  │
     │  3. Request com Authorization: Bearer <token>
     │───────────────────────────────────>│
     │                 │                  │
     │                 │  4. POST /verify │
     │                 │<─────────────────│
     │                 │                  │
     │                 │  5. user + apps  │
     │                 │─────────────────>│
     │                 │                  │
     │  6. Resposta (autorizado)          │
     │<───────────────────────────────────│`;

export default function DocsPage() {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/eximia-horizontal.svg" alt="eximIA" width={120} height={28} className="opacity-90" style={{ width: "auto", height: "auto", maxWidth: 120 }} />
            <div className="h-5 w-px bg-[rgba(232,224,213,0.08)]" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Gate</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <a href="/api/spec" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors flex items-center gap-1">
              API Spec <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors flex items-center gap-1">
              LLM Spec <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <NavDropdown />
          </nav>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <h1 className="font-display text-3xl font-bold">Documentação</h1>
        </div>
        <p className="text-sm text-secondary mb-10">
          Tudo que você precisa para integrar seu app ao ecossistema eximIA via Gate.
        </p>

        {/* Table of Contents */}
        <nav className="glass-panel rounded-md p-5 mb-12">
          <p className="text-[10px] text-muted uppercase tracking-wider mb-3">Conteúdo</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "overview", label: "Overview", icon: BookOpen },
              { id: "integration", label: "Guia de Integração", icon: Rocket },
              { id: "auth-flow", label: "Auth Flow", icon: Shield },
              { id: "endpoints", label: "Endpoints", icon: Code2 },
              { id: "middleware", label: "Middleware", icon: Terminal },
              { id: "errors", label: "Error Codes", icon: AlertTriangle },
              { id: "apps", label: "Apps", icon: AppWindow },
              { id: "llm", label: "Para Agentes IA", icon: Puzzle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 text-xs text-secondary hover:text-accent transition-colors py-1"
              >
                <item.icon className="w-3 h-3 text-muted" />
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Overview */}
        <Section id="overview" title="Overview" icon={BookOpen}>
          <div className="space-y-3 text-sm text-secondary leading-relaxed">
            <p>
              <strong className="text-primary">eximIA Gate</strong> é o serviço central de autenticação
              e identidade do ecossistema eximIA. Usuários criam <strong className="text-primary">uma única conta</strong> e
              acessam qualquer app do ecossistema — Academy, Forms, Profiler, Maps e todos os demais.
            </p>
            <p>
              O administrador controla quais apps cada usuário pode acessar. A autenticação é via JWT
              e cada app valida o token chamando um único endpoint do Gate.
            </p>
            <div className="glass-panel rounded-md p-4 mt-4">
              <p className="text-xs text-primary font-medium mb-2">Resumo do contrato:</p>
              <ul className="space-y-1 text-xs text-secondary">
                <li>Contrato: <code>eximia-gate/v1</code></li>
                <li>Auth: JWT (HS256) — access token 1h, refresh token 30d</li>
                <li>Verificação: <code>POST /api/v1/gate/verify</code></li>
                <li>Integração: 1 arquivo (<code>lib/gate.ts</code>) + 1 variável de ambiente</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ─── INTEGRATION GUIDE (main section) ─── */}
        <Section id="integration" title="Guia de Integração" icon={Rocket}>
          <div className="space-y-10">
            {/* Intro */}
            <div className="glass-panel rounded-md p-5 border-accent/20">
              <p className="text-sm text-primary font-medium mb-2">4 passos para integrar seu app:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { num: "1", label: "Variável de ambiente" },
                  { num: "2", label: "Criar lib/gate.ts" },
                  { num: "3", label: "Login/Register UI" },
                  { num: "4", label: "Proteger rotas" },
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                      {s.num}
                    </span>
                    <span className="text-xs text-secondary">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 */}
            <div>
              <StepHeader num="01" title="Adicionar variável de ambiente" />
              <p className="text-xs text-secondary mb-3">
                Adicione a URL do Gate ao <code>.env.local</code> do seu app:
              </p>
              <CodeBlock code={ENV_CODE} lang="bash" />
            </div>

            {/* Step 2 */}
            <div>
              <StepHeader num="02" title="Criar lib/gate.ts" />
              <p className="text-xs text-secondary mb-2">
                Copie este arquivo na raiz do seu projeto. Ele contém <strong className="text-primary">todas</strong> as
                funções necessárias — login, register, token management, proteção de rotas.
              </p>
              <p className="text-xs text-accent mb-3">
                Troque <code>YOUR_APP_SLUG</code> pelo slug do seu app (ex: academy, forms, profiler).
              </p>
              <CodeBlock code={GATE_LIB_CODE} lang="typescript" />
            </div>

            {/* Step 3 */}
            <div>
              <StepHeader num="03" title="Login e Register" />

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-primary font-medium mb-2">Opção A: App novo (criar página de login)</p>
                  <p className="text-xs text-secondary mb-3">
                    Se seu app ainda não tem login, crie a página:
                  </p>
                  <CodeBlock code={LOGIN_PAGE_CODE} lang="tsx" />
                </div>

                <div>
                  <p className="text-xs text-primary font-medium mb-2">Opção B: App existente (trocar handler)</p>
                  <p className="text-xs text-secondary mb-3">
                    Se seu app já tem um form de login, troque apenas a chamada:
                  </p>
                  <CodeBlock code={EXISTING_LOGIN_CODE} lang="typescript" />
                </div>

                <div className="glass-panel rounded-md p-4">
                  <p className="text-xs text-secondary">
                    O Register segue o mesmo padrão — use <code>gateRegister(name, email, password)</code> seguido
                    de <code>saveAuth(data)</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <StepHeader num="04" title="Proteger rotas" />

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-primary font-medium mb-2">API Routes (server-side)</p>
                  <p className="text-xs text-secondary mb-3">
                    Use <code>withGateAuth(req)</code> em qualquer route handler:
                  </p>
                  <CodeBlock code={PROTECT_ROUTE_CODE} lang="typescript" />
                </div>

                <div>
                  <p className="text-xs text-primary font-medium mb-2">Páginas (client-side)</p>
                  <p className="text-xs text-secondary mb-3">
                    Use <code>isAuthenticated()</code> e <code>getUser()</code> em componentes client:
                  </p>
                  <CodeBlock code={PROTECT_PAGE_CODE} lang="tsx" />
                </div>

                <div>
                  <p className="text-xs text-primary font-medium mb-2">Chamadas autenticadas</p>
                  <p className="text-xs text-secondary mb-3">
                    Use <code>getValidToken()</code> para chamadas que precisam de auth — ele renova o token automaticamente:
                  </p>
                  <CodeBlock code={FETCH_WITH_TOKEN_CODE} lang="typescript" />
                </div>
              </div>
            </div>

            {/* Done */}
            <div className="glass-panel rounded-md p-5 border-success/20">
              <p className="text-sm text-primary font-medium mb-2">Pronto!</p>
              <p className="text-xs text-secondary leading-relaxed">
                Seu app agora usa Gate para autenticação. Usuários fazem login com as mesmas credenciais
                em qualquer app do ecossistema. O admin controla acesso pelo painel do Gate.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <code className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded">SSO ativo</code>
                <code className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded">Controle de acesso</code>
                <code className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded">Auto-refresh de token</code>
                <code className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded">Perfil unificado</code>
              </div>
            </div>
          </div>
        </Section>

        {/* Auth Flow */}
        <Section id="auth-flow" title="Auth Flow" icon={Shield} defaultOpen={false}>
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              O fluxo completo de autenticação entre usuário, Gate e seu app:
            </p>
            <CodeBlock code={AUTH_FLOW} />
            <div className="space-y-2 text-xs text-secondary">
              <p><strong className="text-primary">1.</strong> Usuário faz login no Gate (ou no seu app via <code>gateLogin()</code>)</p>
              <p><strong className="text-primary">2.</strong> Gate retorna JWT (1h) + refresh token (30d)</p>
              <p><strong className="text-primary">3.</strong> Usuário acessa seu app com <code>Authorization: Bearer &lt;token&gt;</code></p>
              <p><strong className="text-primary">4.</strong> Seu app verifica o token chamando <code>POST /verify</code></p>
              <p><strong className="text-primary">5.</strong> Gate retorna usuário + lista de apps permitidos</p>
              <p><strong className="text-primary">6.</strong> Seu app verifica se está na lista e autoriza</p>
            </div>
          </div>
        </Section>

        {/* Endpoints */}
        <Section id="endpoints" title="Endpoints" icon={Code2} defaultOpen={false}>
          <div className="space-y-6">
            {[
              { method: "POST", path: "/api/v1/gate/register", desc: "Criar nova conta", auth: false, req: '{ "email": "...", "password": "...", "name": "..." }', res: '{ "token": "jwt", "refresh_token": "jwt", "user": { ... } }', status: "201", errors: ["409 EMAIL_EXISTS", "422 VALIDATION_ERROR"] },
              { method: "POST", path: "/api/v1/gate/login", desc: "Autenticar", auth: false, req: '{ "email": "...", "password": "..." }', res: '{ "token": "jwt", "refresh_token": "jwt", "user": { ... } }', status: "200", errors: ["401 INVALID_CREDENTIALS"] },
              { method: "POST", path: "/api/v1/gate/verify", desc: "Verificar token", auth: false, req: '{ "token": "jwt" }', res: '{ "user": { ... }, "scopes": [...], "apps_allowed": [...] }', status: "200", errors: ["401 INVALID_TOKEN"] },
              { method: "POST", path: "/api/v1/gate/refresh", desc: "Renovar token", auth: false, req: '{ "refresh_token": "jwt" }', res: '{ "token": "jwt", "refresh_token": "jwt" }', status: "200", errors: ["401 INVALID_REFRESH_TOKEN"] },
              { method: "GET", path: "/api/v1/gate/catalog", desc: "Capabilities do Gate", auth: false },
              { method: "GET", path: "/api/v1/gate/profile/:id", desc: "Perfil do usuário", auth: true },
              { method: "PUT", path: "/api/v1/gate/profile/:id", desc: "Atualizar perfil", auth: true, req: '{ "name"?: "...", "avatar_url"?: "..." }' },
              { method: "GET", path: "/api/v1/gate/apps", desc: "Listar apps (admin)", auth: true, admin: true },
              { method: "POST", path: "/api/v1/gate/apps", desc: "Registrar app (admin)", auth: true, admin: true, req: '{ "slug": "...", "name": "...", "url": "..." }' },
              { method: "PUT", path: "/api/v1/gate/apps/:id/access", desc: "Conceder/revogar acesso (admin)", auth: true, admin: true, req: '{ "user_id": "...", "action": "grant|revoke" }' },
            ].map((ep) => (
              <div key={ep.method + ep.path} className="glass-panel rounded-md p-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <MethodBadge method={ep.method} />
                  <code className="text-xs font-mono text-primary">{ep.path}</code>
                  {ep.auth && <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-mono">AUTH</span>}
                  {ep.admin && <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/10 text-danger font-mono">ADMIN</span>}
                  {ep.status && <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/10 text-success font-mono">{ep.status}</span>}
                </div>
                <p className="text-xs text-secondary mb-1">{ep.desc}</p>
                {ep.req && <p className="text-[10px] text-muted font-mono">Request: <code>{ep.req}</code></p>}
                {ep.res && <p className="text-[10px] text-muted font-mono">Response: <code>{ep.res}</code></p>}
                {ep.errors && (
                  <div className="flex gap-1.5 mt-2">
                    {ep.errors.map((err) => (
                      <code key={err} className="text-[9px] font-mono text-danger/70 bg-danger/5 px-1.5 py-0.5 rounded">{err}</code>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Error Codes */}
        <Section id="errors" title="Error Codes" icon={AlertTriangle} defaultOpen={false}>
          <div className="glass-panel rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">Código</th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">HTTP</th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "VALIDATION_ERROR", http: 422, desc: "Input inválido" },
                  { code: "INVALID_CREDENTIALS", http: 401, desc: "Email ou senha incorretos" },
                  { code: "INVALID_TOKEN", http: 401, desc: "JWT expirado ou malformado" },
                  { code: "INVALID_REFRESH_TOKEN", http: 401, desc: "Refresh token inválido" },
                  { code: "EMAIL_EXISTS", http: 409, desc: "Email já registrado" },
                  { code: "APP_ACCESS_DENIED", http: 403, desc: "Usuário sem acesso ao app" },
                  { code: "USER_NOT_FOUND", http: 404, desc: "Usuário não encontrado" },
                  { code: "FORBIDDEN", http: 403, desc: "Permissões insuficientes" },
                  { code: "GATE_UNAVAILABLE", http: 503, desc: "Gate fora do ar" },
                  { code: "INTERNAL_ERROR", http: 500, desc: "Erro interno" },
                ].map((err) => (
                  <tr key={err.code} className="border-b border-border/10">
                    <td className="px-4 py-2"><code className="text-[10px] font-mono text-accent">{err.code}</code></td>
                    <td className="px-4 py-2 text-xs text-muted">{err.http}</td>
                    <td className="px-4 py-2 text-xs text-secondary">{err.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <p className="text-xs text-secondary mb-2">Formato padrão de erro:</p>
            <CodeBlock code={`{ "error": "Mensagem legível", "code": "MACHINE_CODE", "details"?: {} }`} lang="json" />
          </div>
        </Section>

        {/* Apps */}
        <Section id="apps" title="Apps do Ecossistema" icon={AppWindow} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { slug: "academy", name: "eximIA Academy", icon: "🎓", desc: "Plataforma de ensino multi-tenant" },
              { slug: "forms", name: "eximIA Forms", icon: "📝", desc: "Formulários inteligentes com IA" },
              { slug: "profiler", name: "eximIA Profiler", icon: "🧠", desc: "Avaliações psicométricas" },
              { slug: "maps", name: "eximIA Maps", icon: "🗺️", desc: "Mapas mentais com IA" },
              { slug: "hub", name: "eximIA Hub", icon: "🔗", desc: "Contrato de integração" },
              { slug: "content-platform", name: "Content Platform", icon: "📰", desc: "Hub de conteúdo editorial" },
              { slug: "work-timer", name: "Work Timer", icon: "⏱️", desc: "Tracking de horas" },
              { slug: "news-dashboard", name: "News Dashboard", icon: "📊", desc: "Monitoramento de notícias" },
            ].map((app) => (
              <div key={app.slug} className="flex items-start gap-3 p-3 bg-elevated/30 rounded-md">
                <span className="text-lg">{app.icon}</span>
                <div>
                  <p className="text-xs font-medium text-primary">{app.name}</p>
                  <p className="text-[10px] text-muted"><code>{app.slug}</code> — {app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* LLM / Agent Integration */}
        <Section id="llm" title="Para Agentes IA" icon={Puzzle} defaultOpen={false}>
          <div className="space-y-4">
            <p className="text-sm text-secondary mb-2">
              Se você é um agente de IA integrando um app ao Gate, consuma a spec completa:
            </p>
            <CodeBlock code="Consuma https://gate.eximiaventures.com.br/llms-full.txt e integre o app seguindo os 4 passos descritos no arquivo." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer" className="glass-panel rounded-md p-4 hover:border-accent/20 transition-colors block">
                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-2">
                  /llms-full.txt <ExternalLink className="w-2.5 h-2.5" />
                </p>
                <p className="text-[10px] text-muted">
                  Guia completo de integração em plain text. Contém todo o código necessário pronto para copiar.
                  Leia este arquivo e implemente os 4 passos.
                </p>
              </a>
              <a href="/api/spec" target="_blank" rel="noopener noreferrer" className="glass-panel rounded-md p-4 hover:border-accent/20 transition-colors block">
                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-2">
                  /api/spec <ExternalLink className="w-2.5 h-2.5" />
                </p>
                <p className="text-[10px] text-muted">
                  Spec do contrato em JSON. Inclui todos os endpoints, features, e lista de apps registrados.
                </p>
              </a>
            </div>
            <div className="glass-panel rounded-md p-4">
              <p className="text-xs text-primary font-medium mb-2">Regras para agentes:</p>
              <ul className="space-y-1 text-[10px] text-secondary">
                <li>• Nunca armazene senhas — Gate cuida de todo o hashing</li>
                <li>• Nunca verifique JWT localmente — sempre chame <code>POST /gate/verify</code></li>
                <li>• Use <code>getValidToken()</code> no client — auto-refresh incluso</li>
                <li>• Troque <code>APP_SLUG</code> em <code>lib/gate.ts</code> pelo slug correto</li>
                <li>• Se o app já tem auth, substitua — não sobreponha</li>
                <li>• localStorage keys: <code>gate_token</code>, <code>gate_refresh</code>, <code>gate_user</code></li>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-[10px] text-muted">eximIA Gate — Docs v1</span>
          <div className="flex items-center gap-4">
            <a href="/llms-full.txt" target="_blank" className="text-[10px] text-muted hover:text-secondary transition-colors">LLM Spec</a>
            <a href="/api/spec" target="_blank" className="text-[10px] text-muted hover:text-secondary transition-colors">JSON Spec</a>
            <a href="/api/health" target="_blank" className="text-[10px] text-muted hover:text-secondary transition-colors">Health</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
