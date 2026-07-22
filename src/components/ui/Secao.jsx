/**
 * Rótulo numerado de seção. Dá ritmo e ancora o conceito de "série":
 * cada seção é um exercício da ficha.
 */
export function RotuloSecao({ numero, texto, className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase ${className}`}
    >
      <span className="fonte-display text-supreme text-base">{numero}</span>
      <span className="h-px w-8 bg-aco-escuro" />
      <span className="text-aco">{texto}</span>
    </div>
  );
}
