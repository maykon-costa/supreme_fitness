# Supreme Fitness — Brief Criativo & Plano de Execução

> Cliente: **Supreme Fitness** — `@academia.supreme` · 12K seguidores
> Rua João Pereira de Abreu, 21 — Santa Cruz do Capibaribe, PE
> (81) 98995-7810 · academiasupreme@gmail.com · CREF 000798-PJ
> Slogan atual: *"A melhor, SUPREME FITNESS"*
>
> Documento complementar ao [LP_GUIDE.md](LP_GUIDE.md) (v2). O guia diz **como construir**; este diz **o que construir**.

---

## 1. Leitura estratégica

### O público
Santa Cruz do Capibaribe é a **Capital da Confecção** — cidade de gente que trabalha, que empreende, que produz.
O aluno da Supreme não é o "fitness influencer" de capital. É quem sai da fábrica, do galpão, da loja do Moda
Center e vai treinar às 5h ou às 21h. **Isso é o insight central da campanha.**

Consequências diretas de UX:
- **Horário é objeção nº 1.** "Abre cedo? Fecha tarde?" precisa estar visível sem scroll profundo.
- **Preço é objeção nº 2.** Esconder o plano atrás de "consulte" derruba conversão em cidade pequena.
- **Prova social local vale mais que estética global.** 12K seguidores numa cidade de ~100k habitantes é
  autoridade real — isso precisa virar número na tela.
- **Mobile é ~85% do tráfego**, majoritariamente Android intermediário. O conceito precisa ser
  espetacular no desktop e **impecavelmente rápido** no celular.

### O objetivo da LP
Uma métrica só: **cliques no WhatsApp para aula experimental.** Tudo que não empurra para lá é decoração.

### O reposicionamento
"A melhor" é uma afirmação sem prova. A LP existe para **provar**.
Nova tese de comunicação:

> ## SUPREME — **A CIDADE TRABALHA. A GENTE TREINA.**
> *(alternativas: "FEITO PRA QUEM NÃO PARA" · "O PESO É SEU. A ESTRUTURA É NOSSA.")*

---

## 2. Conceito criativo: **PROGRESSIVE OVERLOAD**

> **A página inteira é uma série. Scrollar é levantar.**

Todo o motion da LP obedece a uma metáfora única — sobrecarga progressiva. Conforme o usuário desce:

| Eixo | Início da página | Fim da página |
|---|---|---|
| **Anilhas na barra de supino (HUD fixo)** | **barra vazia, 20 kg** | **6 pares carregados, 180 kg** |
| Peso da tipografia (variable font) | `wght 300` | `wght 900` |
| Saturação / contraste da paleta | frio, quase mono | vermelho-supreme saturado |
| Densidade do grid | arejado | compacto, empilhado |
| Ritmo do scroll (Lenis + scrub) | solto | curto, "travado", pesado |

### O HUD da barra de supino

O eixo principal do conceito. Um chip fixo no canto inferior esquerdo desenha uma
**barra de supino que ganha um par de anilhas a cada trecho vencido da página**.
Scrollar deixa de ser "um número subindo" e vira **carregar a barra**.

Por que funciona melhor que um contador:
- **É discreto, não contínuo.** Cada anilha que entra é um evento com peso — feedback
  satisfatório, na régua de um "achievement", em vez de um número borrado passando.
- **O número vira consequência.** 20 → 60 → 100 → 130 → 150 → 170 → 180 kg. Ele anda em
  degraus porque a carga na barra anda em degraus. Coerência total entre desenho e dado.
- **A carga é plausível.** 180 kg num supino é impressionante e real. Um contador solto de
  "1.240 kg" era abstrato e não se ancorava em nada.
- **Ordem de carregamento é a da academia:** anilha pesada por dentro, leve por fora
  (`20, 20, 15, 10, 10, 5` por lado).

Custo técnico: **zero**. É SVG (nítido em qualquer tela, roda em celular onde o WebGL
nem é montado — LP_GUIDE §5.3), alimentado pelo mesmo `ScrollTrigger` global via um store
que só notifica o React quando o **número de pares** muda — ~6 re-renders na página
inteira, não 60 por segundo.

Divisão de libs no HUD, sem sobreposição (LP_GUIDE §1):
GSAP dirige o scroll → Motion anima a entrada de cada anilha (mount/unmount) →
anime.js tweena o contador de kg.

É um sistema, não um efeito. Isso é o que separa uma LP com animação de uma LP **premiável** — e nenhum
concorrente de academia no agreste vai ter algo parecido. É o "disruptivo" com significado, não gratuito.

### Por que isso funciona tecnicamente
Quase tudo acima custa **quase zero**: é um único `ScrollTrigger` global com `scrub` alimentando
variáveis CSS (`--wght`, `--sat`) e um store leve para o HUD. O visual é caríssimo; o bundle é barato.

```js
// src/App.jsx — UM ScrollTrigger para o documento inteiro alimenta a página toda
ScrollTrigger.create({
  trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.6,
  onUpdate: (self) => {
    const p = self.progress;
    const raiz = document.documentElement;
    raiz.style.setProperty("--progresso", p.toFixed(4));
    raiz.style.setProperty("--wght", String(Math.round(300 + p * 600)));
    raiz.style.setProperty("--sat", (0.4 + p * 0.6).toFixed(3));
    definirProgresso(p); // store da barra — só notifica quando muda de par
  },
});
```

```js
// src/config/site.js — a barra é dado, não código
export const supino = {
  barra: 20,                          // barra olímpica
  pares: [20, 20, 15, 10, 10, 5],     // kg por lado, pesada por dentro
  limiares: [0.08, 0.22, 0.37, 0.52, 0.66, 0.8], // ponto do scroll de cada par
};
// CARGA_TOTAL = 20 + 2×80 = 180 kg (derivado, não editar à mão)
```

Ajustar o ritmo de carregamento é mexer em `limiares`. Trocar a progressão de peso é mexer
em `pares`. Nenhum componente precisa ser tocado.

---

## 3. Identidade visual

### Paleta — 3 cores, ponto final
```
--supreme       #FFBB00   ← ação, CTA, acento. Amarelo oficial da academia
--supreme-esc   #E5A600   ← hover do amarelo
--carbono       #0A0A0B   ← fundo dominante. Preto com leve azul, não puro
--aco           #8A8F98   ← metal escovado, textos secundários
--branco        #F4F4F2   ← off-white, nunca #FFF (agride em fundo escuro)
```

⚠️ **Regra de contraste do amarelo.** Diferente de um vermelho, `#FFBB00` é uma cor
**clara**. Os números:

| Combinação | Contraste | Veredito |
|---|---|---|
| Amarelo sobre carbono (texto, ícone, borda) | **11,6:1** | ✅ ótimo |
| Carbono sobre amarelo (texto em botão/faixa) | **11,6:1** | ✅ ótimo |
| Off-white sobre amarelo | **1,5:1** | ❌ ilegível |

Ou seja: **todo texto sobre fundo amarelo é `text-carbono`, nunca `text-branco`.**
Vale para botão primário, botão fixo, faixa de prova, selo "mais escolhido",
selo "Depois" e link de pular conteúdo.

Efeito colateral positivo da troca: o vermelho antigo dava só 4,4:1 contra o
carbono, ou seja, reprovava no mínimo de 4,5:1 para texto normal (LP_GUIDE §7).
O amarelo resolve isso — texto e detalhes de acento passaram a ser legíveis.
Fundo escuro é decisão estratégica: academia é ambiente noturno/industrial, foto de treino fica melhor
sobre preto, e economiza bateria em OLED.

### Tipografia
| Uso | Fonte | Por quê |
|---|---|---|
| Display / números | **Anton** ou **Archivo Expanded** (variable) | Condensada pesada = "peso" literal |
| Corpo | **Inter Variable** | Legibilidade em tela pequena, eixo `wght` para o scrub |

Números (carga, preços, contadores) sempre com `font-variant-numeric: tabular-nums` — sem isso o
contador "pula" enquanto anima.

### Regra fotográfica
**Zero banco de imagens.** Foto real, alunos reais, na academia real. Grão sutil + high contrast +
dessaturação parcial com o vermelho preservado. Se a foto do cliente for ruim, a entrega inclui
**uma sessão de fotos** — é o item de maior impacto visual do projeto e nenhum shader compensa foto ruim.

---

## 4. Arquitetura da página (seção a seção)

### 00 · Preloader — "AQUECIMENTO" `[anime.js]`
Barra de carga de 0 a 100 com o logo em SVG sendo desenhado (`svg.createDrawable`).
Máximo **1.2s**, e some assim que o hero estiver pronto — preloader longo é abandono.
Enquanto isso, faz o `ScrollTrigger.refresh()` pós-fontes.

### 01 · Hero — "A CIDADE TRABALHA. A GENTE TREINA." `[Three.js + GSAP]`
- **Fundo:** vídeo real de treino em loop (< 2MB, poster obrigatório) com **shader de distorção sutil**
  reagindo ao mouse — plano fullscreen com displacement, não geometria. Custo baixíssimo.
- **Camada 3D:** uma **anilha de 20kg** em metal escovado girando lento no eixo Y, com o logo em relevo.
  Parallax de mouse suave (lerp, nunca 1:1). É a única geometria real do site.
  `.glb` < 300kb, Draco. **Mobile: substituída por PNG com CSS transform** — igual bonito, zero WebGL.
- **Tipografia:** headline com SplitText por linha, revelando com máscara e `expo.out`.
- **HUD:** contador de carga fixo no canto (`--carga` do §2) — assina o conceito desde o primeiro frame.
- **CTA:** "Aula experimental grátis" → WhatsApp. Sempre visível.

> ⚠️ O LCP tem que ser o poster do vídeo, não o canvas. Ver LP_GUIDE §5.1.

### 02 · Barra de prova — marquee reativo `[GSAP]`
Faixa vermelha infinita: `12 MIL ALUNOS · CREF 000798-PJ · ABERTO ÀS 5H · MUSCULAÇÃO · FUNCIONAL · …`
Skew reativo à velocidade do scroll (LP_GUIDE §4.5). Barato, imediato, e comunica autoridade em 2 segundos.

### 03 · Estrutura — parallax multicamada `[GSAP]`
4 camadas com speeds `0.1 / 0.2 / 0.35 / 0.5`: fundo do galpão → equipamentos → aluno → texto.
Cada imagem com `scale: 1.15` para nunca revelar borda.
Copy focada em **equipamento e espaço** — em cidade do interior, "estrutura" é o principal diferencial percebido.

### 04 · Modalidades — scroll horizontal com pin `[GSAP + shader]`
Musculação · Funcional · Cross · Dança/Ritmos · Avaliação Física · Personal.
Track horizontal preso na viewport. Cada card com **distorção RGB no hover** (shader 2D no plano da imagem).
Mobile: vira carrossel de swipe nativo com scroll-snap — **sem pin**, pin no mobile é hostil.

### 05 · Transformações — antes/depois com scrub `[GSAP + Motion]`
Aqui está o dinheiro. Não use o slider de arrastar clichê: o **scroll faz o wipe**, e o
contador de "semanas" e "kg perdidos" corre junto (`anime.js`). Depoimento em texto curto ao lado.
Mínimo 4 casos reais, com nome e tempo de treino.

### 06 · Planos — a seção que converte `[Motion + anime.js]`
- 3 planos, preço **visível**, um destacado como "mais escolhido".
- Preço com contador animado ao entrar na viewport.
- Card 3D tilt sutil no hover (máx 6° — mais que isso vira brinquedo).
- **Cada plano com seu próprio botão de WhatsApp e mensagem pré-preenchida** (`origem` diferente por plano —
  ver LP_GUIDE §3). Assim o cliente sabe qual plano gerou o lead antes de responder.

### 07 · Horários & Localização `[GSAP]`
- Grade de horários por dia, com **"agora aberto/fechado" calculado em tempo real** — detalhe pequeno,
  percepção de site "vivo".
- Indicador de horário de pico (barra de intensidade) — resolve a objeção "vai estar lotado?".
- Mapa em tema dark customizado + botão "Traçar rota" abrindo o Google Maps nativo.

### 08 · CTA final — full screen `[Three.js reaproveitado]`
Reusa a cena da hero (mesmo chunk, zero download extra), agora com a anilha em close e o
contador de carga cravando o valor final. Headline: **"SUA PRIMEIRA SÉRIE COMEÇA HOJE."**

### 09 · Footer
NAP idêntico ao Google Business, CREF, Instagram, mapa, selo. Discreto.

### Persistente · Botão fixo de WhatsApp `[Motion]`
Aparece após 100px (com `{ passive: true }`), some quando a seção de CTA final entra na tela — evita
dois CTAs competindo.

---

## 5. Divisão de bibliotecas neste projeto

Aplicação concreta da regra do LP_GUIDE §1:

| Lib | Onde entra | Chunk |
|---|---|---|
| **GSAP + ScrollTrigger + SplitText** | Conceito de sobrecarga, parallax, pin horizontal, marquee, reveals de texto, wipe do antes/depois | inicial |
| **Lenis** | Smooth scroll (desligado em `reduced-motion` e no touch) | inicial |
| **Motion** (`motion/react`) | Menu mobile, `AnimatePresence` do preloader, hover/tap dos cards de plano, botão fixo | inicial |
| **anime.js v4** | Preloader (SVG draw), contadores de preço/carga/semanas | inicial |
| **Three.js / R3F** | Só hero + CTA final (mesma cena), lazy e condicional | **lazy, separado** |

Nenhuma sobreposição de domínio. Se em algum momento duas libs quiserem animar o mesmo elemento, **algo
está errado no plano** — revise antes de codar.

---

## 6. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| **4 libs de animação incham o bundle** | Chunks separados; Three lazy + condicional; alvo de 180kb gz iniciais. Se estourar, a primeira a cair é o anime.js (contadores dão para fazer em GSAP) |
| **WebGL travando em Android intermediário** | Gating por `deviceMemory`/`hardwareConcurrency`/`saveData` (LP_GUIDE §5.1). Fallback estático é a experiência padrão no mobile, não a exceção |
| **Scroll-jacking irritando quem só quer o preço** | Lenis com `duration` curta, nenhuma seção com pin > 1 viewport de scroll extra, e âncora "Planos" no menu que pula direto |
| **Cliente não ter foto/vídeo bom** | Sessão de fotos e vídeo dentro do escopo. Sem isso o conceito não se sustenta — negocie isso *antes* de fechar |
| **Conteúdo (preços, horários) desatualizar** | Tudo em `config/site.js`, uma edição de 2 minutos |

---

## 7. Ordem de execução sugerida

1. **Coleta:** preços, horários reais, fotos/vídeo, depoimentos, logo em vetor, coordenadas do mapa
2. **Fundação:** Vite + Tailwind + `config/site.js` + `lib/gsap.js` + `lib/lenis.js` + SEO/JSON-LD
3. **Conteúdo sem motion:** página inteira estática, responsiva e acessível — **e já publicável**
4. **Camada GSAP:** conceito de sobrecarga, parallax, pin, reveals
5. **Camada Motion + anime.js:** UI e contadores
6. **Camada 3D:** hero por último, sempre como enhancement sobre o fallback já pronto
7. **Auditoria:** checklist do LP_GUIDE §10 com CPU 4× e Fast 4G, em Android real

> A ordem importa: construir na sequência acima significa que **em qualquer ponto o projeto é entregável**.
> Se o prazo apertar, corta-se do fim (o 3D) sem quebrar nada.
