import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LogOut, Package } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { getCurrentUser } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default function MiCuentaPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">Mi cuenta</p>
      <Suspense fallback={<AccountSkeleton />}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}

interface OrderRow {
  id: string;
  created_at: string;
  total: number;
  status: string;
  delivery: string;
  payment: string;
}

const statusTone: Record<string, "neutral" | "ok" | "copper" | "danger"> = {
  pendiente: "copper",
  pagado: "ok",
  listo: "ok",
  entregado: "neutral",
  cancelado: "danger",
};

async function AccountPanel() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mt-3 max-w-xl">
        <h1 className="text-[clamp(32px,4vw,44px)] font-semibold">Inicia sesión para ver tus pedidos</h1>
        <p className="mt-3 text-muted">
          {supabaseConfigured
            ? "Tu sesión no está activa."
            : "Modo demostración: las cuentas se activan al conectar Supabase. Las pantallas ya están listas."}
        </p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/login?next=/mi-cuenta">Iniciar sesión</ButtonLink>
          <ButtonLink href="/registro" variant="ghost">
            Crear cuenta
          </ButtonLink>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = supabase
    ? await supabase
        .from("orders")
        .select("id, created_at, total, status, delivery, payment")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] as OrderRow[] };
  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="mt-3 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div>
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-ink font-mono text-base text-bg">{initials(user.name)}</span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{user.name}</h1>
            <p className="truncate font-mono text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <form action={signOut} className="mt-6">
          <button type="submit" className={buttonClasses("ghost", "sm")}>
            <LogOut className="size-4" strokeWidth={1.6} aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </div>

      <section>
        <h2 className="flex items-center gap-2.5 text-xl font-semibold">
          <Package className="size-5 text-copper" strokeWidth={1.5} aria-hidden="true" />
          Mis pedidos
        </h2>
        {orders.length ? (
          <ul className="mt-5 border-t border-line">
            {orders.map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-line py-4">
                <span className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="font-mono text-sm tabular">{formatPrice(Number(o.total))}</span>
                <span className="text-sm text-muted">
                  {new Date(o.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                  {o.delivery === "campus" ? "Recoger en campus" : "Envío express"}
                </span>
                <Tag tone={statusTone[o.status] ?? "neutral"} className="justify-self-end">
                  {o.status}
                </Tag>
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass mt-5 rounded-[20px] px-6 py-10 text-center">
            <p className="font-semibold">Todavía no tienes pedidos.</p>
            <p className="mt-1 text-sm text-muted">Cuando compres, aparecerán aquí con su estado.</p>
            <Link href="/tienda" className={buttonClasses("primary", "sm", "mt-5")}>
              Ir a la tienda
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-md bg-surface" />
      <div className="h-48 animate-pulse rounded-md bg-surface" />
    </div>
  );
}
