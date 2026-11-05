import {
  BadgeCheck,
  Box,
  Cable,
  CircuitBoard,
  Clock,
  Cpu,
  CreditCard,
  Gauge,
  GraduationCap,
  HandCoins,
  Handshake,
  Lightbulb,
  MapPin,
  Microchip,
  Package,
  Radio,
  RotateCcw,
  ScanEye,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
  Wallet,
  Wrench,
  Zap,
  type LucideProps,
} from "lucide-react";

/**
 * Iconos permitidos en los datos (nombres kebab-case de lucide).
 * Mantener la lista corta evita meter toda la librería en el bundle.
 */
const registry = {
  "badge-check": BadgeCheck,
  box: Box,
  cable: Cable,
  "circuit-board": CircuitBoard,
  clock: Clock,
  cpu: Cpu,
  "credit-card": CreditCard,
  gauge: Gauge,
  "graduation-cap": GraduationCap,
  "hand-coins": HandCoins,
  handshake: Handshake,
  lightbulb: Lightbulb,
  "map-pin": MapPin,
  microchip: Microchip,
  package: Package,
  radio: Radio,
  "rotate-ccw": RotateCcw,
  "scan-eye": ScanEye,
  scale: Scale,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  store: Store,
  truck: Truck,
  users: Users,
  wallet: Wallet,
  wrench: Wrench,
  zap: Zap,
} as const;

export type IconName = keyof typeof registry;

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, strokeWidth = 1.5, ...props }: IconProps) {
  const Cmp = registry[name as IconName] ?? Box;
  return <Cmp strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
