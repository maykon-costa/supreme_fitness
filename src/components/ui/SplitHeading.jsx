import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Título com reveal linha a linha sob máscara — LP_GUIDE §4.5.
 * SplitText é gratuito desde abr/2025 (GSAP 3.13+).
 */
export function SplitHeading({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  start = "top 82%",
  stagger = 0.09,
}) {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // Reduced-motion: nenhum split, nenhum tween — LP_GUIDE §7
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines", // cria o wrapper com overflow:hidden automaticamente
        linesClass: "linha",
        autoSplit: true, // re-divide quando a fonte carrega ou a largura muda
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            opacity: 0,
            duration: 1,
            delay,
            stagger,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start },
          }),
      });

      gsap.set(el, { opacity: 1 });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    // `titulo-oculto` só zera a opacidade quando o JS assumiu (animation.css).
    // Sem JS, o título aparece normalmente em vez de ficar invisível.
    <Tag ref={root} className={`titulo-oculto ${className}`}>
      {children}
    </Tag>
  );
}
