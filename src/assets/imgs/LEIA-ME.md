# Imagens da LP

**Para colocar uma foto: salve o arquivo NESTA PASTA com o nome do slot.**
Nada mais. Sem editar código, sem import.

Ex.: `hero.webp` preenche o topo. Se o arquivo não existir, aparece um
placeholder descrevendo a foto que falta — a página nunca quebra.

Rode `npm run pendencias` para ver a lista do que ainda falta.

## Nomes dos slots

| Arquivo | O que é |
|---|---|
| `hero.webp` | Fundo do topo — plano geral em horário cheio |
| `estrutura-salao.webp` | Salão de musculação, plano geral |
| `estrutura-aluno.webp` | Aluno no rack, close médio |
| `estrutura-detalhe.webp` | Macro: anilha/barra com a marca |
| `fachada.webp` | Fachada à noite, letreiro aceso |
| `modalidade-musculacao.webp` | Treino de musculação |
| `modalidade-funcional.webp` | Aula de funcional |
| `modalidade-cross.webp` | Aula de cross |
| `modalidade-danca.webp` | Aula de dança e ritmos |
| `modalidade-avaliacao.webp` | Avaliação física |
| `modalidade-personal.webp` | Personal com aluno |
| `transformacao-N-antes.webp` | Aluno N — ANTES (N = 1 a 4) |
| `transformacao-N-depois.webp` | Aluno N — DEPOIS (N = 1 a 4) |

## Regras

- **Formato:** `.webp` (ou `.avif`). Converta em https://squoosh.app — qualidade
  75–80. Aceita `.jpg`/`.png` também, mas pesa 3 a 5× mais.
- **Peso:** máximo **200 KB** por imagem. O `hero` pode ir até 300 KB.
- **Proporção:** o corte é automático (`object-cover`), mas respeite o formato
  para não perder o enquadramento:
  - `hero` — horizontal (16/9)
  - `estrutura-salao` — vertical (3/4)
  - `estrutura-aluno`, `transformacao-*` — vertical (4/5)
  - `estrutura-detalhe` — quadrada (1/1)
  - `modalidade-*`, `fachada` — horizontal (4/3)
- **Antes/depois:** mesma pose, mesma luz, mesmo enquadramento. Sem isso o
  efeito de comparação não funciona.
- **Autorização de imagem assinada** para qualquer aluno identificável.

Se tiver o mesmo slot em `.webp` e `.jpg`, o `.webp` ganha.
