"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Check, AlertCircle } from "lucide-react";
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("gate_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UserData;
      setUser(parsed);
      setName(parsed.name);
    } catch {
      router.push("/login");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("gate_token");
      const res = await fetch(`/api/v1/gate/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao atualizar perfil");
        setLoading(false);
        return;
      }

      // Update local storage with new user data
      const updatedUser = { ...user, name: data.name };
      localStorage.setItem("gate_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess("Perfil atualizado com sucesso.");
      setLoading(false);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (!user) {
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

      <main className="relative z-10 max-w-lg mx-auto px-6 py-10 animate-fade-in">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-secondary transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar ao Dashboard
        </Link>

        {/* Profile Card */}
        <div className="glass-panel rounded-md p-8">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-accent" />
            <h1 className="text-lg font-display font-semibold">Editar perfil</h1>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs text-secondary mb-1.5">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-elevated border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-elevated/50 border border-border/50 rounded text-sm text-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted mt-1">O email não pode ser alterado.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent text-bg text-sm font-medium rounded hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Salvar alterações"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
