import Link from "next/link";
import { UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { initials } from "@/lib/utils";

/** Lee la sesión: debe renderizarse dentro de <Suspense>. */
export async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link
        href="/login"
        className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink"
        aria-label="Iniciar sesión"
      >
        <UserRound className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <Link
      href="/mi-cuenta"
      className="grid size-11 place-items-center rounded-full bg-ink font-mono text-xs text-bg"
      aria-label={`Mi cuenta, ${user.name}`}
      title={user.name}
    >
      {initials(user.name)}
    </Link>
  );
}

export function AccountLinkFallback() {
  return <span className="block size-11 rounded-full border border-line" aria-hidden="true" />;
}
