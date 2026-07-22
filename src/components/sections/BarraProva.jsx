import { site } from "@/config/site";
import { Marquee } from "@/components/ui/Marquee";

/** 02 · Barra de prova social — BRIEF §4. Autoridade em 2 segundos. */
export function BarraProva() {
  return (
    <section aria-label="Diferenciais da Supreme Fitness" className="relative">
      <Marquee
        itens={site.provas}
        duracao={42}
        className="border-y border-supreme-escuro bg-supreme py-4"
        // texto escuro sobre a faixa amarela — branco daria 1.5:1
        itemClassName="fonte-display text-2xl md:text-4xl text-carbono"
      />

      {/* O conteúdo da faixa em texto real, para leitor de tela e para o Google:
          o marquee acima é aria-hidden porque é decorativo e duplicado. */}
      <ul className="sr-only">
        {site.provas.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
