"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Filter } from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

interface LogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  ip: string;
  user_agent: string;
  success: boolean;
  created_at: string;
}

const ACTION_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "login", label: "Login" },
  { value: "register", label: "Register" },
  { value: "verify", label: "Verify" },
  { value: "refresh", label: "Refresh" },
];

const SUCCESS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "true", label: "Sucesso" },
  { value: "false", label: "Falha" },
];

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");

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

    fetchLogs();
  }, [router]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, successFilter]);

  async function fetchLogs() {
    const token = localStorage.getItem("gate_token");
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (successFilter) params.set("success", successFilter);

    try {
      const res = await fetch(`/api/v1/gate/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold">Logs de Autenticação</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-muted" />
            <span className="text-[10px] text-muted uppercase tracking-wider">Filtros:</span>
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2 py-1 bg-elevated border border-border rounded text-xs text-primary focus:outline-none focus:border-accent/40"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={successFilter}
            onChange={(e) => setSuccessFilter(e.target.value)}
            className="px-2 py-1 bg-elevated border border-border rounded text-xs text-primary focus:outline-none focus:border-accent/40"
          >
            {SUCCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className="text-[10px] text-muted ml-auto">
            {logs.length} registros
          </span>
        </div>

        {/* Logs Table */}
        <div className="glass-panel rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Timestamp
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Usuário
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Ação
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    IP
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Sucesso
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/10 hover:bg-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-[10px] text-muted font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {log.user_name ? (
                        <div>
                          <p className="text-xs text-primary">{log.user_name}</p>
                          <p className="text-[10px] text-muted">{log.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[10px] font-mono text-accent">{log.action}</code>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted font-mono">{log.ip}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-medium ${
                          log.success ? "text-success" : "text-danger"
                        }`}
                      >
                        {log.success ? "OK" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-xs text-muted">
              Nenhum log encontrado.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
