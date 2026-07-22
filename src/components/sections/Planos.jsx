import { useRef, useState } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { Check } from "lucide-react";
import { site } from "@/config/site";
import { mensagemPlano } from "@/utils/contato";
import { BtnAgend } from "@/components/ui/BtnAgend";
import { Contador } from "@/components/ui/Contador";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { RotuloSecao } from "@/components/ui/Secao";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Tilt 3D sutil — domínio do Motion. Máx 6°: mais que isso vira brinquedo (BRIEF §4). */
function CardPlano({ plano }) {
  const ref = useRef(null);
  const reduzido = useReducedMotion();
  // O transform 3D permanente cria uma camada de composição e o texto perde o
  // antialiasing subpixel — em fundo escuro isso vira franja colorida visível.
  // Por isso o tilt só existe enquanto o ponteiro está sobre o card.
  const [ativo, setAtivo] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mola = { stiffness: 260, damping: 22, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["6deg", "-6deg"]), mola);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-6deg", "6deg"]), mola);

  const onMove = (e) => {
    if (reduzido) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onEnter = () => {
    if (!reduzido) setAtivo(true);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    setAtivo(false);
  };

  const [inteiro, centavos] = plano.preco.toFixed(2).split(".");

  return (
    <m.article
      ref={ref}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduzido || !ativo
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1000 }
      }
      className={`relative flex flex-col p-7 md:p-8 ${
        plano.destaque
          ? "border-2 border-supreme bg-gradient-to-b from-supreme/12 to-carbono-claro"
          : "borda-sutil bg-carbono-claro"
      }`}
    >
      {plano.destaque && (
        <span className="absolute -top-3 left-7 bg-supreme px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-carbono uppercase">
          {plano.chamada}
        </span>
      )}

      <h3 className="fonte-display text-3xl">{plano.nome}</h3>
      {!plano.destaque && (
        <p className="mt-1 text-xs tracking-wide text-aco uppercase">
          {plano.chamada}
        </p>
      )}

      <div className="mt-7 flex items-end gap-1">
        <span className="mb-2 text-sm text-aco">R$</span>
        <span className="fonte-display text-6xl leading-none md:text-7xl">
          <Contador valor={Number(inteiro)} />
        </span>
        <span className="tabular mb-2 text-xl text-aco">,{centavos}</span>
        <span className="mb-2.5 ml-1 text-sm text-aco">{plano.periodo}</span>
      </div>

      <ul className="mt-8 flex-1 space-y-3.5">
        {plano.beneficios.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm text-aco">
            <Check
              size={16}
              strokeWidth={3}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-supreme"
            />
            <span className="peso-variavel leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>

      {/* Cada plano com sua própria origem e mensagem — LP_GUIDE §3 */}
      <BtnAgend
        texto="Quero este plano"
        origem={`plano_${plano.id}`}
        mensagem={mensagemPlano(plano.nome)}
        variante={plano.destaque ? "primario" : "contorno"}
        className="mt-9 w-full"
        icone={false}
      />
    </m.article>
  );
}

/** 06 · Planos — a seção que converte. BRIEF §4. */
export function Planos() {
  return (
    <section
      id="planos"
      className="relative overflow-hidden border-t border-aco-escuro/40 py-24 md:py-32"
    >
      <div className="grade-fundo absolute inset-0 opacity-25" />

      <div className="container-lp relative">
        <RotuloSecao numero="04" texto="Investimento" />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SplitHeading className="fonte-display titulo-lg max-w-[12ch]">
            {"PREÇO NA CARA.\nSEM PEGADINHA."}
          </SplitHeading>
          <p className="peso-variavel max-w-[40ch] text-sm leading-relaxed text-aco md:text-base">
            Todos os planos dão acesso a todas as modalidades e à avaliação
            física. Sem taxa escondida, sem letra miúda.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {site.planos.map((plano) => (
            <CardPlano key={plano.id} plano={plano} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-aco-escuro">
          Valores sujeitos a alteração. Confirme as condições vigentes no
          WhatsApp.
        </p>
      </div>
    </section>
  );
}
