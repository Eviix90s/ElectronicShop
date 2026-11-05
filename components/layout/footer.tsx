import Link from "next/link";
import { ChipMark } from "@/components/ui/logo";
import { FacebookIcon, InstagramIcon, XIcon } from "@/components/ui/social-icons";
import { categories, site } from "@/lib/data";
import { Year } from "./year";

const help = [
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/servicios#entrega-en-campus", label: "Entrega en campus" },
  { href: "/servicios#metodos-de-pago", label: "Métodos de pago" },
  { href: "/servicios#soporte-tecnico", label: "Garantía y soporte" },
  { href: "/contacto", label: "Contacto" },
];

const account = [
  { href: "/mi-cuenta", label: "Mi cuenta" },
  { href: "/carrito", label: "Carrito" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/registro", label: "Crear cuenta" },
];

/* Sobre la cuadrícula negra todo va en blanco puro, para que las líneas no se coman el texto. */
const label = "font-mono text-[13px] tracking-[0.08em] text-white uppercase";
const link = "text-white transition-colors hover:text-copper-soft";
const social =
  "grid size-11 place-items-center rounded-full border-2 border-white bg-black text-white transition-colors hover:bg-white hover:text-black";

/**
 * Pie de página sobre una cuadrícula negra con líneas blancas de 46 px, dibujada
 * con CSS para que sea nítida en cualquier pantalla y no pese nada. La marca va
 * en grande, con la tipografía de los títulos, y las columnas de enlaces debajo.
 */
export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgb(255_255_255/0.42)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.42)_1px,transparent_1px)] [background-size:46px_46px]"
      />
      <div className="wrap relative py-16 lg:py-20">
        <Link
          href="/"
          aria-label="ElectronicShop, inicio"
          className="inline-flex items-center gap-4 text-[clamp(40px,5.2vw,72px)] leading-none font-semibold tracking-[-0.03em] text-white md:gap-6"
        >
          <ChipMark className="size-[0.82em]" />
          ElectronicShop
        </Link>
        <p className="mt-6 max-w-[40ch] text-[19px] text-white">{site.tagline}</p>

        <div className="mt-14 grid gap-12 border-t border-white/40 pt-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-x-16">
          <div className="max-w-sm md:col-span-2 lg:col-span-1">
            <p className="max-w-[34ch] text-[15px] text-white">
              Hecho por estudiantes de ingeniería, para estudiantes de ingeniería.
            </p>
            <p className={`${label} mt-8`}>Síguenos</p>
            <div className="mt-4 flex gap-2.5">
              <a href={site.social.instagram ?? "#"} className={social} aria-label="Instagram">
                <InstagramIcon className="size-4" />
              </a>
              <a href={site.social.facebook ?? "#"} className={social} aria-label="Facebook">
                <FacebookIcon className="size-4" />
              </a>
              <a href={site.social.x ?? "#"} className={social} aria-label="X">
                <XIcon className="size-3.5" />
              </a>
            </div>
          </div>
          <div>
            <p className={label}>Tienda</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/tienda?categoria=${c.slug}`} className={link}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={label}>Ayuda</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              {help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={label}>Cuenta</p>
            <ul className="mt-5 flex flex-col gap-3 text-[15px]">
              {account.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Barra inferior sobre la misma cuadrícula, sin franja aparte. */}
      <div className="relative border-t border-white/40">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-7 text-sm text-white">
          <span>
            © <Year /> {site.name}
          </span>
          <span className={label}>Entrega en campus · Garantía 6 meses · Devolución 7 días</span>
        </div>
      </div>
    </footer>
  );
}
