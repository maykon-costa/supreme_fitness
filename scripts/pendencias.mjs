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

if (achados.length === 0) {
  console.log("\n  Nenhuma pendência. Pode publicar.\n");
  process.exit(0);
}

console.log(`\n  ${achados.length} pendência(s) com o cliente:\n`);
for (const a of achados) {
  console.log(`  ${a.arquivo}:${a.linha}`);
  console.log(`    ${a.texto}\n`);
}
console.log("  Resolva antes de publicar — LP_GUIDE §10.\n");
process.exit(1);
