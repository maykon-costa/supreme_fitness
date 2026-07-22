import { useEffect, useRef } from "react";
import { createScope, animate } from "animejs";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Contador numérico — domínio exclusivo do anime.js. LP_GUIDE §1 e §4.6.
 *
 * Dispara ao entrar na viewport (ScrollTrigger só como gatilho — não anima
 * nenhuma propriedade aqui, então não há conflito de transform entre libs).
 */
export function Contador({
  valor,
  sufixo = "",
  prefixo = "",
  decimais = 0,
  duracao = 1600,
  className = "",
}) {
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const alvo = el.querySelector("[data-num]");
    const formatar = (v) =>
      v.toLocaleString("pt-BR", {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais,
      });

    // Reduced-motion: mostra o valor final, sem contagem — LP_GUIDE §7
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      alvo.textContent = formatar(valor);
      return;
    }

    alvo.textContent = formatar(0);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        scope.current = createScope({ root }).add(() => {
          const estado = { v: 0 };
          animate(estado, {
            v: valor,
            duration: duracao,
            ease: "out(3)",
            onUpdate: () => {
              alvo.textContent = formatar(estado.v);
            },
          });
        });
      },
    });

    return () => {
      st.kill();
      scope.current?.revert();
      scope.current = null;
    };
  }, [valor, decimais, duracao]);

  return (
    <span ref={root} className={`tabular ${className}`}>
      {prefixo}
      <span data-num>0</span>
      {sufixo}
    </span>
  );
}
