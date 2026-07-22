import { ArrowUpRight } from "lucide-react";
import { handleWhatsAppClick } from "@/utils/contato";

/**
 * CTA principal.
 *
 * `origem` é OBRIGATÓRIA — LP_GUIDE §3. Sem ela não dá para saber qual seção
 * gerou o lead. (Correção do bug #9 do guia: aqui toda prop declarada é usada.)
 */
export function BtnAgend({
  texto = "Aula experimental grátis",
  origem,
  mensagem,
  variante = "primario",
  tamanho = "md",
  className = "",
  onClick,
  icone = true,
  ...rest
}) {
  const tamanhos = {
    sm: "h-11 px-5 text-xs",
    md: "h-14 px-7 text-sm",
    lg: "h-16 px-9 text-sm md:h-[4.5rem] md:px-12 md:text-base",
  };

  const variantes = {
    // text-carbono, não text-branco: branco sobre o amarelo da marca dá 1.5:1
    primario:
      "btn-varredura bg-supreme text-carbono hover:bg-supreme-escuro shadow-[0_0_0_0_rgba(255,187,0,0.5)] hover:shadow-[0_10px_40px_-8px_rgba(255,187,0,0.55)]",
    contorno:
      "borda-sutil bg-transparent text-branco hover:border-supreme hover:bg-supreme/10",
    claro: "bg-branco text-carbono hover:bg-aco",
  };

  const acao = onClick ?? (() => handleWhatsAppClick(origem, mensagem));

  return (
    <button
      type="button"
      onClick={acao}
      className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden font-semibold tracking-[0.14em] uppercase transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${tamanhos[tamanho]} ${variantes[variante]} ${className}`}
      {...rest}
    >
      <span className="relative z-10">{texto}</span>
      {icone && (
        <ArrowUpRight
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </button>
  );
}
