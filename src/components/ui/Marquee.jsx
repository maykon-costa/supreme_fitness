import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Marquee infinito em CSS (custo zero por frame) + skew reativo à velocidade
 * do scroll em GSAP — LP_GUIDE §4.5. É o detalhe que faz parecer caro.
 */
export function Marquee({
  itens,
  duracao = 34,
  direcao = "normal",
  separador = "✦",
  className = "",
  itemClassName = "",
}) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const trilho = root.current?.querySelector(".marquee-trilho");
      if (!trilho) return;

      const skewTo = gsap.quickTo(trilho, "skewX", {
        duration: 0.45,
        ease: "power3",
      });

      const st = ScrollTrigger.create({
        onUpdate: (self) =>
          skewTo(gsap.utils.clamp(-9, 9, self.getVelocity() / -190)),
      });

      return () => st.kill();
    },
    { scope: root }
  );

  // Duplicado para o loop de -50% ser contínuo
  const conteudo = [...itens, ...itens];

  return (
    <div ref={root} className={`marquee-wrap overflow-hidden ${className}`}>
      <div
        className="marquee-trilho"
        data-direcao={direcao}
        style={{ "--marquee-dur": `${duracao}s` }}
        // a faixa é decorativa: o conteúdo já existe em texto nas seções
        aria-hidden="true"
      >
        {conteudo.map((item, i) => (
          <span
            key={i}
            className={`flex shrink-0 items-center gap-6 px-6 ${itemClassName}`}
          >
            {item}
            <span className="opacity-45">{separador}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
