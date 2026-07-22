import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/config/site";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Contador } from "@/components/ui/Contador";
import { Foto } from "@/components/ui/Foto";
import { RotuloSecao } from "@/components/ui/Secao";

/**
 * 05 · Transformações — antes/depois com wipe dirigido por scroll. BRIEF §4.
 *
 * Sem o slider de arrastar clichê: o próprio scroll revela o "depois".
 * O wipe usa clip-path (composited) em vez de width, para não estourar o frame.
 */
function CardTransformacao({ caso }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-depois]", { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      gsap.fromTo(
        "[data-depois]",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "bottom 62%",
            scrub: 0.8,
          },
        }
      );

      gsap.fromTo(
        "[data-linha-wipe]",
        { left: "0%" },
        {
          left: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "bottom 62%",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <article ref={root} className="borda-sutil group bg-carbono-claro">
      <div className="relative overflow-hidden">
        {/* ANTES */}
        <Foto
          ratio="4/5"
          alt={`${caso.nome} antes do treino`}
          brief="Foto ANTES — mesma pose, mesma luz, mesmo enquadramento da foto DEPOIS."
        />

        {/* DEPOIS, revelado pelo scroll */}
        <div data-depois className="absolute inset-0" style={{ willChange: "clip-path" }}>
          <Foto
            ratio="4/5"
            alt={`${caso.nome} depois de ${caso.semanas} semanas de treino`}
            brief="Foto DEPOIS — obrigatoriamente mesma pose, luz e enquadramento."
            className="h-full"
          />
        </div>

        <span
          data-linha-wipe
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-supreme shadow-[0_0_20px_rgba(255,187,0,0.75)]"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 text-[10px] font-semibold tracking-[0.2em] uppercase">
          <span className="bg-carbono/75 px-2 py-1 backdrop-blur-sm">Antes</span>
          <span className="bg-supreme px-2 py-1 text-carbono">Depois</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="fonte-display text-2xl">{caso.nome}</h3>
          <span className="tabular text-xs text-aco">
            <Contador valor={caso.semanas} /> semanas
          </span>
        </div>

        <p className="fonte-display mt-4 text-5xl leading-none text-supreme">
          <Contador valor={caso.metrica} sufixo={caso.metricaSufixo} />
        </p>
        <p className="mt-1 text-xs tracking-wide text-aco uppercase">
          {caso.metricaLabel}
        </p>

        <p className="peso-variavel mt-5 border-l-2 border-aco-escuro pl-4 text-sm leading-relaxed text-aco italic">
          “{caso.depoimento}”
        </p>
      </div>
    </article>
  );
}

export function Transformacoes() {
  return (
    <section
      id="resultados"
      className="relative border-t border-aco-escuro/40 py-24 md:py-32"
    >
      <div className="container-lp">
        <RotuloSecao numero="03" texto="Prova" />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SplitHeading className="fonte-display titulo-lg max-w-[13ch]">
            {"RESULTADO NÃO\nSE PROMETE.\nSE MOSTRA."}
          </SplitHeading>
          <p className="peso-variavel max-w-[38ch] text-sm leading-relaxed text-aco md:text-base">
            Alunos reais da Supreme, com autorização de uso de imagem. Role para
            ver a transformação acontecer.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.transformacoes.map((caso) => (
            <CardTransformacao key={caso.nome} caso={caso} />
          ))}
        </div>
      </div>
    </section>
  );
}
