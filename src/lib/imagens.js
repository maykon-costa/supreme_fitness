/**
 * Resolução de imagens por convenção de nome de arquivo.
 *
 * COMO USAR: solte o arquivo em `src/assets/imgs/` com o nome do slot.
 * Ex.: `src/assets/imgs/hero.webp` preenche o slot "hero". Só isso — nenhum
 * import, nenhuma edição de componente.
 *
 * Se o arquivo não existir, o slot cai no placeholder do <Foto>, que descreve
 * a foto que falta. Ou seja: a página nunca quebra por imagem ausente, e dá
 * para ir preenchendo aos poucos conforme o cliente entrega o material.
 *
 * O Vite processa tudo que está em `src/assets` — gera hash no nome (cache
 * eterno) e inlina os arquivos muito pequenos. Por isso as imagens moram aqui
 * e não em `/public`, que é servido cru, sem hash. LP_GUIDE §9.
 */

// eager: a LP usa praticamente todas as imagens, então resolver na hora do
// build sai mais barato que criar N chunks dinâmicos.
const arquivos = import.meta.glob(
  "../assets/imgs/*.{avif,webp,jpg,jpeg,png,svg}",
  { eager: true, import: "default" }
);

/** { "hero": "/assets/hero-a1b2c3.webp", ... } */
const porSlot = {};

for (const [caminho, url] of Object.entries(arquivos)) {
  const arquivo = caminho.split("/").pop();
  const slot = arquivo.replace(/\.[^.]+$/, "").toLowerCase();

  // Se houver o mesmo slot em formatos diferentes, o .avif/.webp ganha do .jpg
  const jaTem = porSlot[slot];
  const ehModerno = /\.(avif|webp)$/i.test(arquivo);
  if (!jaTem || ehModerno) porSlot[slot] = url;
}

/** URL da imagem do slot, ou undefined se o arquivo ainda não foi adicionado. */
export function urlDaImagem(slot) {
  if (!slot) return undefined;
  return porSlot[slot.toLowerCase()];
}

/** Slots efetivamente preenchidos — usado pelo `npm run pendencias`. */
export function slotsPreenchidos() {
  return Object.keys(porSlot).sort();
}
