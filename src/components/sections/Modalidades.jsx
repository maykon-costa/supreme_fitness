import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/config/site";
import { Foto } from "@/components/ui/Foto";
import { RotuloSecao } from "@/components/ui/Secao";

/**
 * 04 · Modalidades — scroll horizontal com pin no desktop. BRIEF §4, LP_GUIDE §4.5.
 *
 * No mobile vira carrossel de swipe nativo com scroll-snap: pin em tela pequena
 * é hostil e rouba o gesto do usuário. Alternância via gsap.matchMedia.
 */
export function Modalidades() {
  const root = useRef(null);
  const trilho = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        },
        () => {
          const el = trilho.current;
          if (!el) return;

          const distancia = () => el.scrollWidth - window.innerWidth + 80;

          gsap.to(el, {
            x: () => -distancia(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              scrub: 1,
              start: "top top",
              end: () => "+=" + distancia(),
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="modalidades"
      className="relative overflow-hidden border-t border-aco-escuro/40 py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0"
    >
      <div className="container-lp">
        <RotuloSecao numero="02" texto="O que você vai treinar" />
        <h2 className="fonte-display titulo-lg mt-6 max-w-[14ch]">
          SEIS FORMAS
          <br />
          DE <span className="text-supreme">SUAR</span>
        </h2>
      </div>

      <div
        ref={trilho}
        className="snap-mobile mt-12 flex gap-5 overflow-x-auto px-5 pb-4 md:px-10 lg:overflow-visible lg:pb-0 lg:will-change-transform"
      >
        {site.modalidades.map((m, i) => (
          <article
            key={m.nome}
            className="group borda-sutil relative w-[78vw] shrink-0 overflow-hidden bg-carbono-claro transition-colors duration-500 hover:border-supreme sm:w-[58vw] md:w-[40vw] lg:w-[26rem]"
          >
            <Foto
              ratio="4/3"
              alt={`Aula de ${m.nome} na Supreme Fitness`}
              brief={`Foto real de uma aula de ${m.nome.toLowerCase()}, movimento e rosto de aluno.`}
              className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />

            <div className="relative p-6 md:p-7">
              <span className="fonte-display texto-contorno absolute top-4 right-5 text-4xl leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="inline-block bg-supreme/12 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-supreme uppercase">
                {m.tag}
              </span>

              <h3 className="fonte-display mt-4 text-3xl">{m.nome}</h3>
              <p className="peso-variavel mt-3 max-w-[38ch] text-sm leading-relaxed text-aco">
                {m.texto}
              </p>
            </div>

            {/* filete que preenche no hover — microinteração barata e legível */}
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-supreme transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
          </article>
        ))}
      </div>

      <p className="container-lp mt-6 text-xs text-aco-escuro lg:hidden">
        Arraste para o lado para ver todas →
      </p>
    </section>
  );
}
