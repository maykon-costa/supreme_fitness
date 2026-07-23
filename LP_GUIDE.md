# Guia de Landing Pages — Stack, Template & Motion System

> **v3 — Julho/2026.** Base: `lading-page-amanda` (v1) → `supreme_fitness` (v2/v3).
>
> A v1 cobria a casca (React + Vite + Tailwind + IntersectionObserver).
> A v2 adicionou a camada de motion (GSAP, Three.js, anime.js, Motion).
> **A v3 é a v2 corrigida pela realidade**: tudo aqui foi construído, medido e
> quebrado pelo menos uma vez. As seções §12 (armadilhas) e §13 (verificação)
> são as que mais economizam tempo — leia antes de começar, não depois.

---

## 1. Stack

| Camada | Tecnologia | Versão | Notas |
|---|---|---|---|
| Framework | React | 19 | |
| Bundler | Vite | 8 | **roda em Rolldown** — muda a config, ver §12.1 |
| Estilização | Tailwind CSS | 4 | via `@tailwindcss/vite` |
| Ícones | Lucide React | 1.x | **sem ícones de marca** — ver §12.2 |
| **Scroll engine** | **Lenis** | 1.x | ~3kb |
| **Motion de scroll** | **GSAP + ScrollTrigger + SplitText** | 3.13+ | grátis desde abr/2025, incl. plugins |
| **3D / WebGL** | **three.js puro** | r18x | **sem R3F** — ver §5.1 |
| **Micro-interações React** | **Motion** (`motion/react`) | 12.x | com `LazyMotion` — ver §6.2 |
| **Contadores / SVG** | **anime.js** | v4 | `createScope` obrigatório |
| Linguagem | JavaScript (JSX) | ES Modules | |

### ⚠️ Regra de ouro: 4 libs de animação = 4 formas de errar

Quatro engines de motion no mesmo bundle **só se justifica se cada uma tiver um
papel exclusivo**. Se duas libs animarem a mesma propriedade do mesmo elemento,
brigam pelo `transform` e o resultado é jank.

| Lib | Domínio exclusivo | Nunca use para |
|---|---|---|
| **GSAP + ScrollTrigger** | Tudo dirigido por scroll: pin, scrub, parallax, horizontal, reveals de texto, timelines longas | Estado de componente React |
| **Motion** (`motion/react`) | UI React com estado: menu, modal, `AnimatePresence`, `layout`, hover/tap | Scroll storytelling |
| **anime.js v4** | Contadores numéricos, SVG (`draw`), sequências fora do scroll | Qualquer coisa com ScrollTrigger |
| **three.js** | 1 a 2 cenas no máximo. Nada mais | O que dá para fazer em CSS/SVG |

> Se der para cortar uma lib sem perder efeito, **corte**. Foi assim que o R3F
> saiu deste guia (§5.1) e o `motion` completo virou `LazyMotion` (§6.2).

### Custo real de cada lib (gzip, medido)

| Chunk | gz | Observação |
|---|---|---|
| `vendor` (react + react-dom) | 57 kb | piso inegociável |
| `gsap` (core + ScrollTrigger + SplitText) | 50 kb | o preço do storytelling |
| `motion` **com LazyMotion** | 25 kb | eram 40 kb sem |
| `anime` | 13 kb | o primeiro a cair se estourar o teto |
| `three` **puro** (lazy) | 141 kb | eram 236 kb com R3F |

**Total inicial deste projeto: ~172 kb gz.** Use como referência.

---

## 2. Estrutura de Pastas

```
src/
├── assets/
│   └── imgs/              ← fotos por convenção de nome (§9.1) + LEIA-ME.md
│
├── components/
│   ├── ui/                ← genéricos reutilizáveis
│   │   ├── BtnAgend.jsx
│   │   ├── BtnFixo.jsx
│   │   ├── Contador.jsx        ← anime.js
│   │   ├── SplitHeading.jsx    ← GSAP SplitText
│   │   ├── Foto.jsx            ← slot de imagem + placeholder (§9.1)
│   │   ├── Logo.jsx            ← lockup da marca, UM lugar só (§12.8)
│   │   ├── IconesSociais.jsx   ← marcas em SVG inline (§12.2)
│   │   └── Marquee.jsx
│   │
│   ├── sections/          ← cada seção da LP em arquivo próprio
│   │
│   └── three/             ← TUDO de WebGL isolado (chunk separado)
│       └── HeroScene.jsx       ← default export, via React.lazy
│
├── hooks/
│   ├── useCan3D.js        ← gating de device + `podeUsar3D()` síncrono (§5.2)
│   └── useReducedMotion.js
│
├── lib/
│   ├── gsap.js            ← registro central de plugins (import único)
│   ├── lenis.js           ← instância + bridge com ScrollTrigger
│   ├── imagens.js         ← resolução de fotos por nome de arquivo (§9.1)
│   └── <estado>.js        ← store leve entre ScrollTrigger e React (§4.8)
│
├── config/
│   └── site.js            ← ÚNICO ARQUIVO DE CONTEÚDO A EDITAR POR LP
│
├── utils/
│   ├── contato.js
│   └── horario.js         ← "aberto agora" no fuso do cliente (§8.2)
│
├── animation.css
├── index.css
├── main.jsx
└── App.jsx                ← só sections + providers, zero conteúdo inline
```

### `config/site.js`

Toda LP compartilha a mesma casca. O que muda é o conteúdo. Centralizar elimina
caçar texto dentro de 900 linhas de JSX.

```js
export const site = {
  nome: "Supreme Fitness",
  registro: "CREF 000798-PJ",
  slogan: "A cidade trabalha. A gente treina.",

  contato: {
    whatsapp: import.meta.env.VITE_WHATSAPP_PHONE,
    telefoneExibicao: "(81) 98995-7810",
    endereco: "Rua João Pereira de Abreu, 21",
  },

  // Arrays com item visual carregam o SLOT da imagem, não o import
  modalidades: [
    { nome: "Musculação", imagem: "modalidade-musculacao", texto: "..." },
  ],

  planos: [{ id: "mensal", nome: "Mensal", preco: 169.9, destaque: false }],
  stats: [{ valor: 12, sufixo: "K", label: "Alunos" }],
};
```

Convenções que evitam retrabalho:

- **Contadores:** guarde `valor` como **número** + `sufixo` como string separada.
  O contador precisa interpolar número, não parsear `"12K+"`.
- **Preços:** número (`169.9`), nunca string. A formatação é do componente.
- **Imagens:** guarde o **slot** (string), nunca o `import`. Ver §9.1.
- **Valores derivados:** calcule, não duplique.
  `export const TOTAL = base + itens.reduce(...)`.
- **`PENDENTE`:** marque tudo que depende do cliente com essa palavra e rode
  `npm run pendencias` (§10.1). Preço inventado que vaza para produção é o pior
  bug possível — não aparece no build, aparece na cobrança.

---

## 3. Variáveis de Ambiente

```env
# .env.local  (coberto por `*.local` no .gitignore padrão do Vite)
VITE_WHATSAPP_PHONE=5581989957810
VITE_WHATSAPP_MESSAGE=Olá! Quero agendar minha aula experimental.
VITE_EMAIL=contato@cliente.com.br
VITE_SITE_URL=https://dominio.com.br
```

> ⚠️ **Tudo com prefixo `VITE_` é inlinado no bundle e fica PÚBLICO.** Em CI use
> *Variables*, não *Secrets* — Secret aqui só dá falsa sensação de sigilo.
> Nunca coloque nada realmente sensível.

```js
// src/utils/contato.js
export function handleWhatsAppClick(origem = "site", mensagemCustom) {
  const phone = import.meta.env.VITE_WHATSAPP_PHONE;
  const message = mensagemCustom || import.meta.env.VITE_WHATSAPP_MESSAGE;
  window.dataLayer?.push({ event: "click_whatsapp", origem });
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}
```

`origem` é obrigatória em cada CTA (`"hero"`, `"planos_mensal"`, `"btn_fixo"`).
Sem ela você não sabe qual seção converte — e o cliente não sabe qual plano
gerou o lead antes de responder.

---

## 4. Motion System

### 4.1 Setup central do GSAP

```js
// src/lib/gsap.js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };
```

Importe **sempre** de `@/lib/gsap`, nunca de `"gsap"` direto nos componentes.

### 4.2 Lenis + ScrollTrigger (a ponte obrigatória)

```js
export function initLenis() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};                    // nem inicializa
  }

  const lenis = new Lenis({
    autoRaf: false,      // o ticker do GSAP assume o loop
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,    // NÃO force smooth no touch
  });

  const raf = (time) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => { gsap.ticker.remove(raf); lenis.destroy(); };
}
```

Sem compartilhar o mesmo `raf`, o scrub atrasa um frame.

### 4.3 Cleanup no React 19 — `useGSAP`

```jsx
useGSAP(() => {
  gsap.from(".alvo", { y: 30, opacity: 0, scrollTrigger: { trigger: root.current } });
}, { scope: root });   // escopa os seletores e limpa tudo no unmount
```

Sem `scope`, o StrictMode duplica ScrollTriggers.

### 4.4 Parallax — o padrão correto

`background-attachment: fixed` é proibido (quebra no iOS, força repaint).

```js
gsap.utils.toArray("[data-parallax]").forEach((el) => {
  const speed = parseFloat(el.dataset.parallax) || 0.2;
  gsap.fromTo(el,
    { yPercent: -speed * 50 },
    { yPercent: speed * 50, ease: "none",
      scrollTrigger: {
        trigger: el.closest("[data-parallax-cena]") ?? el.parentElement,
        start: "top bottom", end: "bottom top",
        scrub: true, invalidateOnRefresh: true,
      } }
  );
});
```

3 a 4 camadas (`0.1` fundo → `0.5` frente), imagens em `scale: 1.15` para nunca
revelar a borda. Mais que 4 ninguém percebe e o custo dobra.

### 4.5 Receitas de scroll de alto impacto

**Texto revelando por linha:**
```js
SplitText.create(el, {
  type: "lines", mask: "lines", linesClass: "linha", autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 115, opacity: 0, duration: 1, stagger: 0.09, ease: "expo.out",
    scrollTrigger: { trigger: el, start: "top 82%" },
  }),
});
```
> ⚠️ Com `line-height < 1` isso **corta acentos**. Ver §12.4 — crítico em PT-BR.

**Seção horizontal com pin:**
```js
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: section, pin: true, scrub: 1,
    end: () => "+=" + (track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true,
  },
});
```
No mobile, **sem pin** — vira carrossel com `scroll-snap`. Pin em tela pequena
rouba o gesto do usuário.

**Marquee com skew reativo à velocidade:**
```js
const skewTo = gsap.quickTo(trilho, "skewX", { duration: 0.45, ease: "power3" });
ScrollTrigger.create({
  onUpdate: (self) => skewTo(gsap.utils.clamp(-9, 9, self.getVelocity() / -190)),
});
```

**Wipe antes/depois:** anime `clip-path` (composited), nunca `width`.

### 4.6 anime.js v4 no React — sempre com `createScope`

```jsx
useEffect(() => {
  scope.current = createScope({ root }).add(() => {
    const estado = { v: partida };
    animate(estado, {
      v: destino, duration: 620, ease: "out(3)",
      onUpdate: () => { alvo.textContent = Math.round(estado.v); },
    });
  });
  return () => scope.current?.revert();
}, [destino]);
```

Anime um **objeto JS** e escreva no DOM no `onUpdate` — é estável entre versões,
diferente de animar `innerHTML` direto. Dispare quando entrar na viewport
(ScrollTrigger `once: true` como gatilho, sem animar propriedade — sem conflito).

### 4.7 Motion — só UI com estado

```jsx
<AnimatePresence>
  {aberto && <m.nav initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} />}
</AnimatePresence>
```

Prefira `opacity`/`transform`. Evite `width`, `height`, `top`, `left`,
`box-shadow`, `filter` — são os que estouram o frame budget.

> ⚠️ Transform 3D permanente (tilt em repouso) cria camada de composição e o
> texto perde antialiasing subpixel — em fundo escuro vira franja colorida.
> Aplique o transform **só durante o hover**, com estado.

### 4.8 Ponte ScrollTrigger → React: store leve

Quando o scroll precisa alimentar um componente React, **não crie um
ScrollTrigger por componente**. Um trigger global empurra para um store, e o
store só notifica quando o valor **discreto** muda:

```js
// src/lib/carga.js
const ouvintes = new Set();
let atual = -1;

export function definirProgresso(p) {
  const passo = calcularPasso(p);        // ex.: 0–6 pares de anilha
  if (passo === atual) return;           // ← a chave: filtra 60fps → ~6 eventos
  atual = passo;
  ouvintes.forEach((fn) => fn(passo));
}

export function assinar(fn) {
  ouvintes.add(fn);
  if (atual >= 0) fn(atual);
  return () => ouvintes.delete(fn);
}
```

Resultado: ~6 re-renders na página inteira em vez de 60 por segundo. Bônus —
cena 3D e HUD leem do mesmo store e **nunca divergem**.

---

## 5. Three.js / WebGL — regras de sobrevivência

### 5.1 Use three.js puro, não React Three Fiber

Medido neste projeto: o chunk com `@react-three/fiber` + `drei` fechava
**236 kb gz**, acima do teto de 200 kb (§6). Em three.js puro: **141 kb gz**.

Para 1 mesh, 2–3 luzes e um loop de render, a camada declarativa do R3F custa
~45 kb gz sem entregar nada que 150 linhas de `useEffect` não resolvam. R3F só
se paga em cenas com muitos objetos, física ou ecossistema de hooks.

**Geometria procedural > `.glb`.** Uma anilha, uma barra, um plano com shader —
tudo isso sai de `ExtrudeGeometry`/`CylinderGeometry` com zero download. Só
importe modelo quando a forma for realmente irreproduzível.

**Environment sem rede:** `RoomEnvironment` + `PMREMGenerator` dão reflexo de
metal convincente sem baixar HDR.

```js
const pmrem = new THREE.PMREMGenerator(renderer);
const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
scene.environment = env.texture;
```

### 5.2 Carregamento condicional + lazy

```js
// src/hooks/useCan3D.js — exporte AS DUAS formas
export function podeUsar3D() {          // síncrona: para decidir pin (§12.6)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.deviceMemory ?? 4) < 4) return false;
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl2") || c.getContext("webgl"));
}

export function useCan3D() {            // assíncrona: para montar o Canvas
  const [can3D, setCan3D] = useState(false);   // começa false: 1º paint é fallback
  useEffect(() => {
    const id = requestIdleCallback(() => setCan3D(podeUsar3D()), { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }, []);
  return can3D;
}
```

> **O LCP nunca pode ser o `<canvas>`.** Renderize o poster imediatamente e
> deixe a cena entrar por cima. Assim o Core Web Vitals mede o `<img>`.

### 5.3 Loop e descarte

- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))` — nunca ilimitado
- `antialias: false` em silhuetas curvas escuras (não aparece, economiza muito)
- **Pause fora da viewport** (`IntersectionObserver`) **e com a aba oculta**
  (`visibilitychange`). Ao voltar, descarte o delta acumulado do `Clock`
- `pointer-events: none` no wrapper — nunca roube o clique do CTA
- Cleanup: `cancelAnimationFrame`, `.dispose()` em geometrias/materiais/texturas,
  `pmrem.dispose()`, `renderer.dispose()`, `domElement.remove()`

### 5.4 Direção de arte 3D (o que faz parecer caro)

Três lições que valem mais que qualquer otimização:

1. **Proporção importa mais que polígono.** Uma barra olímpica precisa de eixo
   ~4× o diâmetro da anilha. Com eixo curto, o objeto lê como *halter* — a
   pessoa não sabe dizer por quê, só acha estranho. Meça referências reais.
2. **Rotação contínua é armadilha.** Girando 360°, o objeto passa por ângulos
   quase de topo onde tudo se sobrepõe e vira borrão. Prefira **balanço em
   seno** em torno de um 3/4 bom: `rot.y = base + sin(t * 0.34) * 0.13`.
3. **Enquadramento dirigido por estado.** Objeto grande cruza a headline e mata
   a legibilidade. Faça-o começar recuado e vir ao centro conforme o conteúdo
   textual sai — a composição nunca disputa leitura.

### 5.5 Alternativa mais barata que 3D

Em 80% dos casos não precisa de geometria. Um **shader 2D em plano fullscreen**
(distorção no hover, ondulação, grain, RGB shift) custa uma fração e entrega o
mesmo "uau". E um **HUD em SVG** (§4.8) roda até onde o WebGL nem é montado.

---

## 6. Orçamento de Performance (não negociável)

| Métrica | Alvo | Como medir |
|---|---|---|
| LCP (mobile, 4G) | **< 2.5s** | Lighthouse mobile |
| INP | **< 200ms** | field data |
| CLS | **< 0.1** | `width`/`height` em toda `<img>` |
| JS inicial (gz) | **< 180kb** | ver §13.1 |
| Chunk 3D (gz, lazy) | **< 200kb** | fora do initial |
| FPS durante scroll | **≥ 55** | DevTools, throttle 4× CPU |

### 6.1 Code splitting — Vite 8 exige função

```js
// vite.config.js
build: {
  rollupOptions: {
    output: {
      // Vite 8 roda em Rolldown: manualChunks SÓ aceita função.
      // O formato objeto (Vite ≤7) quebra o build. Ver §12.1
      manualChunks(id) {
        if (!id.includes("node_modules")) return;
        if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return "three";
        if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) return "gsap";
        if (/[\\/]node_modules[\\/]motion/.test(id)) return "motion";
        if (/[\\/]node_modules[\\/]animejs[\\/]/.test(id)) return "anime";
        if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
          return "vendor";
      },
    },
  },
  chunkSizeWarningLimit: 500,
}
```

### 6.2 `LazyMotion` — corta ~15 kb gz do Motion

```jsx
import { LazyMotion, domAnimation } from "motion/react";
import { m } from "motion/react";           // `m`, não `motion`

<LazyMotion features={domAnimation} strict>  {/* strict: quebra se usar motion.* */}
  <App />
</LazyMotion>
```

Troque **todo** `<motion.x>` por `<m.x>`. `AnimatePresence`, `useSpring`,
`useTransform` e `useMotionValue` continuam iguais.

---

## 7. Acessibilidade

### 7.1 Contraste — calcule, não confie no olho

**Cor de marca clara (amarelo, lima, ciano) inverte a regra do texto.** Antes de
adotar a paleta, rode:

```js
// scripts/contraste.mjs
const lin = (c) => { c /= 255; return c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
const L = (h) => { const n = parseInt(h.slice(1),16);
  return 0.2126*lin(n>>16&255) + 0.7152*lin(n>>8&255) + 0.0722*lin(n&255); };
export const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p);
  return (x+0.05)/(y+0.05); };
```

Exemplo real deste projeto (marca `#FFBB00` sobre `#0A0A0B`):

| Combinação | Contraste | |
|---|---|---|
| Amarelo sobre carbono | 11,65:1 | ✅ texto/ícone/borda |
| Carbono sobre amarelo | 11,65:1 | ✅ **texto do botão** |
| Off-white sobre amarelo | **1,54:1** | ❌ ilegível |

Ou seja: **em botão de cor clara, o texto é escuro.** Se tivesse mantido branco,
os CTAs — justamente o que converte — ficariam ilegíveis.

Bônus da checagem: o vermelho `#E8232A` que estava antes dava **4,43:1**, ou
seja, *reprovava* no mínimo de 4,5:1. Só apareceu porque foi medido.

### 7.2 `prefers-reduced-motion` — CSS **e** JS **e** WebGL

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

O CSS não alcança GSAP nem WebGL:
- Lenis: **não inicialize**
- Pins: **não crie** (`gsap.matchMedia` com `prefers-reduced-motion: no-preference`)
- Canvas: `podeUsar3D()` já barra
- Estados finais: crave o valor final (contador cheio, barra carregada) em vez
  de deixar zerado

### 7.3 Demais

- Toda seção com pin continua navegável por teclado
- `:focus-visible` visível — não remova outline sem substituir
- `alt` descritivo em conteúdo; `alt=""` em decorativa; `aria-hidden` no canvas
- Elemento decorativo que exibe número (HUD de "180 KG") deve ser
  `aria-hidden` inteiro — leitor de tela lendo isso fora de contexto confunde
- Lockup de marca em partes vira **um** `role="img"` + `aria-label`, não pedaços

---

## 8. SEO — Local Business

### 8.1 Head + JSON-LD

`%VITE_SITE_URL%` é substituído pelo Vite no build — **canonical e Open Graph
exigem URL absoluta**, e o Vite não reescreve `content` de `<meta>`:

```html
<html lang="pt-BR">
  <title>Nome | Serviço em Cidade – UF</title>
  <meta name="description" content="120–160 caracteres com serviço + cidade." />
  <link rel="canonical" href="%VITE_SITE_URL%/" />
  <meta property="og:image" content="%VITE_SITE_URL%/og-image.jpg" />  <!-- 1200×630 -->
  <meta property="og:url" content="%VITE_SITE_URL%/" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
</html>
```

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "ExerciseGym",
  "name": "...", "telephone": "+55...", "url": "%VITE_SITE_URL%",
  "address": { "@type": "PostalAddress", "streetAddress": "...",
    "addressLocality": "...", "addressRegion": "PE", "addressCountry": "BR" },
  "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday"], "opens": "05:00", "closes": "22:00" }],
  "sameAs": ["https://www.instagram.com/..."] }
</script>
```

Troque `@type` conforme o negócio: `ExerciseGym`, `HealthAndBeautyBusiness`,
`Restaurant`, `Dentist`, `LocalBusiness`.

Fora do código: Google Business Profile atualizado e **NAP idêntico** entre
site, Instagram, Google e Facebook.

### 8.2 "Aberto agora" — no fuso do cliente

Sinal barato de site vivo, mas calcule no fuso **da empresa**, não do visitante:

```js
const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Recife", weekday: "short", hour: "2-digit",
  minute: "2-digit", hour12: false,
});
```

E o rótulo secundário deve ser **complementar**, nunca repetir o estado.
`"Fechado agora · Fechado agora"` é o bug clássico — quando fechado, informe
**quando abre** (`"Abre amanhã às 05:00"`), que é o que a pessoa quer saber.

---

## 9. Imagens e Vídeo

### 9.1 Slots por convenção de nome (não edite código para trocar foto)

Espalhar `import` de imagem por N arquivos JSX é retrabalho garantido. Resolva
por convenção:

```js
// src/lib/imagens.js
const arquivos = import.meta.glob(
  "../assets/imgs/*.{avif,webp,jpg,jpeg,png,svg}",
  { eager: true, import: "default" }
);

const porSlot = {};
for (const [caminho, url] of Object.entries(arquivos)) {
  const arquivo = caminho.split("/").pop();
  const slot = arquivo.replace(/\.[^.]+$/, "").toLowerCase();
  const ehModerno = /\.(avif|webp)$/i.test(arquivo);
  if (!porSlot[slot] || ehModerno) porSlot[slot] = url;   // webp ganha do jpg
}

export const urlDaImagem = (slot) => (slot ? porSlot[slot.toLowerCase()] : undefined);
```

O componente `<Foto slot="hero" />` resolve sozinho. **Salvar
`src/assets/imgs/hero.webp` é a única ação necessária.**

Sem arquivo → placeholder procedural que ocupa o espaço exato e **mostra o nome
que o arquivo deve ter** (`imgs/hero.webp`). A página nunca quebra por foto
faltando, e dá para preencher aos poucos conforme o cliente entrega.

Ponha um `LEIA-ME.md` na pasta com a tabela de slots, proporções e regras — é o
que você manda para o cliente.

### 9.2 Regras de arquivo

- **Formato:** `.webp`/`.avif`. Converta no [Squoosh](https://squoosh.app),
  qualidade 75–80. Um JPG de câmera (3–5 MB) vira 100–200 kb.
- **Teto:** 200 kb por imagem, 300 kb no hero.
- **Hero:** `fetchpriority="high"`, sem `lazy`, com `width`/`height`.
- **Abaixo do fold:** `loading="lazy" decoding="async"`.
- **Vídeo:** `muted playsinline autoplay loop preload="metadata"`, poster
  obrigatório, `.webm` + `.mp4`, **< 2 MB**, máx 10s. No mobile, considere
  trocar por imagem.
- `bg-[url()]` do Tailwind **não é lazy**. Abaixo do fold, use `<img>` absoluta.

---

## 10. Checklist — Antes de Publicar

### 10.1 Automatizável

```bash
npm run lint          # zero warnings
npm run build         # confira os tamanhos gz na saída
npm run pendencias    # lista PENDENTE no código + imagens faltando
```

O script `pendencias` varre `src/` por `PENDENTE` **e** compara a lista de slots
de imagem com o que existe em `assets/imgs/`. Rode no CI como informativo
(`|| true`), nunca bloqueando o deploy.

### SEO / HTML
- [ ] `lang="pt-BR"`, `<title>` com nome + serviço + cidade
- [ ] `description` 120–160 caracteres, `canonical` absoluto
- [ ] OG completo, imagem 1200×630 **testada no WhatsApp**
- [ ] JSON-LD validado no Rich Results Test
- [ ] Favicon e `apple-touch-icon` existem de fato em `/public`

### Conteúdo
- [ ] `npm run pendencias` limpo
- [ ] Preços, horários e telefone **confirmados com o cliente por escrito**
- [ ] CTA de WhatsApp testado em iOS e Android reais
- [ ] Autorização de imagem assinada para pessoas identificáveis

### Performance
- [ ] Lighthouse **mobile** ≥ 90
- [ ] Chunk 3D fora do bundle inicial (confirmado no Network)
- [ ] Nenhuma imagem > 200 kb
- [ ] Fonts: 1 request, `display: swap`

### Motion
- [ ] `prefers-reduced-motion` em CSS, JS e WebGL
- [ ] Scroll a 55+ fps com CPU throttle 4×
- [ ] Nenhum ScrollTrigger duplicado (`useGSAP` com `scope` em todos)
- [ ] `ScrollTrigger.refresh()` após fontes e imagens
- [ ] Cena 3D pausada fora da viewport e com aba oculta
- [ ] Testado em Android intermediário **real**

### Acessibilidade
- [ ] Contraste **calculado** (§7.1), não estimado
- [ ] Navegação por teclado completa, inclusive seções com pin
- [ ] `alt` correto em todas as imagens

### Código
- [ ] `.env.local` fora do git; nada sensível em `VITE_`
- [ ] Zero `console.log`, zero `id` duplicado
- [ ] Cleanup de listeners, Lenis, GSAP e Canvas no unmount
- [ ] `{ passive: true }` em todo listener de scroll/touch

---

## 11. Deploy — GitHub Pages via Actions

```yaml
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }

jobs:
  build:
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run pendencias || true      # informativo, não bloqueia
      - uses: actions/configure-pages@v5
        id: pages
      - name: Definir base path e URL absoluta
        env: { PAGES_URL: "${{ steps.pages.outputs.base_url }}" }
        run: |
          if [ -f public/CNAME ]; then
            echo "VITE_BASE=/" >> "$GITHUB_ENV"
            echo "VITE_SITE_URL=https://$(tr -d '[:space:]' < public/CNAME)" >> "$GITHUB_ENV"
          else
            echo "VITE_BASE=/${{ github.event.repository.name }}/" >> "$GITHUB_ENV"
            echo "VITE_SITE_URL=${PAGES_URL%/}" >> "$GITHUB_ENV"
          fi
      - run: npm run build
        env:
          VITE_WHATSAPP_PHONE: ${{ vars.VITE_WHATSAPP_PHONE }}
      - run: cp dist/index.html dist/404.html
      - uses: actions/upload-pages-artifact@v4
        with: { path: dist }
```

E no `vite.config.js`: `base: process.env.VITE_BASE || "/"`.

Pontos que quebram silenciosamente:
- Pages de projeto serve em `/<repo>/` — sem `base`, todos os assets dão 404
- `og:image` e `canonical` **não** são reescritos pelo Vite; precisam de
  `%VITE_SITE_URL%` (§8.1)
- Habilite Pages com source **"GitHub Actions"** em Settings → Pages

---

## 12. Armadilhas (todas encontradas na prática)

### 12.1 Vite 8 = Rolldown: `manualChunks` só aceita função
Formato objeto quebra o build com `TypeError: manualChunks is not a function`.

### 12.2 `lucide-react` 1.x removeu ícones de marca
`Instagram`, `Facebook` etc. saíram do pacote. Não instale outra lib de ícones
por causa de dois SVGs — inline num `IconesSociais.jsx`.

### 12.3 Conflito de classe de `display` no Tailwind
Passar `className="hidden sm:inline-flex"` para um componente que já tem
`inline-flex` na base **não funciona**: especificidade é igual e o CSS emite
`.hidden` antes de `.inline-flex`, então a base ganha por ordem de folha.

> **Regra:** classe de `display` vai no **wrapper**, nunca via `className` de um
> componente que já define display.

Sintoma: elemento aparece no mobile mesmo marcado como escondido.

### 12.4 SplitText + `line-height < 1` corta acentos — crítico em PT-BR
A máscara do SplitText usa `overflow: clip`. Com display tipográfico apertado,
diacríticos saem da caixa da linha e são decepados: **"PREÇO" vira "PRECO"**,
"SÉRIE" vira "SERIE". O texto está certo no DOM — só não é pintado.

```css
.linha-mascara, .linha-mask { overflow: hidden; display: block; margin-block: -0.14em; }
.linha-mascara > *, .linha   { padding-block: 0.14em; }
```
Padding na linha (a máscara cresce junto, o acento cabe) + margem negativa na
máscara (devolve o espaçamento apertado).

### 12.5 Não use `@keyframes` CSS em conteúdo crítico
Uma animação com delay longo no `<h1>` depende do *document timeline*. Se esse
relógio atrasar, a headline fica **invisível**, sem erro nenhum. Reveals ficam
no GSAP (§1) — que roda em `rAF` e é o dono dos reveals de qualquer forma.

### 12.6 Dois ScrollTriggers no mesmo elemento pinado brigam
Criar o pin e, separadamente, um tween com `scrollTrigger` no mesmo trigger faz
os dois disputarem a ordem de refresh e saírem de sincronia.

**Dirija tudo pelo `onUpdate` do próprio pin** — uma fonte de verdade:
```js
ScrollTrigger.create({
  trigger, pin: true, scrub: true,
  end: () => "+=" + window.innerHeight,
  onUpdate: (self) => {
    definirProgressoHero(self.progress);
    gsap.set(conteudo, { opacity: 1 - gsap.utils.clamp(0, 1, self.progress / 0.3) });
  },
});
```

E decida o pin com a checagem **síncrona** (§5.2): criar pin depois que um hook
assíncrono resolve causa salto de layout.

### 12.7 Teto de pin: 1 viewport
Mais que isso é scroll-jacking. Quem só quer o preço fica preso — e a métrica da
LP é conversão, não tempo de permanência.

### 12.8 Marca escrita à mão em N lugares diverge
Header, footer e preloader tinham três versões do mesmo lockup. Um `Logo.jsx`
com variantes de tamanho resolve. Vale para qualquer marca com composição
(palavra dentro de caixa, símbolo + texto).

### 12.9 HUD fixo colide com CTA fixo no mobile
Elemento fixo no canto inferior disputa espaço com o botão de conversão. Meça a
folga em **320px**, não só em 360. Se não couber, **o enfeite cede, nunca o CTA**
(esconda o número, mantenha o gráfico).

Fixo sobre conteúdo também exige fundo próprio (`bg-…/80` + `backdrop-blur`) —
headlines são alinhadas à esquerda e passam por baixo.

---

## 13. Como verificar de verdade

Screenshot em headless mente de várias formas. Estas são as que custaram tempo:

### 13.1 Medir o bundle
Some as colunas `gzip` dos chunks **não-lazy** da saída do `npm run build`.
O chunk `three` só conta se aparecer no Network do primeiro carregamento.

### 13.2 Headless: `--virtual-time-budget` vs. CDP
- **`--screenshot` + `--virtual-time-budget=9000`** adianta o relógio de
  animação. Bom para uma tela estática.
- **Dirigir por CDP com esperas reais** *não* adianta esse relógio: animações
  CSS ficam em ~6% da velocidade e aparecem congeladas no estado inicial.

Antes de capturar via CDP, force as animações finitas a concluir:
```js
document.getAnimations().forEach((a) => {
  try { if (a.effect?.getTiming?.().iterations !== Infinity) a.finish(); } catch {}
});
```

> Se algo parecer quebrado, **confira `a.currentTime` contra `performance.now()`**
> antes de "consertar". Já perdi tempo caçando bug que era o relógio do headless.

### 13.3 `pkill` não mata processo Windows
No Git Bash, `pkill -f chrome` não faz nada. Sobram instâncias antigas na mesma
porta de debug, e **é a antiga que responde** — inclusive com overrides de
viewport de execuções passadas. Use `taskkill //F //IM chrome.exe`.

### 13.4 `Emulation.setDeviceMetricsOverride` gruda no perfil
Um teste mobile deixa a viewport travada em 412px para os testes seguintes.
Sempre `Emulation.clearDeviceMetricsOverride` no início, ou perfil novo.

Sintoma: "o pin sumiu" quando na verdade a página está em largura de celular.

### 13.5 `Page.captureScreenshot` com `clip` usa coordenadas do documento
Não da viewport. Para elemento `fixed`, capture a viewport inteira
(`captureBeyondViewport: false`) e não use `clip`.

### 13.6 O que só se vê em device real
CPU 4× + Fast 4G no DevTools aproxima, mas **teste em Android intermediário de
verdade** antes de entregar. É onde o público está.

---

## 14. Fluxo para uma Nova LP

1. `npm create vite@latest` → React + JS
   > ⚠️ **NUNCA rode `create-vite` com `--overwrite` numa pasta com arquivos.**
   > Ele apaga tudo, inclusive briefing e documentação.
2. Base: `npm i tailwindcss @tailwindcss/vite lucide-react`
3. Motion: `npm i gsap @gsap/react lenis motion animejs`
4. 3D (**só se o conceito exigir**): `npm i three`
5. Copiar `lib/`, `hooks/`, `utils/`, `animation.css`, `scripts/pendencias.mjs`
6. **Calcular o contraste da paleta (§7.1) antes de escrever componente**
7. Preencher `src/config/site.js` — todo o conteúdo mora aqui
8. `index.html` com `%VITE_SITE_URL%` + JSON-LD
9. Construir sections consumindo `site.js`
10. Fotos: criar `assets/imgs/LEIA-ME.md` e mandar para o cliente
11. Rodar §10 **com CPU throttle ligado**

**Ordem de construção que mantém o projeto sempre entregável:**
conteúdo estático → GSAP → Motion/anime → 3D. Se o prazo apertar, corta-se do
fim sem quebrar nada.

---

## 15. Referências de Showcase (fitness)

| Site | Prêmio | O que roubar |
|---|---|---|
| [Phive Clubs](https://phive.pt/en) — Bürocratik | Developer Award + SOTD | Rigor técnico, transições, sistema tipográfico |
| [La Huella Workout Club](https://lahuella.club/en) — Mortensen | Nominee (GSAP + Next) | Storytelling por vídeo, microinterações |
| [XNRGY Club](https://xnrgyclub.com) — Every Day® | Honorable Mention | Cor saturada, lifestyle > equipamento |
| [Kinetics](https://kineticsplay.com) — bikebear | Honorable Mention | Motion cinético, ritmo de scroll |
| [The Sculpt Society](https://thesculptsociety.com) | — | Módulo de programas com vídeo |

**Padrão comum:** tipografia gigante e pesada, vídeo real de gente treinando
(nunca banco de imagens), paleta de 2–3 cores, CTA sempre a um toque.

---

## 16. Bugs herdados do `lading-page-amanda`

Corrigir antes de reaproveitar qualquer código daquele projeto:

| # | Arquivo | Problema |
|---|---|---|
| 1 | `App.jsx` | `id="contato"` duplicado |
| 2 | `App.jsx` | Emails placeholder visíveis (menu e footer) |
| 3 | `App.jsx` | Typos: "Avaçada", "ORTFÓLIO", "couro caneludo" |
| 4 | `index.html` | `lang="en"` em projeto PT-BR |
| 5 | `BtnAgend.jsx` | Prop `w` recebida e nunca aplicada |
| 6 | `BtnFixo.jsx` | Scroll listener sem `{ passive: true }` |
| 7 | `index.css` | 3 `@import` de fonts em vez de 1 |
