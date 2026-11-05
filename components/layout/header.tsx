import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { CartButton } from "@/components/cart/cart-button";
import { navLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { SearchForm } from "./search-form";
import { AccountLink, AccountLinkFallback } from "./account-link";

export function Header() {
  return (
    <header
      className="glass-bar sticky z-30"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="wrap flex h-[72px] items-center gap-8">
        <Logo />
        <nav className="ml-6 hidden items-center gap-8 text-[15px] text-muted md:flex" aria-label="Principal">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="py-2.5 transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3.5">
          <SearchForm className="hidden w-64 lg:block xl:w-72" />
          <Suspense fallback={<AccountLinkFallback />}>
            <span className="hidden md:block">
              <AccountLink />
            </span>
          </Suspense>
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
