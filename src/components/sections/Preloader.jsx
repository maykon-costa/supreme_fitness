import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { createScope, animate } from "animejs";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * 00 · Preloader "AQUECIMENTO" — BRIEF §4.
 * Barra + logo desenhado em SVG (anime.js). Teto de 1.2s: preloader longo é abandono.
 * O AnimatePresence da saída é Motion; o conteúdo interno é anime.js. Sem sobreposição.
 */
export function Preloader() {
  const [pronto, setPronto] = useState(false);
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduzido) {
      document.body.removeAttribute("data-preload");
      setPronto(true);
      return;
    }

    document.body.setAttribute("data-preload", "true");

    scope.current = createScope({ root }).add(() => {
      const estado = { v: 0 };
      animate(estado, {
        v: 100,
        duration: 1100,
        ease: "inOut(2)",
        onUpdate: () => {
          const pct = Math.round(estado.v);
          const num = root.current?.querySelector("[data-pct]");
          const barra = root.current?.querySelector("[data-barra]");
          if (num) num.textContent = String(pct).padStart(3, "0");
          if (barra) barra.style.transform = `scaleX(${estado.v / 100})`;
        },
      });

      animate(".preloader-letra", {
        y: [{ from: 26 }],
        opacity: [{ from: 0 }],
        duration: 700,
        delay: (_, i) => 90 * i,
        ease: "out(3)",
      });

      // O bloco "FITNESS" entra depois das 7 letras de SUPREME, crescendo
      // a partir da esquerda — como se a caixa fosse "carimbada" na marca.
      animate(".preloader-caixa", {
        scaleX: [{ from: 0 }],
        opacity: [{ from: 0 }],
        duration: 520,
        delay: 7 * 90 + 60,
        ease: "out(3)",
      });
    });

    const fim = window.setTimeout(() => setPronto(true), 1200);

    return () => {
      window.clearTimeout(fim);
      scope.current?.revert();
      scope.current = null;
    };
  }, []);

  // Libera o scroll e recalcula posições depois que as fontes carregaram
  useEffect(() => {
    if (!pronto) return;
    document.body.removeAttribute("data-preload");
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 420);
    return () => window.clearTimeout(t);
  }, [pronto]);

  return (
    <AnimatePresence>
      {!pronto && (
        <m.div
          ref={root}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-carbono"
          role="status"
          aria-live="polite"
          aria-label="Carregando"
        >
          {/* Lockup da marca montado letra a letra — por isso não usa <Logo/>,
              que é o lockup estático. O retângulo amarelo é o mesmo. */}
          <div
            className="fonte-display flex flex-col items-center leading-none"
            role="img"
            aria-label="Supreme Fitness"
          >
            <div aria-hidden="true" className="flex items-end gap-1 overflow-hidden">
              {"SUPREME".split("").map((letra, i) => (
                <span
                  key={i}
                  className="preloader-letra text-[clamp(2.5rem,9vw,6rem)]"
                >
                  {letra}
                </span>
              ))}
            </div>
            <span
              aria-hidden="true"
              className="preloader-caixa mt-2 origin-left bg-supreme px-3 py-1 text-[clamp(0.85rem,3vw,2rem)] tracking-[0.18em] text-carbono"
            >
              Fitness
            </span>
          </div>

          <p className="mt-6 text-[10px] font-semibold tracking-[0.42em] text-aco uppercase">
            Aquecimento
          </p>

          <div className="mt-8 flex w-56 items-center gap-4 md:w-72">
            <div className="h-px flex-1 bg-aco-escuro">
              <div
                data-barra
                className="h-px origin-left bg-supreme"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span className="tabular text-xs text-aco">
              <span data-pct>000</span>%
            </span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
