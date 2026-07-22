import { useEffect, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";
import { handleWhatsAppClick } from "@/utils/contato";

/**
 * CTA fixo de WhatsApp — domínio do Motion (UI com estado). LP_GUIDE §1.
 *
 * Aparece após 100px e some quando o CTA final entra na tela, para não ter
 * dois CTAs competindo (BRIEF §4).
 * Listener com { passive: true } — correção do bug #11 do guia.
 */
export function BtnFixo() {
  const [visivel, setVisivel] = useState(false);
  const [ctaFinalNaTela, setCtaFinalNaTela] = useState(false);

  useEffect(() => {
    const checarScroll = () => setVisivel(window.scrollY > 100);
    checarScroll();
    window.addEventListener("scroll", checarScroll, { passive: true });
    return () => window.removeEventListener("scroll", checarScroll);
  }, []);

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

  const mostrar = visivel && !ctaFinalNaTela;

  return (
    <AnimatePresence>
      {mostrar && (
        <m.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 bottom-4 z-40 md:right-7 md:bottom-7"
        >
          <button
            type="button"
            onClick={() => handleWhatsAppClick("btn_fixo")}
            aria-label="Agendar aula experimental grátis pelo WhatsApp"
            className="group flex h-14 items-center gap-3 rounded-full bg-supreme pr-5 pl-4 font-semibold tracking-wide text-branco shadow-[0_12px_40px_-8px_rgba(232,35,42,0.7)] transition-colors duration-300 hover:bg-supreme-escuro md:h-16 md:pr-7 md:pl-5"
          >
            <MessageCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            <span className="text-xs uppercase md:text-sm">
              Aula grátis
            </span>
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
