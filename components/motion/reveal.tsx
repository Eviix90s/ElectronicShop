"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

const ease = [0.2, 0.7, 0.2, 1] as const;

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /** Índice para escalonar en cascada (70 ms por paso) */
  index?: number;
  /** Desplazamiento inicial en px */
  y?: number;
  children?: React.ReactNode;
}

/** Aparece al entrar en el viewport. Visible en reposo si no hay JS o con reduced-motion. */
export function Reveal({ index = 0, y = 14, children, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={props.className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease, delay: index * 0.07 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
