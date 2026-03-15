"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  ExternalLink,
  Lock,
  User,
  Mail,
  Shield,
  Calendar,
  Settings,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  apps: string[];
  created_at: string;
}

interface AppData {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gate_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UserData;
      setUser(parsed);
    } catch {
      router.push("/login");
      return;
    }

    // Fetch full app list from catalog
    fetch("/api/v1/gate/catalog")
      .then((res) => res.json())
      .then((data) => {
        if (data.registered_apps) {
          setAllApps(data.registered_apps);
        }
      })
      .catch(() => {
        // Fallback: use user's apps only
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("gate_token");
    localStorage.removeItem("gate_refresh");
    localStorage.removeItem("gate_user");
    router.push("/");
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const userAppSlugs = user.apps || [];

  return (
    <div className="min-h-screen bg-bg text-primary relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/eximia-horizontal.svg" alt="eximIA" width={120} height={28} className="opacity-90" />
            <div className="h-5 w-px bg-[rgba(232,224,213,0.08)]" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Gate</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-secondary hover:text-danger transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
            <NavDropdown />
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Olá, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-muted mt-1">
              Bem-vindo ao seu painel Gate
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-accent transition-colors"
          >
            <Settings className="w-3 h-3" />
            Editar perfil
          </Link>
        </div>

        {/* Profile Card */}
        <div className="glass-panel rounded-md p-6 mb-10">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-accent" />
            Seu perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <Mail className="w-3 h-3 text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider">Email</p>
                <p className="text-xs text-secondary">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider">Role</p>
                <p className="text-xs text-secondary capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider">Membro desde</p>
                <p className="text-xs text-secondary">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Lock className="w-3 h-3 text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider">Apps</p>
                <p className="text-xs text-secondary">{userAppSlugs.length} apps com acesso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <h2 className="text-sm font-medium text-primary mb-4">Seus Apps</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allApps.map((app) => {
            const hasAccess = userAppSlugs.includes(app.slug);

            return (
              <div
                key={app.slug}
                className={`glass-panel rounded-md p-4 transition-colors ${
                  hasAccess
                    ? "hover:border-accent/10"
                    : "opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{app.icon}</span>
                  {!hasAccess && <Lock className="w-3 h-3 text-muted" />}
                </div>

                <h3 className="text-xs font-medium text-primary mb-1">{app.name}</h3>
                <p className="text-[10px] text-muted leading-relaxed mb-3">{app.description}</p>

                {hasAccess ? (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    Abrir
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[10px] text-muted">Sem acesso</span>
                )}
              </div>
            );
          })}
        </div>

        {allApps.length === 0 && (
          <div className="text-center py-12 text-xs text-muted">
            Carregando apps...
          </div>
        )}
      </main>
    </div>
  );
}
