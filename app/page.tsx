import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  Key,
  Users,
  Fingerprint,
  LogIn,
} from "lucide-react";
import { NavDropdown } from "@/components/nav-dropdown";

const STEPS = [
  {
    num: "01",
    icon: Fingerprint,
    title: "Crie sua conta no Gate",
    desc: "Registre-se uma vez e tenha uma identidade unificada para todo o ecossistema eximIA.",
  },
  {
    num: "02",
    icon: Key,
    title: "Receba acesso aos apps",
    desc: "O administrador concede acesso aos apps que você precisa. Tudo gerenciado centralmente.",
  },
  {
    num: "03",
    icon: LogIn,
    title: "Use qualquer app com um login",
    desc: "Autentique-se uma vez e navegue entre Academy, Forms, Profiler e todos os apps sem refazer login.",
  },
];

const APPS = [
  { slug: "academy", name: "eximIA Academy", icon: "🎓", desc: "Plataforma de ensino multi-tenant" },
  { slug: "forms", name: "eximIA Forms", icon: "📝", desc: "Formulários inteligentes com IA" },
  { slug: "profiler", name: "eximIA Profiler", icon: "🧠", desc: "Avaliações psicométricas" },
  { slug: "maps", name: "eximIA Maps", icon: "🗺️", desc: "Mapas mentais com IA" },
  { slug: "hub", name: "eximIA Hub", icon: "🔗", desc: "Contrato universal de integração" },
  { slug: "content-platform", name: "Content Platform", icon: "📰", desc: "Hub de conteúdo editorial" },
  { slug: "work-timer", name: "Work Timer", icon: "⏱️", desc: "Tracking de horas" },
  { slug: "news-dashboard", name: "News Dashboard", icon: "📊", desc: "Monitoramento de notícias" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Dot grid background */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Radial accent blur */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196,168,130,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-[rgba(232,224,213,0.06)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/eximia-horizontal.svg"
              alt="eximIA"
              width={120}
              height={28}
              className="opacity-90"
            />
            <div className="h-5 w-px bg-[rgba(232,224,213,0.08)]" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted">
              Gate
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/docs" className="text-secondary hover:text-primary transition-colors">Docs</Link>
            <Link href="/login" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <LogIn className="w-3 h-3" />
              Login
            </Link>
            <NavDropdown />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-accent/10 text-accent rounded-full">
              Universal Auth Contract v1
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.1] mb-5">
            Uma identidade.{" "}
            <span className="text-secondary italic">Qualquer app.</span>
          </h1>

          <p className="text-base text-secondary leading-relaxed mb-4 max-w-lg italic">
            One identity. Every app.
          </p>

          <p className="text-sm text-secondary leading-relaxed mb-10 max-w-lg">
            Gate é o contrato universal de autenticação e identidade do
            ecossistema eximIA. Registre-se uma vez e acesse Academy, Forms,
            Profiler, Maps e todos os apps com uma única identidade.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2.5 px-6 py-3 bg-accent text-bg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Criar conta
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2.5 px-6 py-3 border border-[rgba(232,224,213,0.1)] text-secondary text-sm rounded-md hover:border-accent/30 hover:text-primary transition-colors"
            >
              Documentação
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(196,168,130,0.15)] to-transparent" />
      </div>

      {/* Como Funciona */}
      <section className="relative max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl mb-8">Como funciona</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="p-6 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-[11px] font-bold font-mono flex items-center justify-center">
                  {step.num}
                </span>
                <step.icon className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm font-medium text-primary mb-2">{step.title}</p>
              <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apps do Ecossistema */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl mb-3">Apps do Ecossistema</h2>
        <p className="text-xs text-muted mb-8">
          Todos conectados por uma única identidade Gate
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {APPS.map((app) => (
            <div
              key={app.slug}
              className="p-5 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md group hover:border-accent/10 transition-colors text-center"
            >
              <div className="text-2xl mb-3">{app.icon}</div>
              <p className="text-sm font-medium text-primary mb-1">{app.name}</p>
              <p className="text-[10px] text-muted leading-relaxed">{app.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para Desenvolvedores */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <div className="p-8 bg-surface/50 border border-[rgba(232,224,213,0.05)] rounded-md text-center">
          <Users className="w-5 h-5 text-sage mx-auto mb-4" />
          <h2 className="font-display text-xl mb-3">Para Desenvolvedores</h2>
          <p className="text-xs text-secondary leading-relaxed mb-6 max-w-lg mx-auto">
            Conecte seu app ao ecossistema eximIA em minutos. Gate fornece JWT,
            controle de acesso por app e um middleware pronto para Next.js.
            Consulte a documentação completa do contrato.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-accent text-xs font-medium hover:text-accent-hover transition-colors"
          >
            Ver documentação completa
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(196,168,130,0.15)] to-transparent" />
      </div>

      {/* Footer */}
      <footer className="relative py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/eximia-horizontal.svg"
              alt="eximIA"
              width={80}
              height={18}
              className="opacity-40"
            />
            <span className="text-[11px] text-muted">
              eximIA Gate — Universal Auth Contract v1
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <Link href="/docs" className="hover:text-secondary transition-colors">
              Docs
            </Link>
            <a href="/api/spec" target="_blank" className="hover:text-secondary transition-colors">
              API Spec
            </a>
            <a href="/api/health" target="_blank" className="hover:text-secondary transition-colors">
              Health
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
