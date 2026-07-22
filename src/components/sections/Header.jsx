import { useEffect, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { IconeInstagram } from "@/components/ui/IconesSociais";
import { site } from "@/config/site";
import { scrollTo, pararScroll, retomarScroll } from "@/lib/lenis";
import { BtnAgend } from "@/components/ui/BtnAgend";
import { statusAgora } from "@/utils/horario";

/** Header + menu mobile — domínio do Motion (UI com estado). LP_GUIDE §1. */
export function Header() {
  const [aberto, setAberto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const status = statusAgora(site.horarios);

  useEffect(() => {
    const onScroll = () => setCompacto(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trava o scroll com o menu aberto e devolve no fechamento
  useEffect(() => {
    if (aberto) pararScroll();
    else retomarScroll();
  }, [aberto]);

  // Esc fecha o menu
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  const irPara = (href) => {
    setAberto(false);
    window.setTimeout(() => scrollTo(href), aberto ? 320 : 0);
  };

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-supreme focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Pular para o conteúdo
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          compacto
            ? "border-b border-aco-escuro/40 bg-carbono/85 py-3 backdrop-blur-lg"
            : "border-b border-transparent py-5"
        }`}
      >
        <div className="container-lp flex items-center justify-between gap-4">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              irPara("#hero");
            }}
            className="fonte-display text-xl leading-none md:text-2xl"
          >
            Supreme<span className="text-supreme">.</span>
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
            {site.navegacao.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  irPara(item.href);
                }}
                className="group relative text-[11px] font-semibold tracking-[0.18em] text-aco uppercase transition-colors duration-200 hover:text-branco"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-supreme transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Status "aberto agora" — percepção de site vivo. BRIEF §4 (07) */}
            <span className="hidden items-center gap-2 text-[11px] font-medium tracking-wide text-aco md:inline-flex">
              <span
                className={`pulso-vivo h-1.5 w-1.5 rounded-full ${
                  status.aberto ? "bg-emerald-400" : "bg-aco"
                }`}
              />
              {status.rotulo}
            </span>

            <BtnAgend
              texto="Aula grátis"
              origem="header"
              tamanho="sm"
              icone={false}
              className="hidden sm:inline-flex"
            />

            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              className="borda-sutil flex h-11 w-11 items-center justify-center transition-colors hover:border-supreme lg:hidden"
            >
              {aberto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {aberto && (
          <m.div
            id="menu-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-45 flex flex-col bg-carbono pt-24 lg:hidden"
          >
            <nav aria-label="Menu mobile" className="container-lp flex flex-col">
              {site.navegacao.map((item, i) => (
                <m.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    irPara(item.href);
                  }}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    duration: 0.42,
                    delay: 0.06 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="fonte-display border-b border-aco-escuro/40 py-5 text-4xl transition-colors hover:text-supreme"
                >
                  {item.label}
                </m.a>
              ))}
            </nav>

            <div className="container-lp mt-auto pb-10">
              <BtnAgend
                texto="Aula experimental grátis"
                origem="menu_mobile"
                tamanho="lg"
                className="w-full"
              />
              <div className="mt-6 flex items-center justify-between text-xs text-aco">
                <a
                  href={site.contato.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-branco"
                >
                  <IconeInstagram size={16} />
                  {site.contato.instagramHandle}
                </a>
                <span>{site.contato.telefoneExibicao}</span>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
