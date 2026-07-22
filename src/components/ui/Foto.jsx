import { urlDaImagem } from "@/lib/imagens";

/**
 * Slot de imagem com placeholder procedural.
 *
 * PARA COLOCAR UMA FOTO: salve o arquivo em `src/assets/imgs/` com o nome do
 * slot (`slot="hero"` → `src/assets/imgs/hero.webp`). Nada mais precisa mudar.
 *
 * Enquanto o arquivo não existir, desenha um placeholder que ocupa o espaço
 * exato da foto final e descreve qual imagem vai ali — o layout já é o
 * definitivo e a página nunca quebra por falta de imagem (BRIEF §3 e §6).
 *
 * LP_GUIDE §9: .avif/.webp, width/height explícitos (CLS),
 * loading lazy abaixo do fold, fetchpriority high no hero.
 */
export function Foto({
  slot,
  src,
  srcAvif,
  alt = "",
  brief,
  ratio = "4/5",
  className = "",
  prioridade = false,
  width,
  height,
  children,
}) {
  const estilo = { aspectRatio: ratio };
  // `src` explícito ainda funciona; o slot é o caminho preferido
  const fonte = src ?? urlDaImagem(slot);

  if (fonte) {
    return (
      <figure
        className={`relative overflow-hidden bg-carbono-claro ${className}`}
        style={estilo}
      >
        <picture>
          {srcAvif && <source srcSet={srcAvif} type="image/avif" />}
          <img
            src={fonte}
            alt={alt}
            width={width}
            height={height}
            loading={prioridade ? "eager" : "lazy"}
            fetchPriority={prioridade ? "high" : "auto"}
            decoding={prioridade ? "sync" : "async"}
            className="h-full w-full object-cover"
          />
        </picture>
        {children}
      </figure>
    );
  }

  // ---- Placeholder ----
  return (
    <div
      className={`grao relative overflow-hidden bg-carbono-claro ${className}`}
      style={estilo}
      role="img"
      aria-label={alt || brief || "Espaço reservado para fotografia"}
    >
      {/* gradiente diagonal + vinheta: lê como superfície, não como erro */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,#22232a_0%,#0a0a0b_72%)]" />
      <div className="grade-fundo absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbono via-transparent to-transparent" />

      {/* marca d'água diagonal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="fonte-display texto-contorno -rotate-12 text-[clamp(2rem,7vw,4.5rem)] leading-none opacity-70">
          Supreme
        </span>
      </div>

      {(brief || slot) && (
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <p className="border-l-2 border-supreme pl-2.5 text-[10px] leading-snug font-medium tracking-wide text-aco uppercase md:text-[11px]">
            Foto pendente
            {brief && (
              <span className="mt-0.5 block text-[11px] normal-case md:text-xs">
                {brief}
              </span>
            )}
            {/* o nome exato do arquivo a salvar — some sozinho quando existir */}
            {slot && (
              <span className="mt-1 block font-mono text-[10px] normal-case text-supreme">
                imgs/{slot}.webp
              </span>
            )}
          </p>
        </div>
      )}

      {children}
    </div>
  );
}
