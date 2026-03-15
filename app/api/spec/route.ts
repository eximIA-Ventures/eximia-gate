import { NextResponse } from "next/server";
import { CONTRACT_SPEC, GATE_CONTRACT_VERSION } from "@/lib/contract/types";
import { store } from "@/lib/db/store";

export async function GET() {
  const spec = {
    ...CONTRACT_SPEC,
    registered_apps: store.getAllApps().filter((a) => a.status === "active").map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      url: a.url,
      description: a.description,
      icon: a.icon,
      status: a.status,
    })),
  };

  return NextResponse.json(spec, {
    headers: { "x-eximia-gate-version": GATE_CONTRACT_VERSION },
  });
}
