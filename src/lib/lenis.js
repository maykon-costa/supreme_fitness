/**
 * Lenis + ponte com ScrollTrigger — LP_GUIDE §4.2
 * Ambos precisam compartilhar o mesmo raf, senão o scrub atrasa um frame.
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let instancia = null;

export function initLenis() {
  // Em reduced-motion não inicializamos smooth scroll — LP_GUIDE §7
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const lenis = new Lenis({
    autoRaf: false, // o ticker do GSAP assume o loop
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false, // não force smooth no touch — quebra a sensação nativa
  });

  instancia = lenis;

  const raf = (time) => lenis.raf(time * 1000);

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
    instancia = null;
  };
}

/** Scroll suave até uma âncora (usado pelo menu). */
export function scrollTo(target, options = {}) {
  if (instancia) {
    instancia.scrollTo(target, { offset: -80, duration: 1.2, ...options });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function pararScroll() {
  instancia?.stop();
}

export function retomarScroll() {
  instancia?.start();
}
