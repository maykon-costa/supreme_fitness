import { useEffect } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { initLenis } from "@/lib/lenis";
import { CARGA_TOTAL } from "@/config/site";

import { Preloader } from "@/components/sections/Preloader";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { BarraProva } from "@/components/sections/BarraProva";
import { Estrutura } from "@/components/sections/Estrutura";
import { Modalidades } from "@/components/sections/Modalidades";
import { Transformacoes } from "@/components/sections/Transformacoes";
import { Planos } from "@/components/sections/Planos";
import { HorariosLocal } from "@/components/sections/HorariosLocal";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Footer } from "@/components/sections/Footer";
import { BtnFixo } from "@/components/ui/BtnFixo";

export default function App() {
  // Marca que o JS assumiu: sem isso, quem tiver JS desativado veria a página
  // em branco, porque os reveals começam em opacity 0 (animation.css).
  useEffect(() => {
    document.documentElement.classList.add("js-pronto");
  }, []);

  // Smooth scroll + ponte com ScrollTrigger — LP_GUIDE §4.2
  useEffect(() => initLenis(), []);

  /**
   * PROGRESSIVE OVERLOAD — BRIEF §2.
   * Um único ScrollTrigger para o documento inteiro alimenta a página toda
   * via variáveis CSS. Visual caro, custo de bundle praticamente zero.
   */
  useGSAP(() => {
    const raiz = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Estado legível fixo, sem motion — LP_GUIDE §7
      raiz.style.setProperty("--wght", "500");
      raiz.style.setProperty("--sat", "1");
      document.querySelectorAll("[data-carga]").forEach((el) => {
        el.textContent = CARGA_TOTAL.toLocaleString("pt-BR");
      });
      return;
    }

    const cargas = document.querySelectorAll("[data-carga]");

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        raiz.style.setProperty("--progresso", p.toFixed(4));
        raiz.style.setProperty("--wght", String(Math.round(300 + p * 600)));
        raiz.style.setProperty("--sat", (0.4 + p * 0.6).toFixed(3));

        const kg = Math.round(p * CARGA_TOTAL);
        cargas.forEach((el) => {
          el.textContent = kg.toLocaleString("pt-BR");
        });
      },
    });

    // Reposiciona os triggers depois que as fontes carregam — LP_GUIDE §10
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => st.kill();
  }, []);

  // Se o usuário ligar reduced-motion durante a sessão, desarma tudo na hora
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => {
      if (!e.matches) return;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set("[data-parallax], .titulo-oculto", { clearProps: "all" });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    // LazyMotion + componentes `m`: carrega só o subconjunto de features que
    // usamos. Corta ~20kb gz frente ao `motion` completo — LP_GUIDE §6.
    // `strict` faz o build falhar se alguém usar `motion.*` por engano.
    <LazyMotion features={domAnimation} strict>
      <Preloader />
      <Header />

      <main id="conteudo">
        <Hero />
        <BarraProva />
        <Estrutura />
        <Modalidades />
        <Transformacoes />
        <Planos />
        <HorariosLocal />
        <CTAFinal />
      </main>

      <Footer />
      <BtnFixo />
    </LazyMotion>
  );
}
