"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  AppWindow,
  Plus,
  X,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

interface AppData {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  created_at: string;
}

export default function AdminAppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

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

    fetchApps();
  }, [router]);

  async function fetchApps() {
    const token = localStorage.getItem("gate_token");
    try {
      const res = await fetch("/api/v1/gate/apps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(app: AppData) {
    const token = localStorage.getItem("gate_token");
    const newStatus = app.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`/api/v1/gate/apps/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
        );
      }
    } catch {
      // Silent fail
    }
  }

  async function handleCreateApp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const token = localStorage.getItem("gate_token");

    try {
      const res = await fetch("/api/v1/gate/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          name,
          url,
          description: description || undefined,
          icon: icon || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar app");
        setFormLoading(false);
        return;
      }

      setApps((prev) => [...prev, data.app]);
      setSuccess(`App "${data.app.name}" criado com sucesso.`);
      setShowForm(false);
      resetForm();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setFormLoading(false);
    }
  }

  function resetForm() {
    setSlug("");
    setName("");
    setUrl("");
    setDescription("");
    setIcon("");
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

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl font-semibold">Apps</h1>
            <span className="text-xs text-muted ml-2">{apps.length} registrados</span>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg text-xs font-medium rounded hover:bg-accent-hover transition-colors"
          >
            {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showForm ? "Cancelar" : "Add App"}
          </button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 bg-success/10 border border-success/20 rounded text-xs text-success flex items-center gap-2">
            <Check className="w-3 h-3 shrink-0" />
            {success}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="glass-panel rounded-md p-6 mb-6">
            <h2 className="text-sm font-medium text-primary mb-4">Novo App</h2>
            <form onSubmit={handleCreateApp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-secondary mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="meu-app"
                  className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Meu App"
                  className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary mb-1">URL *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://app.eximiaventures.com.br"
                  className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🚀"
                  className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-secondary mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição curta do app"
                  className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-accent text-bg text-xs font-medium rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {formLoading ? "Criando..." : "Criar App"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Apps Table */}
        <div className="glass-panel rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Icon
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Nome
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Slug
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    URL
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-[10px] font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b border-border/10 hover:bg-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-lg">{app.icon || "-"}</td>
                    <td className="px-4 py-3 text-xs text-primary font-medium">{app.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-[10px] font-mono text-accent">{app.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-secondary hover:text-accent transition-colors truncate block max-w-[200px]"
                      >
                        {app.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                          app.status === "active" ? "text-success" : "text-muted"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            app.status === "active" ? "bg-success" : "bg-muted"
                          }`}
                        />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(app)}
                        className="text-muted hover:text-primary transition-colors"
                        title={app.status === "active" ? "Desativar" : "Ativar"}
                      >
                        {app.status === "active" ? (
                          <ToggleRight className="w-5 h-5 text-success" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {apps.length === 0 && (
            <div className="text-center py-12 text-xs text-muted">
              Nenhum app registrado.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
