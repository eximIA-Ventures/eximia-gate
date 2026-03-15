"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  FileCode2,
  LogIn,
  UserPlus,
  ExternalLink,
} from "lucide-react";

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  external?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const links: NavLink[] = [
  { name: "Home", href: "/", icon: Home, desc: "Página inicial do Gate" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Seus apps e perfil", requireAuth: true },
  { name: "Admin", href: "/admin", icon: ShieldCheck, desc: "Gerenciar usuários e apps", requireAuth: true, requireAdmin: true },
  { name: "Docs", href: "/docs", icon: BookOpen, desc: "Documentação do contrato" },
  { name: "API Spec", href: "/api/spec", icon: FileCode2, desc: "Especificação JSON completa", external: true },
];

function parseJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function NavDropdown() {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("gate_token");
    if (token) {
      setIsAuth(true);
      const payload = parseJwtPayload(token);
      if (payload?.role === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visibleLinks = links.filter((link) => {
    if (link.requireAuth && !isAuth) return false;
    if (link.requireAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
      >
        Menu
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 py-2 bg-[#111111] border border-[rgba(232,224,213,0.08)] rounded-md shadow-xl animate-fade-in z-50">
          {visibleLinks.map((link) => {
            const content = (
              <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-elevated/50 transition-colors cursor-pointer">
                <link.icon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary flex items-center gap-1">
                    {link.name}
                    {link.external && <ExternalLink className="w-2.5 h-2.5 text-muted" />}
                  </p>
                  <p className="text-[10px] text-muted leading-relaxed">{link.desc}</p>
                </div>
              </div>
            );

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {content}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-1 border-t border-[rgba(232,224,213,0.06)]" />

          {!isAuth ? (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-elevated/50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-sage shrink-0" />
                <p className="text-xs font-medium text-primary">Fazer login</p>
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-elevated/50 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-sage shrink-0" />
                <p className="text-xs font-medium text-primary">Criar conta</p>
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-elevated/50 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-sage shrink-0" />
              <p className="text-xs font-medium text-primary">Meu painel</p>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
