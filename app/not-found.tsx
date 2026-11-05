import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <p className="mono-label">Error 404</p>
      <h1 className="mt-3 text-[clamp(34px,5vw,56px)] font-semibold">Circuito abierto.</h1>
      <p className="mx-auto mt-4 max-w-[44ch] text-muted">
        La página que buscas no existe o cambió de lugar. El catálogo sigue completo.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <ButtonLink href="/tienda" variant="ghost">
          Ir a la tienda
        </ButtonLink>
      </div>
    </div>
  );
}
