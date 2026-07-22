/**
 * Marca da Supreme Fitness.
 *
 * Lockup oficial: "SUPREME" solto + "FITNESS" dentro de um retângulo amarelo.
 * Antes disso a marca estava escrita à mão em três lugares (header, footer,
 * preloader), cada um com uma variação — centralizar evita divergência.
 *
 * Acessibilidade: o conjunto vira UM texto só para leitor de tela
 * ("Supreme Fitness"); as partes visuais ficam aria-hidden para não serem
 * lidas em pedaços separados.
 *
 * Contraste: o bloco amarelo usa `text-carbono` — off-white sobre #FFBB00
 * dá 1,5:1 e seria ilegível (ver BRIEF §3).
 */

const TAMANHOS = {
  sm: {
    texto: "text-xl md:text-2xl",
    caixa: "px-1.5 py-px",
    fitness: "text-[0.5em]",
    gap: "gap-1.5",
  },
  md: {
    texto: "text-3xl md:text-4xl",
    caixa: "px-2 py-0.5",
    fitness: "text-[0.42em]",
    gap: "gap-2",
  },
  lg: {
    texto: "text-[clamp(2.5rem,9vw,6rem)]",
    caixa: "px-3 py-1",
    fitness: "text-[0.34em]",
    gap: "gap-3",
  },
};

export function Logo({
  tamanho = "sm",
  empilhado = false,
  className = "",
  supremeClassName = "",
}) {
  const t = TAMANHOS[tamanho] ?? TAMANHOS.sm;

  return (
    <span
      className={`fonte-display inline-flex leading-none ${
        empilhado ? "flex-col items-start" : `items-center ${t.gap}`
      } ${t.texto} ${className}`}
      role="img"
      aria-label="Supreme Fitness"
    >
      <span aria-hidden="true" className={supremeClassName}>
        Supreme
      </span>
      <span
        aria-hidden="true"
        className={`bg-supreme text-carbono ${t.caixa} ${t.fitness} tracking-[0.18em] ${
          empilhado ? "mt-1 self-stretch text-center" : ""
        }`}
      >
        Fitness
      </span>
    </span>
  );
}
