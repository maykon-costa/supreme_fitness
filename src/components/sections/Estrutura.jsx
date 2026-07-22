import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/config/site";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Contador } from "@/components/ui/Contador";
import { Foto } from "@/components/ui/Foto";
import { RotuloSecao } from "@/components/ui/Secao";

/**
 * 03 · Estrutura — parallax multicamada. BRIEF §4, LP_GUIDE §4.4.
 * 4 camadas com speeds 0.1 / 0.2 / 0.35 / 0.5. Cada imagem em scale 1.15
 * para nunca revelar a borda durante o deslocamento.
 */
export function Estrutura() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        gsap.fromTo(
          el,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-parallax-cena]") ?? el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="estrutura"
      className="relative overflow-hidden py-24 md:py-36"
    >
      <div className="grade-fundo absolute inset-0 opacity-30" />

      <div className="container-lp relative">
        <RotuloSecao numero="01" texto="A casa" />

        <div className="mt-8 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
          <div>
            <SplitHeading className="fonte-display titulo-lg whitespace-pre-line">
              {site.estrutura.titulo}
            </SplitHeading>

            <p className="peso-variavel mt-8 max-w-[52ch] text-base leading-relaxed text-aco md:text-lg">
              {site.estrutura.texto}
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-2 lg:gap-y-12">
              {site.estrutura.itens.map((item) => (
                <div key={item.label} className="border-t border-aco-escuro/60 pt-4">
                  <dt className="fonte-display text-4xl leading-none md:text-5xl">
                    <Contador valor={item.valor} sufixo={item.sufixo} />
                  </dt>
                  <dd className="mt-2 text-xs tracking-wide text-aco uppercase">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Cena de parallax: 4 camadas em profundidades diferentes */}
          <div
            data-parallax-cena
            className="relative h-[30rem] md:h-[38rem] lg:h-[44rem]"
          >
            <div
              data-parallax="0.1"
              className="absolute top-0 right-0 w-[62%] will-change-transform"
            >
              <Foto
                ratio="3/4"
                slot="estrutura-salao"
                alt="Área de musculação da Supreme Fitness"
                brief="Plano geral do salão de musculação, vazio, luz de fim de tarde."
                className="scale-[1.02]"
              />
            </div>

            <div
              data-parallax="0.32"
              className="absolute bottom-[8%] left-0 w-[52%] will-change-transform"
            >
              <Foto
                ratio="4/5"
                slot="estrutura-aluno"
                alt="Aluno treinando com peso livre"
                brief="Aluno real no rack de agachamento, close médio, foco no esforço."
              />
            </div>

            <div
              data-parallax="0.5"
              className="absolute top-[14%] left-[26%] w-[34%] will-change-transform"
            >
              <Foto
                ratio="1/1"
                slot="estrutura-detalhe"
                alt="Detalhe de equipamento"
                brief="Detalhe macro: anilha, barra ou halter com a marca visível."
              />
            </div>

            {/* Camada 4: tipografia, a mais rápida */}
            <span
              data-parallax="0.62"
              aria-hidden="true"
              className="fonte-display texto-contorno pointer-events-none absolute right-[4%] bottom-[2%] text-[clamp(3rem,8vw,7rem)] leading-none will-change-transform"
            >
              1200m²
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
