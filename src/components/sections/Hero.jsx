import { Suspense, lazy, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/config/site";
import { useCan3D, podeUsar3D } from "@/hooks/useCan3D";
import { assumirControleHero, definirProgressoHero } from "@/lib/carga";
import { scrollTo } from "@/lib/lenis";
import { BtnAgend } from "@/components/ui/BtnAgend";
import { Foto } from "@/components/ui/Foto";

// Chunk 3D isolado e fora do bundle inicial — LP_GUIDE §5.1
const HeroScene = lazy(() => import("@/components/three/HeroScene"));

/** 01 · Hero — BRIEF §4. */
export function Hero() {
  const root = useRef(null);
  const can3D = useCan3D();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Entrada dos blocos de apoio (a headline tem seu próprio reveal)
      gsap.from("[data-hero-fade]", {
        y: 26,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        delay: 1.35, // depois do preloader
        ease: "expo.out",
      });

      const mm = gsap.matchMedia();

      /**
       * COM 3D: a hero fica presa por UM viewport e, nesse trecho, os 6 pares
       * de anilha entram na barra. É o momento em que "scrollar é carregar".
       * Teto de 1 viewport extra é a regra do BRIEF §6 contra scroll-jacking.
       */
      mm.add(
        {
          comPin: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (!ctx.conditions.comPin || !podeUsar3D()) return;

          assumirControleHero();

          const conteudo = root.current.querySelector("[data-hero-conteudo]");

          const st = ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              definirProgressoHero(p);

              /**
               * O fade do texto sai DAQUI, do mesmo progresso do pin, e não de
               * um segundo ScrollTrigger: dois triggers no mesmo elemento pinado
               * disputam a ordem de refresh e o fade ficava fora de sincronia
               * com a barra, que então cruzava a headline.
               *
               * Some até 30% do pin. A barra carregada é longa e atravessa a
               * tela em qualquer posição, então a janela de sobreposição com a
               * headline precisa ser curta — senão vira um cruzamento ilegível.
               */
              const saida = gsap.utils.clamp(0, 1, p / 0.3);
              gsap.set(conteudo, {
                opacity: 1 - saida,
                yPercent: -7 * saida,
              });
            },
          });

          return () => {
            st.kill();
            gsap.set(conteudo, { clearProps: "opacity,transform" });
          };
        }
      );

      /** SEM 3D (mobile ou sem WebGL): nada de pin — só o parallax de saída. */
      mm.add(
        {
          semPin: "(max-width: 1023px), (prefers-reduced-motion: reduce)",
        },
        () => {
          gsap.to("[data-hero-fundo]", {
            yPercent: 18,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });

          gsap.to("[data-hero-conteudo]", {
            yPercent: -12,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom 30%",
              scrub: true,
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="hero"
      className="grao relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Fundo: PLACEHOLDER do vídeo de treino.
          Trocar por <video> com poster quando o material chegar — LP_GUIDE §9.
          O LCP sai daqui, nunca do <canvas>. */}
      <div data-hero-fundo className="absolute inset-0">
        <Foto
          ratio="auto"
          prioridade
          className="h-full w-full"
          alt="Ambiente de treino da Supreme Fitness"
          brief="Vídeo em loop (<2MB, com poster): plano geral da área de musculação em horário cheio, luz baixa, contraluz."
        />
      </div>

      {/* Cena 3D como enhancement por cima do fundo já renderizado */}
      {can3D && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

      {/* Legibilidade do texto sobre a imagem — contraste medido no pior frame */}
      <div className="absolute inset-0 bg-gradient-to-r from-carbono via-carbono/80 to-carbono/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbono via-transparent to-carbono/70" />

      <div
        data-hero-conteudo
        className="container-lp relative z-10 pt-28 pb-24 md:pt-32"
      >
        <p
          data-hero-fade
          className="mb-6 text-[11px] font-semibold tracking-[0.3em] text-supreme uppercase"
        >
          {site.hero.sobretitulo}
        </p>

        <h1 className="fonte-display titulo-xl max-w-[16ch]">
          {site.hero.titulo.map((linha, i) => (
            <span key={i} className="linha-mascara">
              <span
                className="block"
                style={{
                  animation: `heroLinha 1.1s cubic-bezier(0.16,1,0.3,1) ${1.15 + i * 0.11}s both`,
                }}
              >
                {i === site.hero.titulo.length - 1 ? (
                  <>
                    A GENTE <span className="text-supreme">TREINA.</span>
                  </>
                ) : (
                  linha
                )}
              </span>
            </span>
          ))}
        </h1>

        <p
          data-hero-fade
          className="peso-variavel mt-8 max-w-[46ch] text-base leading-relaxed text-aco md:text-lg"
        >
          {site.hero.subtitulo}
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <BtnAgend texto={site.hero.cta} origem="hero" tamanho="lg" />
          <button
            type="button"
            onClick={() => scrollTo("#planos")}
            className="borda-sutil inline-flex h-16 items-center px-8 text-sm font-semibold tracking-[0.14em] uppercase transition-colors duration-300 hover:border-supreme hover:bg-supreme/10 md:h-[4.5rem]"
          >
            {site.hero.ctaSecundario}
          </button>
        </div>
      </div>

      {/* O HUD de carga virou persistente (BarraSupino, montado no App):
          a barra acompanha o usuário a página inteira em vez de morrer no hero. */}

      <button
        type="button"
        onClick={() => scrollTo("#estrutura")}
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-aco transition-colors hover:text-branco md:flex"
      >
        <span className="text-[10px] font-semibold tracking-[0.28em] uppercase">
          Role
        </span>
        <ArrowDown size={16} className="indicador-scroll" aria-hidden="true" />
      </button>

      <style>{`
        @keyframes heroLinha {
          from { transform: translateY(108%); }
          to   { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroLinha { from { transform: none } to { transform: none } }
        }
      `}</style>
    </section>
  );
}
