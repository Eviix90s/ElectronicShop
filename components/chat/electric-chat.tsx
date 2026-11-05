"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Send, X, Zap } from "lucide-react";
import { BOT_NAME, reply, welcome, type ChatReply } from "@/lib/chat/electric";
import { cn, formatPrice } from "@/lib/utils";

interface Msg {
  id: number;
  from: "bot" | "user";
  text: string;
  reply?: ChatReply;
}

const STORAGE = "electronicshop-chat";
const GREETED = "electronicshop-chat-greeted";
const chip =
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-line-strong bg-surface/80 px-3 text-xs font-medium text-ink transition-colors hover:border-ink";

/** Avatar de Electric con el punto verde de "en línea" (halo pulsante, quieto con reduced-motion). */
function Avatar({ size = "md", children }: { size?: "sm" | "md"; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full bg-ink text-copper-soft",
        size === "sm" ? "size-9" : "size-11",
      )}
    >
      {children ?? <Zap className={size === "sm" ? "size-4" : "size-[18px]"} strokeWidth={2} fill="currentColor" aria-hidden="true" />}
      <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c55e]/50 motion-reduce:animate-none" />
        <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-[#22c55e]" />
      </span>
    </span>
  );
}

/**
 * Electric: chat flotante en la esquina inferior derecha de todas las páginas.
 * Saluda al entrar, responde por reglas con los datos del sitio y recuerda la
 * conversación durante la sesión.
 */
export function ElectricChat() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  // Saludo flotante, una vez por sesión, un momento después de cargar.
  useEffect(() => {
    let greeted = false;
    try {
      greeted = sessionStorage.getItem(GREETED) === "1";
    } catch {}
    if (greeted) return;
    const show = window.setTimeout(() => setBubble(true), 2500);
    const hide = window.setTimeout(() => setBubble(false), 16000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // La conversación de la sesión se restaura tras montar.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE);
        if (!raw) return;
        const saved = JSON.parse(raw) as Msg[];
        if (saved.length) {
          nextId.current = Math.max(...saved.map((m) => m.id)) + 1;
          setMessages(saved);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, typing, open, reduce]);

  function markGreeted() {
    setBubble(false);
    try {
      sessionStorage.setItem(GREETED, "1");
    } catch {}
  }

  function openChat() {
    setOpen(true);
    markGreeted();
    setMessages((m) => {
      if (m.length) return m;
      const w = welcome();
      return [{ id: nextId.current++, from: "bot", text: w.text, reply: w }];
    });
    window.setTimeout(() => input.current?.focus(), 80);
  }

  function send(text: string) {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: clean }]);
    setDraft("");
    setTyping(true);
    const r = reply(clean);
    const delay = reduce ? 0 : 500 + Math.min(900, clean.length * 18);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", text: r.text, reply: r }]);
    }, delay);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  const last = messages[messages.length - 1];
  const suggestions = !typing && last?.from === "bot" ? last.reply?.suggestions : undefined;

  return (
    <>
      {/* Botón flotante y saludo. El vidrio va en hijos: .glass fija position: relative. */}
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
        <AnimatePresence>
          {bubble && !open ? (
            <motion.div
              key="bubble"
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="glass relative w-[min(calc(100vw-2rem),280px)] rounded-2xl p-3.5 pr-9 text-[14px] leading-snug"
              role="status"
            >
              <button type="button" onClick={openChat} className="cursor-pointer text-left">
                <span className="font-semibold">Hola, soy {BOT_NAME}.</span>{" "}
                <span className="text-muted">¿Te ayudo a encontrar un componente o a resolver una duda?</span>
              </button>
              <button
                type="button"
                onClick={markGreeted}
                aria-label="Cerrar saludo"
                className="absolute top-2 right-2 grid size-6 cursor-pointer place-items-center rounded-full text-muted hover:text-ink"
              >
                <X className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-expanded={open}
          aria-label={open ? `Cerrar chat con ${BOT_NAME}` : `Abrir chat con ${BOT_NAME}`}
          className="glass glass-lift inline-flex h-14 cursor-pointer items-center gap-3 rounded-full pr-4 pl-1.5 text-[15px] font-semibold text-ink md:pr-5"
        >
          <Avatar size="sm">{open ? <X className="size-4" strokeWidth={2} aria-hidden="true" /> : undefined}</Avatar>
          <span className="flex flex-col items-start leading-none max-sm:sr-only">
            <span>{BOT_NAME}</span>
            <span className="mt-1 font-mono text-[10px] font-medium tracking-[0.08em] text-muted uppercase">En línea</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed right-3 bottom-[5.5rem] z-40 h-[min(72vh,600px)] w-[min(calc(100vw-1.5rem),400px)] origin-bottom-right md:right-6 md:bottom-24"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-label={`Chat con ${BOT_NAME}`}
              className="glass flex h-full flex-col overflow-hidden rounded-[28px]"
            >
              <header className="flex items-center gap-3 border-b border-line bg-surface/40 px-4 py-3.5">
                <Avatar />
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] leading-tight font-semibold">{BOT_NAME}</p>
                  <p className="mt-0.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase">
                    En línea · responde al instante
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar chat"
                  className="grid size-9 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface/70 hover:text-ink"
                >
                  <X className="size-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </header>

              <div ref={list} className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]" aria-live="polite">
                <ul className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <li key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                          "max-w-[88%] rounded-[20px] px-4 py-3 text-[15px] leading-snug",
                          m.from === "user"
                            ? "rounded-br-md bg-ink text-bg"
                            : "rounded-bl-md border border-line bg-surface/90 text-ink shadow-[0_1px_2px_rgb(13_12_11/0.05)]",
                        )}
                      >
                        <p>{m.text}</p>
                        {m.reply?.products?.length ? (
                          <ul className="mt-3 flex flex-col gap-2">
                            {m.reply.products.map((p) => (
                              <li key={p.slug}>
                                <Link
                                  href={`/producto/${p.slug}`}
                                  className="flex items-center gap-3 rounded-xl border border-line bg-surface/80 p-2 transition-colors hover:border-ink"
                                >
                                  <Image src={p.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-contain p-0.5" />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                                    <span className="block font-mono text-xs text-muted">
                                      {formatPrice(p.price)} · {p.stock > 0 ? `${p.stock} en stock` : "Agotado"}
                                    </span>
                                  </span>
                                  <ArrowUpRight className="size-4 shrink-0 text-muted" strokeWidth={1.6} aria-hidden="true" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {m.reply?.links?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {m.reply.links.map((l) => (
                              <Link key={l.href + l.label} href={l.href} className={chip}>
                                {l.label}
                                <ArrowUpRight className="size-3" strokeWidth={1.8} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </motion.div>
                    </li>
                  ))}
                  {typing ? (
                    <li className="flex justify-start" aria-label={`${BOT_NAME} está escribiendo`}>
                      <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface/80 px-3.5 py-3">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="size-1.5 rounded-full bg-muted"
                            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </span>
                    </li>
                  ) : null}
                </ul>
              </div>

              {suggestions?.length ? (
                <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} className={`${chip} shrink-0`}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
                <label htmlFor="electric-input" className="sr-only">
                  Escribe tu mensaje
                </label>
                <input
                  ref={input}
                  id="electric-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escribe un componente o una duda…"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface/85 px-4 text-[15px] text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || typing}
                  aria-label="Enviar"
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-ink text-bg transition-[opacity,background-color] hover:bg-copper disabled:cursor-default disabled:opacity-40 disabled:hover:bg-ink"
                >
                  <Send className="size-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </form>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
