import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { animate, createScope } from "animejs";
import { supino } from "@/config/site";
import { assinarCarga, kgPara } from "@/lib/carga";

/**
 * HUD do conceito PROGRESSIVE OVERLOAD — BRIEF §2.
 *
 * Uma barra de supino que ganha um PAR de anilhas a cada trecho vencido da
 * página. Scrollar é literalmente carregar a barra.
 *
 * Por que SVG e não uma segunda cena Three.js: LP_GUIDE §5.3 — o efeito não
 * precisa de geometria. Em SVG o HUD custa ~0kb de runtime, fica nítido em
 * qualquer densidade de tela e roda em celular, onde o WebGL nem é montado.
 *
 * Divisão de libs (LP_GUIDE §1), sem sobreposição:
 *   · GSAP     → o scroll global que alimenta o store (App.jsx)
 *   · Motion   → entrada/saída das anilhas (mount/unmount, estado do React)
 *   · anime.js → o contador de kg
 */

// Geometria do desenho (unidades do viewBox)
const CENTRO_Y = 42;
const PARADA_ESQ = 104; // onde as anilhas encostam, lado esquerdo
const PARADA_DIR = 156;
const LARGURA = 8;
const PASSO = 9.5;

/** Anilha mais pesada = disco maior. É o que dá leitura instantânea. */
function alturaAnilha(kg) {
  if (kg >= 20) return 60;
  if (kg >= 15) return 50;
  if (kg >= 10) return 40;
  return 28;
}

function posicaoX(lado, indice) {
  return lado === "esq"
    ? PARADA_ESQ - LARGURA - indice * PASSO
    : PARADA_DIR + indice * PASSO;
}

export function BarraSupino() {
  const [pares, setPares] = useState(0);
  const [ctaFinalNaTela, setCtaFinalNaTela] = useState(false);
  const root = useRef(null);
  const scope = useRef(null);
  const kgAnterior = useRef(0);

  useEffect(() => assinarCarga(setPares), []);

  // Some no CTA final: lá a barra já está cheia e o texto assume o recado.
  useEffect(() => {
    const alvo = document.getElementById("cta-final");
    if (!alvo) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCtaFinalNaTela(entry.isIntersecting),
      { threshold: 0.25 }
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  // Contador de kg — anime.js, tweenando do valor anterior para o novo
  useEffect(() => {
    const alvo = root.current?.querySelector("[data-kg]");
    if (!alvo) return;

    const destino = kgPara(pares);
    const partida = kgAnterior.current;
    kgAnterior.current = destino;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      alvo.textContent = String(destino);
      return;
    }

    scope.current?.revert();
    scope.current = createScope({ root }).add(() => {
      const estado = { v: partida };
      animate(estado, {
        v: destino,
        duration: 620,
        ease: "out(3)",
        onUpdate: () => {
          alvo.textContent = String(Math.round(estado.v));
        },
      });
    });

    return () => {
      scope.current?.revert();
      scope.current = null;
    };
  }, [pares]);

  // Monta a lista de anilhas: um par (esquerda + direita) por nível carregado
  const anilhas = [];
  for (let i = 0; i < pares; i++) {
    const kg = supino.pares[i];
    anilhas.push({ id: `esq-${i}`, lado: "esq", indice: i, kg });
    anilhas.push({ id: `dir-${i}`, lado: "dir", indice: i, kg });
  }

  const cheia = pares >= supino.pares.length;

  return (
    <m.div
      ref={root}
      // Decorativo: é um floreio do conceito, não informação que o usuário
      // precisa. Ler "180 KG" fora de contexto só confunde no leitor de tela.
      aria-hidden="true"
      animate={{
        opacity: ctaFinalNaTela ? 0 : 1,
        y: ctaFinalNaTela ? 16 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      /**
       * Chip compacto com fundo próprio: as headlines são alinhadas à esquerda,
       * então sem backdrop o HUD colidia com elas e ficava ilegível.
       *
       * No mobile ele encolhe bastante: divide a faixa de baixo com o BtnFixo
       * (bottom-right). Somando ~132px do chip + ~150px do botão + margens,
       * cabe com folga em 360px de viewport, que é o piso realista do público.
       */
      className="pointer-events-none fixed bottom-4 left-4 z-30 flex select-none items-center gap-2 rounded-full border border-aco-escuro/50 bg-carbono/80 py-1.5 pr-3 pl-2.5 backdrop-blur-md md:bottom-5 md:left-5 md:gap-3 md:py-2.5 md:pr-5 md:pl-4"
    >
      <svg
        viewBox="0 0 260 84"
        className="w-[80px] overflow-visible sm:w-[110px] md:w-[132px] lg:w-[148px]"
        fill="none"
      >
        {/* eixo da barra */}
        <rect
          x="40"
          y={CENTRO_Y - 1.75}
          width="180"
          height="3.5"
          rx="1.75"
          fill="#8A8F98"
          opacity="0.55"
        />
        {/* pegada central com serrilha sugerida */}
        <rect
          x={PARADA_ESQ + 2}
          y={CENTRO_Y - 2.75}
          width={PARADA_DIR - PARADA_ESQ - 4}
          height="5.5"
          rx="2.75"
          fill="#8A8F98"
          opacity="0.85"
        />
        {/* presilhas: onde as anilhas encostam */}
        <rect x={PARADA_ESQ} y={CENTRO_Y - 5} width="3" height="10" rx="1.5" fill="#8A8F98" />
        <rect x={PARADA_DIR - 3} y={CENTRO_Y - 5} width="3" height="10" rx="1.5" fill="#8A8F98" />

        <AnimatePresence initial={false}>
          {anilhas.map(({ id, lado, indice, kg }) => {
            const h = alturaAnilha(kg);
            const x = posicaoX(lado, indice);
            const direcao = lado === "esq" ? -1 : 1;

            return (
              <m.g
                key={id}
                initial={{ opacity: 0, x: direcao * 26, scaleY: 0.35 }}
                animate={{ opacity: 1, x: 0, scaleY: 1 }}
                exit={{ opacity: 0, x: direcao * 26, scaleY: 0.35 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 26,
                  mass: 0.7,
                }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <rect
                  x={x}
                  y={CENTRO_Y - h / 2}
                  width={LARGURA}
                  height={h}
                  rx="2.5"
                  fill="#1B1C20"
                  stroke="#3A3D44"
                  strokeWidth="1"
                />
                {/* filete vermelho: marca a anilha sem sair da paleta de 3 cores */}
                <rect
                  x={x + 1.5}
                  y={CENTRO_Y - h / 2 + 3}
                  width={LARGURA - 3}
                  height="2"
                  rx="1"
                  fill="#FFBB00"
                  opacity="0.9"
                />
              </m.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Abaixo de 360px o número sai e fica só a barra: nessa largura o chip
          encostava no BtnFixo, e o CTA nunca cede espaço para um enfeite. */}
      <p className="fonte-display tabular hidden shrink-0 items-baseline gap-0.5 text-lg leading-none min-[360px]:flex md:text-2xl">
        <span data-kg>{supino.barra}</span>
        <span className={cheia ? "text-supreme" : "text-aco"}>kg</span>
      </p>
    </m.div>
  );
}
