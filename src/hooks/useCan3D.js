/**
 * Gating de device para WebGL — LP_GUIDE §5.1
 * A cena 3D é enhancement, nunca requisito. Em Android intermediário,
 * conexão econômica ou reduced-motion, o fallback estático é a experiência padrão.
 */
import { useEffect, useState } from "react";

function avaliar() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.deviceMemory ?? 4) < 4) return false;
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false;

  // Telas pequenas não ganham nada com a cena e pagam todo o custo
  if (window.matchMedia("(max-width: 767px)").matches) return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useCan3D() {
  // Começa sempre em false: o primeiro paint é o fallback, o LCP sai dele
  const [can3D, setCan3D] = useState(false);

  useEffect(() => {
    // Adiado para não competir com o LCP
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setCan3D(avaliar()), { timeout: 2000 })
      : window.setTimeout(() => setCan3D(avaliar()), 1200);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  return can3D;
}
