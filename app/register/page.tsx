"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/gate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      localStorage.setItem("gate_token", data.token);
      localStorage.setItem("gate_refresh", data.refresh_token);
      localStorage.setItem("gate_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.02] blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 dot-grid" />

      <div className="relative z-10 w-full max-w-sm px-4 py-12 animate-fade-in">
        {/* Logo + branding */}
        <div className="mb-10 flex flex-col items-center">
          <Image
            src="/eximia-horizontal.svg"
            alt="eximIA"
            width={160}
            height={40}
            className="opacity-90"
            style={{ width: "auto", height: "auto", maxWidth: 160 }}
          />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px w-8 bg-[rgba(232,224,213,0.1)]" />
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-muted">
              Gate
            </span>
            <div className="h-px w-8 bg-[rgba(232,224,213,0.1)]" />
          </div>
        </div>

        {/* Register card */}
        <div className="rounded-2xl border border-[rgba(232,224,213,0.06)] bg-surface/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl shadow-black/20">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <UserPlus size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">Criar conta</h1>
              <p className="text-xs text-muted">Registre-se no ecossistema eximIA</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-primary/80">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full h-10 rounded-lg border border-[rgba(232,224,213,0.1)] bg-elevated px-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-primary/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-10 rounded-lg border border-[rgba(232,224,213,0.1)] bg-elevated px-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-primary/80">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-10 rounded-lg border border-[rgba(232,224,213,0.1)] bg-elevated px-3 pr-10 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-primary/80">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full h-10 rounded-lg border border-[rgba(232,224,213,0.1)] bg-elevated px-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-accent text-bg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  Criando...
                </span>
              ) : (
                <>
                  Criar conta
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Já tem conta?{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted/50">
          eximIA Gate · Universal Auth Contract
        </p>
      </div>
    </div>
  );
}
