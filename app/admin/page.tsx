"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  AppWindow,
  FileText,
  ShieldCheck,
  LogOut,
  Activity,
  UserCheck,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gate_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UserData;
      if (parsed.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(parsed);
    } catch {
      router.push("/login");
      return;
    }

    fetchStats();
  }, [router]);

  async function fetchStats() {
    const token = localStorage.getItem("gate_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [usersRes, appsRes, logsRes] = await Promise.all([
        fetch("/api/v1/gate/users", { headers }),
        fetch("/api/v1/gate/apps", { headers }),
        fetch("/api/v1/gate/logs?action=login&success=true", { headers }),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      const appsData = appsRes.ok ? await appsRes.json() : { apps: [] };
      const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };

      const totalUsers = usersData.users?.length ?? 0;
      const totalApps = appsData.apps?.length ?? 0;

      // Active users: users with last_login in last 30 days (approximate from logs)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const activeUserIds = new Set(
        (logsData.logs || [])
          .filter((l: { created_at: string }) => new Date(l.created_at).getTime() > thirtyDaysAgo)
          .map((l: { user_id: string }) => l.user_id)
      );

      // Logins today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const loginsToday = (logsData.logs || []).filter(
        (l: { created_at: string }) => new Date(l.created_at).getTime() > todayStart.getTime()
      ).length;

      setStats([
        { label: "Total Usuários", value: totalUsers, icon: Users, color: "text-accent" },
        { label: "Ativos (30d)", value: activeUserIds.size, icon: UserCheck, color: "text-sage" },
        { label: "Logins Hoje", value: loginsToday, icon: Activity, color: "text-success" },
        { label: "Apps Registrados", value: totalApps, icon: AppWindow, color: "text-info" },
      ]);
    } catch {
      // Silent fail — show zeros
      setStats([
        { label: "Total Usuários", value: "-", icon: Users, color: "text-accent" },
        { label: "Ativos (30d)", value: "-", icon: UserCheck, color: "text-sage" },
        { label: "Logins Hoje", value: "-", icon: Activity, color: "text-success" },
        { label: "Apps Registrados", value: "-", icon: AppWindow, color: "text-info" },
      ]);
    } finally {
      setLoading(false);
    }
  }

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

  const navItems = [
    { href: "/admin/apps", icon: AppWindow, label: "Apps", desc: "Gerenciar apps registrados no ecossistema" },
    { href: "/admin/users", icon: Users, label: "Usuários", desc: "Gerenciar usuários e acessos" },
    { href: "/admin/logs", icon: FileText, label: "Logs", desc: "Visualizar logs de autenticação" },
  ];

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
        {/* Title */}
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold">Admin</h1>
          <span className="text-[10px] font-mono text-muted ml-2">
            {user.email}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] text-muted uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-display font-semibold text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <h2 className="text-sm font-medium text-primary mb-4">Gerenciamento</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-panel rounded-md p-6 hover:border-accent/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-accent mb-3 group-hover:text-accent-hover transition-colors" />
              <h3 className="text-sm font-medium text-primary mb-1">{item.label}</h3>
              <p className="text-[10px] text-muted leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
