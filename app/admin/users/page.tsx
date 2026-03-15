"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronRight,
  Shield,
  Check,
  X,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

interface UserApp {
  slug: string;
  name: string;
  app_id: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  created_at: string;
  last_login: string | null;
  apps: UserApp[];
}

interface AppData {
  id: string;
  slug: string;
  name: string;
  icon: string;
  status: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("gate_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    fetchData();
  }, [router]);

  async function fetchData() {
    const token = localStorage.getItem("gate_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [usersRes, appsRes] = await Promise.all([
        fetch("/api/v1/gate/users", { headers }),
        fetch("/api/v1/gate/apps", { headers }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (appsRes.ok) {
        const data = await appsRes.json();
        setAllApps(data.apps || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  async function toggleAccess(userId: string, appId: string, currentlyGranted: boolean) {
    const key = `${userId}-${appId}`;
    setToggling(key);

    const token = localStorage.getItem("gate_token");

    try {
      const res = await fetch(`/api/v1/gate/apps/${appId}/access`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          action: currentlyGranted ? "revoke" : "grant",
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u;
            if (currentlyGranted) {
              return { ...u, apps: u.apps.filter((a) => a.app_id !== appId) };
            } else {
              const app = allApps.find((a) => a.id === appId);
              if (!app) return u;
              return {
                ...u,
                apps: [...u.apps, { slug: app.slug, name: app.name, app_id: app.id }],
              };
            }
          })
        );
      }
    } catch {
      // Silent fail
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

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
            <NavDropdown />
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-secondary transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar ao Admin
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <Users className="w-5 h-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold">Usuários</h1>
          <span className="text-xs text-muted ml-2">{users.length} registrados</span>
        </div>

        {/* Users Table */}
        <div className="glass-panel rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="w-8 px-4 py-3" />
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Nome
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Apps
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isExpanded = expandedUser === user.id;
                  const userAppIds = user.apps.map((a) => a.app_id);

                  return (
                    <Fragment key={user.id}>
                      <tr
                        className="border-b border-border/10 hover:bg-elevated/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      >
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-muted" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-primary font-medium">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-secondary">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                              user.role === "admin" ? "text-accent" : "text-secondary"
                            }`}
                          >
                            {user.role === "admin" && <Shield className="w-2.5 h-2.5" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {user.apps.length} apps
                        </td>
                        <td className="px-4 py-3 text-[10px] text-muted">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-elevated/20 px-8 py-4">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-3">
                              Acesso a apps
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {allApps.map((app) => {
                                const hasAccess = userAppIds.includes(app.id);
                                const isTogglingThis = toggling === `${user.id}-${app.id}`;

                                return (
                                  <button
                                    key={app.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAccess(user.id, app.id, hasAccess);
                                    }}
                                    disabled={isTogglingThis}
                                    className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
                                      hasAccess
                                        ? "bg-success/10 border border-success/20 text-success"
                                        : "bg-elevated border border-border text-muted hover:text-secondary"
                                    } ${isTogglingThis ? "opacity-50" : ""}`}
                                  >
                                    {hasAccess ? (
                                      <Check className="w-3 h-3 shrink-0" />
                                    ) : (
                                      <X className="w-3 h-3 shrink-0" />
                                    )}
                                    <span className="mr-1">{app.icon}</span>
                                    {app.name}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-xs text-muted">
              Nenhum usuário registrado.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

