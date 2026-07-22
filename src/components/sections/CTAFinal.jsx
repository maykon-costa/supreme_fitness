import { Suspense, lazy, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site, CARGA_TOTAL } from "@/config/site";
import { useCan3D } from "@/hooks/useCan3D";
import { BtnAgend } from "@/components/ui/BtnAgend";
import { SplitHeading } from "@/components/ui/SplitHeading";

// Mesmo chunk da hero — zero download extra. BRIEF §4 (seção 08)
const HeroScene = lazy(() => import("@/components/three/HeroScene"));

/** 08 · CTA final — BRIEF §4. */
export function CTAFinal() {
  const root = useRef(null);
  const can3D = useCan3D();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from("[data-cta-fade]", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 68%" },
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="cta-final"
      className="grao relative flex min-h-[92svh] items-center overflow-hidden border-t border-aco-escuro/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(85%_60%_at_50%_100%,rgba(255,187,0,0.16)_0%,transparent_70%)]" />
      <div className="grade-fundo absolute inset-0 opacity-25" />

      {can3D && (
        <Suspense fallback={null}>
          <HeroScene variante="close" />
        </Suspense>
      )}

      <div className="container-lp relative z-10 py-24 text-center">
        <p
          data-cta-fade
          className="text-[11px] font-semibold tracking-[0.3em] text-supreme uppercase"
        >
          Aula experimental grátis
        </p>

        <SplitHeading
          as="h2"
          className="fonte-display titulo-xl mx-auto mt-7 max-w-[13ch] whitespace-pre-line"
          start="top 76%"
        >
          {site.ctaFinal.titulo}
        </SplitHeading>

        <p
          data-cta-fade
          className="peso-variavel mx-auto mt-8 max-w-[46ch] text-base leading-relaxed text-aco md:text-lg"
        >
          {site.ctaFinal.texto}
        </p>

        <div data-cta-fade className="mt-11 flex justify-center">
          <BtnAgend texto={site.ctaFinal.cta} origem="cta_final" tamanho="lg" />
        </div>

        {/* Fecha o conceito: aqui a barra do HUD já está cheia */}
        <p
          data-cta-fade
          className="fonte-display tabular mt-16 text-sm tracking-[0.2em] text-aco-escuro"
        >
          BARRA CARREGADA ·{" "}
          <span className="text-aco">{CARGA_TOTAL} KG</span> · SUA VEZ
        </p>
      </div>
    </section>
  );
}
