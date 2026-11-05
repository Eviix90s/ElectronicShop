import { FloatingTilesHero } from "@/components/hero/floating-tiles-hero";
import { HeroCopy } from "@/components/hero/hero-copy";
import { Reveal } from "@/components/motion/reveal";
import { FeaturedGrid } from "@/components/product/featured-grid";
import { CtaBand } from "@/components/sections/cta-band";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Showcase3d } from "@/components/sections/showcase-3d";
import { VisitCounter } from "@/components/sections/visit-counter";
import { ButtonLink } from "@/components/ui/button";
import { getFeaturedProducts, products } from "@/lib/data";

/** Título de sección: misma tipografía que el titular del hero, compartido por las secciones anchas. */
const sectionTitle = "mt-5 max-w-[12ch] text-[clamp(40px,5.2vw,72px)] font-semibold tracking-[-0.03em]";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const with3d = products.filter((p) => p.model3d);

  return (
    <>
      <FloatingTilesHero>
        <HeroCopy />
      </FloatingTilesHero>

      {/* Título a la izquierda, visor-carrusel ancho a la derecha. */}
      <section className="wrap py-18" id="visor-3d">
        <Showcase3d products={with3d} eyebrow="Visor 3D" title="Gíralo, acércate, revisa cada pin." />
      </section>

      {/* Mismo título que la sección del visor, para que lean como una sola pieza. */}
      <section className="wrap pb-18" id="destacados">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="eyebrow">Destacados</p>
            <h2 className={sectionTitle}>Tócalo antes de comprarlo.</h2>
          </div>
          <ButtonLink href="/tienda" variant="ghost" size="sm" className="mb-2">
            Ver toda la tienda
          </ButtonLink>
        </Reveal>
        <FeaturedGrid products={featured.slice(0, 6)} priorityCount={3} className="mt-10 md:mt-12" />
      </section>

      {/* Título fijo a la izquierda mientras la línea de tiempo vertical se dibuja a la derecha. */}
      <section className="wrap py-18" id="como-funciona">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="eyebrow">Cómo funciona</p>
              <h2 className={sectionTitle}>Tres pasos y un reemplazo en tu mano.</h2>
            </Reveal>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="wrap pb-18" id="comunidad">
        <VisitCounter />
      </section>

      {/* Mismo ancho y mismo tamaño de tarjeta que el contador; título como los demás. */}
      <section className="wrap pb-18">
        <CtaBand
          size="large"
          align="start"
          title="Arma tu lista de materiales y recógela mañana en campus."
          text="Crea tu cuenta con tu correo institucional para guardar tus pedidos y recibir avisos cuando llegue tu material."
          primary={{ href: "/tienda", label: "Ir a la tienda" }}
          secondary={{ href: "/registro", label: "Crear cuenta" }}
        />
      </section>
    </>
  );
}
