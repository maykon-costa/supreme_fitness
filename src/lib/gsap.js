/**
 * Registro central do GSAP — LP_GUIDE §4.1
 * Importe SEMPRE de "@/lib/gsap", nunca de "gsap" direto nos componentes.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Curva de easing padrão do projeto (a mesma do Motion, para coerência)
gsap.registerEase("supreme", (p) => 1 - Math.pow(1 - p, 4));

export { gsap, ScrollTrigger, SplitText, useGSAP };
