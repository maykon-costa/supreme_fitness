/**
 * Lista tudo que ainda depende do cliente antes de publicar.
 * Uso: npm run pendencias
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ALVOS = ["src"];
const EXTENSOES = [".js", ".jsx", ".css", ".html"];

function varrer(dir, arquivos = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) varrer(caminho, arquivos);
    else if (EXTENSOES.some((e) => nome.endsWith(e))) arquivos.push(caminho);
  }
  return arquivos;
}

const achados = [];

for (const alvo of ALVOS) {
  for (const arquivo of varrer(join(RAIZ, alvo))) {
    const linhas = readFileSync(arquivo, "utf8").split("\n");
    linhas.forEach((linha, i) => {
      if (/PENDENTE/.test(linha)) {
        achados.push({
          arquivo: relative(RAIZ, arquivo).replace(/\\/g, "/"),
          linha: i + 1,
          texto: linha.trim().slice(0, 110),
        });
      }
    });
  }
}

// ---- imagens: quais slots ainda não têm arquivo em src/assets/imgs ----
const SLOTS = [
  ["hero", "Vídeo/foto de fundo do topo — plano geral em horário cheio"],
  ["estrutura-salao", "Salão de musculação, plano geral"],
  ["estrutura-aluno", "Aluno no rack de agachamento, close médio"],
  ["estrutura-detalhe", "Macro: anilha ou barra com a marca visível"],
  ["fachada", "Fachada à noite, letreiro aceso"],
  ["modalidade-musculacao", "Aula/treino de musculação"],
  ["modalidade-funcional", "Aula de funcional"],
  ["modalidade-cross", "Aula de cross"],
  ["modalidade-danca", "Aula de dança e ritmos"],
  ["modalidade-avaliacao", "Avaliação física em andamento"],
  ["modalidade-personal", "Personal acompanhando aluno"],
  ...[1, 2, 3, 4].flatMap((i) => [
    [`transformacao-${i}-antes`, `Aluno ${i} — foto ANTES`],
    [`transformacao-${i}-depois`, `Aluno ${i} — foto DEPOIS (mesma pose e luz)`],
  ]),
];

const DIR_IMGS = join(RAIZ, "src", "assets", "imgs");
let existentes = [];
try {
  existentes = readdirSync(DIR_IMGS).map((f) =>
    f.replace(/\.[^.]+$/, "").toLowerCase()
  );
} catch {
  existentes = [];
}

const faltando = SLOTS.filter(([slot]) => !existentes.includes(slot));

if (achados.length === 0 && faltando.length === 0) {
  console.log("\n  Nenhuma pendência. Pode publicar.\n");
  process.exit(0);
}

if (achados.length) {
  console.log(`\n  ${achados.length} pendência(s) de conteúdo:\n`);
  for (const a of achados) {
    console.log(`  ${a.arquivo}:${a.linha}`);
    console.log(`    ${a.texto}\n`);
  }
}

if (faltando.length) {
  console.log(
    `\n  ${faltando.length} de ${SLOTS.length} imagem(ns) faltando em src/assets/imgs/:\n`
  );
  for (const [slot, desc] of faltando) {
    console.log(`  ${(slot + ".webp").padEnd(32)} ${desc}`);
  }
  console.log("\n  Salve com esse nome exato — o site usa automaticamente.\n");
}

console.log("  Resolva antes de publicar — LP_GUIDE §10.\n");
process.exit(1);
