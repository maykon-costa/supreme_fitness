/**
 * Estado da carga na barra — ponte entre o ScrollTrigger global (App.jsx) e os
 * componentes que exibem o HUD.
 *
 * Por que um store e não um ScrollTrigger por componente: o LP_GUIDE §1 manda
 * ter UM trigger global alimentando a página. Aqui ele empurra o progresso e
 * quem quiser assina.
 *
 * O detalhe que importa: só notifica quando o NÚMERO DE PARES muda, não a cada
 * frame. Assim o React re-renderiza ~6 vezes na página inteira em vez de 60×/s.
 */
import { supino } from "@/config/site";

const ouvintes = new Set();

let paresAtuais = -1; // -1 força a primeira notificação

/**
 * Quando a hero está presa (pin) com a cena 3D, ela vira a dona da carga: as
 * anilhas entram na barra durante aquele trecho. Sem 3D (mobile, reduced-motion)
 * não há pin, e o scroll global assume. Duas fontes escrevendo no mesmo estado
 * dariam contagens divergentes entre a cena e o HUD.
 */
let heroNoControle = false;

export function assumirControleHero() {
  heroNoControle = true;
}

/** Quantos pares já entraram na barra para um dado progresso (0–1). */
export function paresPara(progresso) {
  let n = 0;
  for (const limiar of supino.limiares) {
    if (progresso >= limiar) n++;
  }
  return n;
}

/** kg na barra com `n` pares carregados. */
export function kgPara(n) {
  return (
    supino.barra +
    supino.pares.slice(0, n).reduce((soma, kg) => soma + kg * 2, 0)
  );
}

function propagar(pares) {
  if (pares === paresAtuais) return;
  paresAtuais = pares;
  ouvintes.forEach((fn) => fn(pares));
}

/** Chamado pelo ScrollTrigger global a cada frame — barato de propósito. */
export function definirProgresso(progresso) {
  if (heroNoControle) return;
  propagar(paresPara(progresso));
}

/**
 * Chamado pelo pin da hero. O progresso aqui é 0–1 dentro do trecho preso, e
 * os limiares são distribuídos por igual: a barra fecha os 6 pares exatamente
 * quando o pin termina.
 */
export function definirProgressoHero(progresso) {
  const total = supino.pares.length;
  propagar(Math.min(total, Math.floor(progresso * total * 1.06)));
}

/** Assina mudanças no número de pares. Devolve a função de cancelamento. */
export function assinarCarga(fn) {
  ouvintes.add(fn);
  if (paresAtuais >= 0) fn(paresAtuais);
  return () => ouvintes.delete(fn);
}

/** Usado em reduced-motion: crava a barra cheia sem depender de scroll. */
export function cravarCargaMaxima() {
  paresAtuais = supino.pares.length;
  ouvintes.forEach((fn) => fn(paresAtuais));
}
