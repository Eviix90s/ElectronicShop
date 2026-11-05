import { DustText } from "@/components/motion/dust-text";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBandProps {
  eyebrow?: string;
  title: string;
  text?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** "large": mismo tamaño que el contador de la portada y título con la tipografía del hero. */
  size?: "default" | "large";
  /** Alineación del contenido; la portada lo lleva al inicio, como los demás títulos. */
  align?: "center" | "start";
  /** El texto llega como polvo que se asienta con el scroll (ver DustText). */
  dustText?: boolean;
}

export function CtaBand({
  eyebrow,
  title,
  text,
  primary,
  secondary,
  size = "default",
  align = "center",
  dustText = false,
}: CtaBandProps) {
  const large = size === "large";
  const centered = align === "center";
  return (
    <Reveal>
      <div
        className={cn(
          "glass",
          large ? "rounded-[28px] px-6 py-14 md:px-12 md:py-20" : "rounded-[24px] px-6 py-12 md:px-12 md:py-16",
          centered && "text-center",
        )}
      >
        {eyebrow ? <p className={cn("eyebrow", centered && "justify-center")}>{eyebrow}</p> : null}
        <h2
          className={cn(
            "font-semibold",
            centered && "mx-auto",
            large
              ? "mt-5 max-w-[16ch] text-[clamp(40px,5.2vw,72px)] tracking-[-0.03em]"
              : "mt-3 max-w-[22ch] text-[clamp(28px,3.4vw,40px)]",
          )}
        >
          {title}
        </h2>
        {text ? (
          dustText ? (
            <DustText
              text={text}
              className={cn("mt-4 max-w-[52ch] text-muted", centered && "mx-auto", large && "mt-6 text-[19px]")}
            />
          ) : (
            <p className={cn("mt-4 max-w-[52ch] text-muted", centered && "mx-auto", large && "mt-6 text-[19px]")}>{text}</p>
          )
        ) : null}
        <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center", large && "mt-10")}>
          <ButtonLink href={primary.href} size={large ? "lg" : "md"}>
            {primary.label}
          </ButtonLink>
          {secondary ? (
            <ButtonLink href={secondary.href} variant="ghost" size={large ? "lg" : "md"}>
              {secondary.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
