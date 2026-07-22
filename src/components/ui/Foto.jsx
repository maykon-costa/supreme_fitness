/**
 * Slot de imagem com placeholder procedural.
 *
 * O projeto ainda não tem o material fotográfico do cliente (BRIEF §3 e §6:
 * "Zero banco de imagens"). Até a sessão de fotos acontecer, este componente
 * desenha um placeholder que ocupa o espaço exato da foto final e descreve
 * qual imagem vai ali — assim o layout já é o definitivo.
 *
 * Para trocar por foto real basta passar `src` (e opcionalmente `srcAvif`):
 *   <Foto src={ganho} alt="Aluno treinando no rack" ratio="4/5" />
 *
 * LP_GUIDE §9: .avif com fallback .webp, width/height explícitos (CLS),
 * loading lazy abaixo do fold, fetchpriority high no hero.
 */
export function Foto({
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

  if (src) {
    return (
      <figure
        className={`relative overflow-hidden bg-carbono-claro ${className}`}
        style={estilo}
      >
        <picture>
          {srcAvif && <source srcSet={srcAvif} type="image/avif" />}
          <img
            src={src}
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

      {brief && (
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <p className="border-l-2 border-supreme pl-2.5 text-[10px] leading-snug font-medium tracking-wide text-aco uppercase md:text-[11px]">
            Foto pendente
            <span className="mt-0.5 block text-[11px] normal-case md:text-xs">
              {brief}
            </span>
          </p>
        </div>
      )}

      {children}
    </div>
  );
}
