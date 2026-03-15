import { NextResponse } from "next/server";
import { GATE_CONTRACT_VERSION } from "@/lib/contract/types";
import { store } from "@/lib/db/store";

export async function GET() {
  const apps = store.getAllApps().filter((a) => a.status === "active");

  return NextResponse.json({
    app: "eximia-gate",
    version: "1.0.0",
    contract: `eximia-gate/${GATE_CONTRACT_VERSION}`,
    auth_methods: ["email_password"],
    features: ["sso", "rbac", "app_access_control", "unified_profile"],
    registered_apps: apps.map((a) => ({ id: a.id, slug: a.slug, name: a.name, url: a.url })),
    scopes: ["read", "write", "admin"],
  });
}
