# ElectronicShop

Tienda de componentes electrónicos para estudiantes de ingeniería. Rediseño completo del sitio en WordPress con un stack moderno: Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Three Fiber (visor 3D), Motion (animaciones) y Supabase (datos y cuentas).

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin configurar nada la app corre en **modo demostración**: catálogo desde `lib/data`, carrito en el navegador y pedidos sin persistir (la confirmación lo indica).

## Conectar Supabase (cuentas y pedidos)

1. Crea un proyecto en https://supabase.com.
2. En el editor SQL ejecuta `supabase/migrations/0001_init.sql` y después `supabase/seed.sql`.
3. Copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. En Authentication > Providers deja activo Email. Si quieres registro sin confirmar correo, desactiva "Confirm email" (solo para pruebas).

Con eso funcionan: registro, inicio de sesión, `/mi-cuenta` con historial y pedidos guardados en `orders` y `order_items`.

## Estructura

```
app/                 rutas (App Router)
  page.tsx           inicio: hero con tiles, visor 3D, categorías, destacados, pasos, valores, FAQ, CTA
  tienda/            catálogo con búsqueda, filtros por categoría y orden
  producto/[slug]/   ficha con galería, "Ver en 3D", specs y relacionados
  servicios/ nosotros/ preguntas-frecuentes/ contacto/
  carrito/ checkout/ pedido/[id]/
  login/ registro/ mi-cuenta/ auth/actions.ts
components/
  hero/              tiles flotantes que esquivan el cursor
  ui/grid-pulse.tsx  malla de fondo de toda la página: se enciende al paso del puntero y respeta el texto
  chat/              Electric, chat flotante por reglas (lib/chat/electric.ts): productos, horario, entrega, pagos, FAQ
  three/             visor 3D (React Three Fiber), modelos procedurales, modal
  product/ cart/ checkout/ forms/ sections/ layout/ ui/ motion/
lib/
  data/              catálogo, categorías, FAQ, servicios, equipo, testimonios, sitio
  cart/              estado del carrito (zustand) y totales
  supabase/          clientes de navegador y servidor
  auth.ts            lectura de sesión (Data Access Layer)
supabase/            migración SQL y seed
proxy.ts             refresco de sesión y protección de /mi-cuenta
```

## Decisiones

- **Cache Components** (`cacheComponents: true`): todo lo que lee cookies o `searchParams` vive dentro de `<Suspense>`; el resto se prerenderiza.
- **Precios en el servidor**: el checkout recalcula totales con el catálogo; el cliente solo envía slugs y cantidades.
- **3D bajo demanda**: el visor se carga con `next/dynamic` solo al abrirlo. Los modelos actuales son procedurales; se sustituyen por GLB en `public/models/` sin tocar la iluminación.
- **Tema claro único**, un acento (cobre), iconos Lucide, sin emojis.

## Pendientes para producción

- Modelos GLB reales de los productos prioritarios.
- Pasarela de pago (Mercado Pago Checkout Pro) y correo transaccional (Resend).
- Fotos reales del equipo y datos de contacto definitivos en `lib/data/site.ts`.
- Dominio propio y despliegue en Vercel.

## Scripts

- `npm run dev` servidor de desarrollo
- `npm run build` build de producción
- `npm run lint` ESLint
- `npx tsc --noEmit` comprobación de tipos
