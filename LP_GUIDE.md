# Guia de Landing Pages — Stack, Template & Motion System

> **v2 — Julho/2026.** Base: `lading-page-amanda`. A v1 cobria a casca (React + Vite + Tailwind + IntersectionObserver).
> A v2 adiciona a **camada de motion de alto nível** (GSAP, Three.js, anime.js, Motion) usada em LPs "awwwards-tier",
> com regras de orçamento de performance para não quebrar em Android médio no 4G.

---

## 1. Stack

| Camada | Tecnologia | Versão | Notas |
|---|---|---|---|
| Framework | React | 19 | |
| Bundler | Vite | 8 | |
| Estilização | Tailwind CSS | 4 | via `@tailwindcss/vite` |
| Ícones | Lucide React | 1.x | |
| **Scroll engine** | **Lenis** | 1.x | smooth scroll (~3kb). Alternativa: GSAP ScrollSmoother |
| **Motion de scroll** | **GSAP + ScrollTrigger + SplitText** | 3.13+ | **100% grátis desde abr/2025**, incl. todos os plugins |
| **3D / WebGL** | **Three.js + @react-three/fiber + drei** | r17x / 9.x | **lazy-loaded, condicional** (ver §5) |
| **Micro-interações React** | **Motion** (`motion/react`) | 12.x | ~12kb gz — o antigo Framer Motion |
| **Tweens utilitários / SVG** | **anime.js** | v4 | `createScope`, `createTimeline` |
| Linguagem | JavaScript (JSX) | ES Modules | |

### ⚠️ Regra de ouro: 4 libs de animação = 4 formas de errar

Quatro engines de motion no mesmo bundle **só se justifica se cada uma tiver um papel exclusivo**. Se duas libs
animarem a mesma propriedade do mesmo elemento, elas brigam pelo `transform` e o resultado é jank.
A divisão abaixo é obrigatória — não é sugestão.

| Lib | Domínio exclusivo | Nunca use para |
|---|---|---|
| **GSAP + ScrollTrigger** | Tudo que é dirigido por scroll: pin, scrub, parallax, horizontal scroll, reveal de texto (SplitText), timelines longas | Estado de componente React |
| **Motion** (`motion/react`) | UI React com estado: menu mobile, modal, tabs, `AnimatePresence` (mount/unmount), `layout` transitions, hover/tap de botão | Scroll storytelling |
| **anime.js v4** | Contadores numéricos, SVG (`draw`, morph de path leve), sequências independentes de scroll (loops decorativos, timers) | Qualquer coisa com ScrollTrigger |
| **Three.js / R3F** | 1 a 2 cenas no máximo (hero + CTA final). Nada mais | Elementos que podem ser feitos em CSS/SVG |

> Se você conseguir cortar uma lib sem perder efeito, **corte**. O menor bundle que entrega o conceito ganha.

---

## 2. Estrutura de Pastas

```
src/
├── assets/
│   ├── imgs/              ← .webp / .avif
│   └── models/            ← .glb (Draco/Meshopt comprimido)
│
├── components/
│   ├── ui/                ← genéricos reutilizáveis
│   │   ├── BtnAgend.jsx
│   │   ├── BtnFixo.jsx
│   │   ├── Contador.jsx        ← anime.js
│   │   ├── SplitHeading.jsx    ← GSAP SplitText
│   │   └── Marquee.jsx
│   │
│   ├── sections/          ← cada seção da LP em arquivo próprio
│   │
│   └── three/             ← TUDO de WebGL isolado aqui (chunk separado)
│       ├── HeroScene.jsx       ← default export, carregado via React.lazy
│       ├── materials/
│       └── shaders/*.glsl
│
├── hooks/
│   ├── useIsomorphicLayoutEffect.js
│   ├── useGsapContext.js       ← wrapper de gsap.context()
│   ├── useCan3D.js             ← gating de device (ver §5)
│   └── useReducedMotion.js
│
├── lib/
│   ├── gsap.js            ← registro central de plugins (import único)
│   └── lenis.js           ← instância + bridge com ScrollTrigger
│
├── config/
│   └── site.js            ← ÚNICO ARQUIVO DE CONTEÚDO A EDITAR POR LP
│
├── utils/
│   └── contato.js
│
├── animation.css
├── index.css
├── main.jsx
└── App.jsx                ← só sections + providers, zero conteúdo inline
```

### `config/site.js`

Toda LP compartilha a mesma casca. O que muda é o conteúdo. Centralizar elimina caçar texto dentro de 900 linhas de JSX.

```js
// src/config/site.js
export const site = {
  nome: "Supreme Fitness",
  registro: "CREF 000798-PJ",
  slogan: "A melhor.",
  cidade: "Santa Cruz do Capibaribe – PE",

  contato: {
    whatsapp: import.meta.env.VITE_WHATSAPP_PHONE,
    mensagemWhatsapp: import.meta.env.VITE_WHATSAPP_MESSAGE,
    email: import.meta.env.VITE_EMAIL,
    instagram: "https://www.instagram.com/academia.supreme",
    endereco: "Rua João Pereira de Abreu, 21 — Santa Cruz do Capibaribe, PE",
    maps: "https://maps.google.com/?q=...",
  },

  seo: { titulo: "...", descricao: "...", ogImagem: "/og-image.jpg" },

  planos: [/* ... */],
  modalidades: [/* ... */],
  horarios: [/* ... */],
  stats: [{ valor: 12, sufixo: "K", label: "Alunos e seguidores" }],
};
```

> **Contadores:** guarde `valor` como **número** + `sufixo` como string. O contador do anime.js precisa
> interpolar número, não parsear `"12K+"`.

---

## 3. Variáveis de Ambiente

Nunca hardcode telefone, email ou links sensíveis.

```env
# .env.local  (→ .gitignore)
VITE_WHATSAPP_PHONE=5581989957810
VITE_WHATSAPP_MESSAGE=Olá! Quero agendar minha aula experimental na Supreme Fitness.
VITE_EMAIL=academiasupreme@gmail.com
```

```js
// src/utils/contato.js
export const handleWhatsAppClick = (origem = "site") => {
  const phone = import.meta.env.VITE_WHATSAPP_PHONE;
  const message = import.meta.env.VITE_WHATSAPP_MESSAGE;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.dataLayer?.push({ event: "click_whatsapp", origem }); // rastreie a origem do lead
  window.open(url, "_blank", "noopener,noreferrer");
};
```

> Passe `origem` em cada CTA (`"hero"`, `"planos"`, `"btn_fixo"`). Sem isso você não sabe qual seção converte.

---

## 4. Motion System

### 4.1 Setup central do GSAP

```js
// src/lib/gsap.js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// respeita o SO do usuário globalmente
gsap.matchMediaRefresh?.();

export { gsap, ScrollTrigger, SplitText };
```

Importe **sempre** de `@/lib/gsap` — nunca `from "gsap"` direto nos componentes. Isso garante que os plugins
estejam registrados e evita duplicar o import em chunks diferentes.

### 4.2 Lenis + ScrollTrigger (a ponte obrigatória)

Smooth scroll e ScrollTrigger precisam compartilhar o mesmo `raf`, senão o scrub fica um frame atrasado.

```js
// src/lib/lenis.js
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

export function initLenis() {
  const lenis = new Lenis({
    autoRaf: false,          // o GSAP ticker assume o loop
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,        // NÃO force smooth no touch — quebra a sensação nativa no mobile
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(lenis.raf);
    lenis.destroy();
  };
}
```

### 4.3 Cleanup no React 19 — `gsap.context()`

React 19 em StrictMode monta o efeito duas vezes. Sem `context()`, você duplica ScrollTriggers.

```jsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react"; // ou useLayoutEffect + gsap.context()
import { gsap } from "@/lib/gsap";

export default function Sobre() {
  const root = useRef(null);

  useGSAP(() => {
    gsap.from(".sobre-img", {
      yPercent: 12, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: root.current, start: "top 75%" },
    });
  }, { scope: root });   // ← escopa os seletores e limpa tudo no unmount

  return <section ref={root}>…</section>;
}
```

### 4.4 Parallax — o padrão correto

Parallax por `background-attachment: fixed` é proibido: quebra no iOS e força repaint. Use `yPercent` + `scrub`.

```js
// aplica em qualquer elemento com data-parallax="0.3"
gsap.utils.toArray("[data-parallax]").forEach((el) => {
  const speed = parseFloat(el.dataset.parallax) || 0.2;
  gsap.fromTo(
    el,
    { yPercent: -speed * 50 },
    {
      yPercent: speed * 50,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
});
```

**Parallax multicamada:** 3 a 4 camadas com speeds distintos (`0.1` fundo → `0.5` frente) e a imagem
com `scale: 1.15` para nunca revelar a borda. Mais que 4 camadas ninguém percebe e o custo dobra.

### 4.5 Receitas de scroll de alto impacto

**Texto que revela por linha (SplitText):**
```js
const split = new SplitText(el, { type: "lines", linesClass: "linha" });
gsap.from(split.lines, {
  yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.08, ease: "expo.out",
  scrollTrigger: { trigger: el, start: "top 80%" },
});
// no CSS: .linha { overflow: hidden } no wrapper para o efeito de máscara
```

**Seção horizontal com pin:**
```js
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: section,
    pin: true,
    scrub: 1,
    end: () => "+=" + (track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true,
  },
});
```

**Marquee com skew reativo à velocidade do scroll** (o detalhe que faz parecer caro):
```js
const skewTo = gsap.quickTo(".marquee", "skewX", { duration: 0.4, ease: "power3" });
ScrollTrigger.create({
  onUpdate: (self) => skewTo(gsap.utils.clamp(-10, 10, self.getVelocity() / -180)),
});
```

**Variable font dirigida por scroll** (o peso da fonte engrossa conforme você desce — não anime
`fontVariationSettings` direto, use um proxy):
```js
const s = { wght: 300 };
gsap.to(s, {
  wght: 900, ease: "none",
  scrollTrigger: { trigger: el, start: "top bottom", end: "top 30%", scrub: 0.5 },
  onUpdate: () => { el.style.fontVariationSettings = `"wght" ${s.wght}`; },
});
```

### 4.6 anime.js v4 no React — sempre com `createScope`

```jsx
import { useEffect, useRef } from "react";
import { createScope, animate, stagger } from "animejs";

export function Contador({ valor, sufixo = "" }) {
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      animate(".num", {
        innerHTML: [0, valor],
        modifier: (v) => Math.round(v),
        duration: 1600,
        ease: "out(3)",
      });
    });
    return () => scope.current.revert(); // limpa animações E restaura estilos
  }, [valor]);

  return <div ref={root}><span className="num">0</span>{sufixo}</div>;
}
```

> Dispare o contador **quando entrar na viewport** (ScrollTrigger `onEnter` chamando o scope), não no mount.

### 4.7 Motion (`motion/react`) — só UI com estado

```jsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {aberto && (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  )}
</AnimatePresence>
```

Prefira as variantes que rodam no compositor (`opacity`, `transform`). Evite animar `width`, `height`, `top`,
`left`, `box-shadow` e `filter` — são as que estouram o frame budget.

---

## 5. Three.js / WebGL — regras de sobrevivência

WebGL é o maior risco de performance de uma LP. Público de academia local acessa majoritariamente por
**Android intermediário no 4G**. A cena 3D é um **enhancement**, nunca um requisito.

### 5.1 Carregamento condicional + lazy

```jsx
// src/hooks/useCan3D.js
export function useCan3D() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (navigator.connection?.saveData) return false;
    if ((navigator.deviceMemory ?? 4) < 4) return false;
    if ((navigator.hardwareConcurrency ?? 4) < 4) return false;
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  }, []);
}
```

```jsx
const HeroScene = lazy(() => import("@/components/three/HeroScene"));

{can3D ? (
  <Suspense fallback={<HeroPoster />}>
    <HeroScene />
  </Suspense>
) : (
  <HeroPoster />   // .webp estático — o LCP sai daqui, não do canvas
)}
```

> **O LCP nunca pode ser o `<canvas>`.** Renderize o poster imediatamente e faça a cena entrar por cima
> com fade quando estiver pronta. Assim o Core Web Vitals é medido no `<img>`, que carrega em ~300ms.

### 5.2 Configuração do Canvas

```jsx
<Canvas
  dpr={[1, 1.75]}                    // NUNCA dpr ilimitado — retina a 3x mata o mobile
  gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
  frameloop="demand"                 // só renderiza quando algo muda
  camera={{ fov: 35, position: [0, 0, 6] }}
>
```

- `frameloop="demand"` + `invalidate()` no que muda. Se a cena for animada continuamente, use `"always"`
  mas **pause quando fora da viewport** (`IntersectionObserver` → `setFrameloop("never")`).
- Modelos `.glb` com **Draco + Meshopt**; alvo **< 500kb**. Rode `gltf-transform optimize`.
- Texturas em **KTX2/Basis**, potência de 2, máx 1024px no mobile.
- Postprocessing (bloom, DOF) **só no desktop**. É o item mais caro por pixel.
- Nada de `console.log` no `useFrame` — roda 60×/s.

### 5.3 Alternativa mais barata que 3D real

Em 80% dos casos o efeito desejado não precisa de geometria. Um **shader 2D em plano fullscreen**
(distorção de imagem no hover, ondulação, grain animado, RGB shift) custa uma fração de uma cena com
modelo e entrega o mesmo "uau". Considere isso antes de importar um `.glb`.

---

## 6. Orçamento de Performance (não negociável)

| Métrica | Alvo | Como medir |
|---|---|---|
| LCP (mobile, 4G) | **< 2.5s** | Lighthouse mobile / PageSpeed |
| INP | **< 200ms** | field data |
| CLS | **< 0.1** | `width`/`height` em toda `<img>` |
| JS inicial (gz) | **< 180kb** | `rollup-plugin-visualizer` |
| Chunk 3D (gz, lazy) | **< 200kb** | chunk separado, fora do initial |
| Peso total do 1º fold | **< 1.2MB** | Network tab, cache off |
| FPS durante scroll | **≥ 55** | DevTools Performance, throttle 4× CPU |

### Code splitting

```js
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          gsap: ["gsap"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          motion: ["motion"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

**Teste obrigatório antes de entregar:** DevTools → Performance → CPU 4× slowdown + Network "Fast 4G".
Se o scroll travar aí, trava no celular do aluno.

---

## 7. Acessibilidade & `prefers-reduced-motion`

Não é opcional, e com este stack é ainda mais crítico — scroll-jacking + 3D é um gatilho real de enjoo vestibular.

```css
/* animation.css — final do arquivo */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1 !important; transform: none !important; }
}
```

```js
// e no JS — o CSS não alcança GSAP nem WebGL
const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduzido) {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.set("[data-parallax], .reveal", { clearProps: "all" });
  // e não monte o <Canvas> (já coberto pelo useCan3D)
}
```

Checklist adicional:
- Smooth scroll **desligado** em `reduced-motion` (`lenis.stop()` ou não inicializar).
- Toda seção com pin precisa continuar navegável por teclado (`Tab` não pode pular conteúdo preso).
- `:focus-visible` visível em todo elemento interativo — não remova o outline sem substituir.
- Contraste mínimo **4.5:1** (texto normal) / **3:1** (texto grande ≥24px). Texto sobre vídeo ou foto
  **sempre** com overlay/gradiente — meça o pior frame, não o melhor.
- `alt` descritivo em imagem de conteúdo; `alt=""` em decorativa. `aria-hidden` no `<canvas>` decorativo.

---

## 8. SEO — Local Business (o que mais converte para negócio físico)

Isto faltava na v1 e vale mais que qualquer animação para um negócio de bairro.

```html
<html lang="pt-BR">
<head>
  <title>Supreme Fitness | Academia em Santa Cruz do Capibaribe – PE</title>
  <meta name="description" content="120–160 caracteres com serviço + cidade." />
  <link rel="canonical" href="https://dominio.com.br/" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="/og-image.jpg" />   <!-- 1200×630 -->
  <meta property="og:url" content="https://dominio.com.br" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
</head>
```

**JSON-LD `ExerciseGym`** — cole em `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "name": "Supreme Fitness",
  "image": "https://dominio.com.br/og-image.jpg",
  "url": "https://dominio.com.br",
  "telephone": "+5581989957810",
  "email": "academiasupreme@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua João Pereira de Abreu, 21",
    "addressLocality": "Santa Cruz do Capibaribe",
    "addressRegion": "PE",
    "addressCountry": "BR"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "", "longitude": "" },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "05:00", "closes": "22:00"
  }],
  "sameAs": ["https://www.instagram.com/academia.supreme"]
}
</script>
```

Fora do código, mas parte da entrega:
- Google Business Profile atualizado (fotos, horário, link da LP) — é ali que a busca "academia perto de mim" cai.
- NAP (Nome, Endereço, Telefone) **idêntico** entre site, Instagram, Google e Facebook.

---

## 9. Imagens e Vídeo

- **Formato:** `.avif` com fallback `.webp` via `<picture>`. Nunca `.jpg`/`.png` em conteúdo.
- **Hero:** `fetchpriority="high"`, sem `loading="lazy"`, com `width`/`height` explícitos.
- **Abaixo do fold:** `loading="lazy" decoding="async"`.
- **Vídeo de fundo:** `muted playsinline autoplay loop preload="metadata"`, **poster obrigatório**,
  `.webm` (VP9/AV1) + `.mp4` fallback, **< 2MB**, sem áudio, máx 10s em loop.
  No mobile, considere substituir por imagem — vídeo autoplay é o maior consumidor de dados da página.
- Background via `bg-[url()]` do Tailwind **não é lazy**. Abaixo do fold, use `<img>` com `object-cover` absoluto.

---

## 10. Checklist — Antes de Publicar

### SEO / HTML
- [ ] `lang="pt-BR"`
- [ ] `<title>` com nome + serviço + cidade
- [ ] `description` 120–160 caracteres
- [ ] Open Graph completo + imagem 1200×630 testada no WhatsApp
- [ ] JSON-LD `ExerciseGym` validado no Rich Results Test
- [ ] Favicon e `apple-touch-icon` em `/public`
- [ ] `canonical` definido

### Conteúdo
- [ ] Zero placeholder (`email@exemplo.com`, `lorem`)
- [ ] Revisão ortográfica feita por outra pessoa
- [ ] Todo `href=""` corrigido
- [ ] Externos com `target="_blank" rel="noopener noreferrer"`
- [ ] Preços, horários e telefone conferidos **com o cliente**
- [ ] CTA de WhatsApp testado em iOS e Android reais

### Performance
- [ ] Lighthouse **mobile** ≥ 90 em Performance
- [ ] LCP < 2.5s com CPU 4× e Fast 4G
- [ ] Chunk `three` fora do bundle inicial (confirmado no Network)
- [ ] Nenhuma imagem > 200kb
- [ ] Fonts: 1 único request, `display: swap`, subset `latin`

### Motion
- [ ] `prefers-reduced-motion` respeitado em CSS **e** JS **e** WebGL
- [ ] Scroll a 55+ fps com CPU throttle 4×
- [ ] Nenhum ScrollTrigger duplicado (StrictMode) — `gsap.context()`/`useGSAP` em todos
- [ ] `ScrollTrigger.refresh()` após carregar fontes e imagens
- [ ] Cena 3D pausada fora da viewport
- [ ] Testado em Android intermediário real, não só no desktop

### Acessibilidade
- [ ] Contraste ≥ 4.5:1 (medido sobre o pior frame do vídeo/foto)
- [ ] Navegação completa por teclado, inclusive seções com pin
- [ ] `:focus-visible` visível
- [ ] `alt` correto em todas as imagens

### Código
- [ ] Dados sensíveis em `.env.local`, e ele no `.gitignore`
- [ ] Zero `console.log`
- [ ] Zero `id` duplicado
- [ ] Cleanup de listeners, Lenis, GSAP context e Canvas no unmount
- [ ] `{ passive: true }` em todo listener de scroll/touch

---

## 11. Bugs herdados do `lading-page-amanda`

Corrigir antes de reaproveitar qualquer código:

| # | Arquivo | Problema |
|---|---|---|
| 1 | `App.jsx` ~L159 | `id="contato"` duplicado (footer CTA + rodapé) |
| 2 | `App.jsx` ~L215 | Email placeholder `seu-email@dominio.com` no menu mobile |
| 3 | `App.jsx` ~L1004 | Email placeholder `email@exemplo.com` no footer |
| 4 | `App.jsx` ~L295 | "Estética Ava**ç**ada" |
| 5 | `App.jsx` ~L448 | "**ORTF**ÓLIO DE TRATAMENTOS" |
| 6 | `App.jsx` ~L487 | "couro **caneludo**" → "cabeludo" |
| 7 | `App.jsx` ~L908 | 'F' solto após "10+" nos stats |
| 8 | `index.html` | `lang="en"` em projeto PT-BR |
| 9 | `BtnAgend.jsx` | Prop `w` recebida e nunca aplicada |
| 10 | `App.css` | Vazio — remover |
| 11 | `BtnFixo.jsx` | Scroll listener sem `{ passive: true }` |
| 12 | `index.css` | 3 `@import` de fonts em vez de 1 |

---

## 12. Fluxo para uma Nova LP

1. `npm create vite@latest` → React + JS
2. Base: `npm i tailwindcss @tailwindcss/vite lucide-react`
3. Motion: `npm i gsap @gsap/react lenis motion animejs`
4. 3D (**só se o conceito exigir**): `npm i three @react-three/fiber @react-three/drei`
5. Copiar `lib/gsap.js`, `lib/lenis.js`, `hooks/`, `animation.css`
6. Preencher `src/config/site.js` — todo o conteúdo mora aqui
7. Criar `.env.local`
8. Preencher `index.html` (title, description, OG, JSON-LD)
9. Construir sections consumindo `site.js`
10. Converter imagens para `.webp`/`.avif`
11. Rodar o checklist do §10 **com CPU throttle ligado**

---

## 13. Referências de Showcase (fitness)

Estudadas para o padrão de qualidade desta v2:

| Site | Prêmio | O que roubar |
|---|---|---|
| [Phive Clubs](https://phive.pt/en) — Bürocratik | Developer Award + SOTD | Rigor técnico, transições de página, sistema tipográfico |
| [La Huella Workout Club](https://lahuella.club/en) — Mortensen | Awwwards Nominee (GSAP + Next.js) | Storytelling por vídeo, microinterações, energia de marca |
| [XNRGY Club](https://xnrgyclub.com) — Every Day® | Honorable Mention | Cor saturada, lifestyle > equipamento |
| [Kinetics](https://kineticsplay.com) — bikebear | Honorable Mention | Motion cinético, ritmo de scroll |
| [The Sculpt Society](https://thesculptsociety.com) | — | Módulo de programas com vídeo |

**Padrão comum aos cinco:** tipografia gigante e pesada, vídeo real de gente treinando (nunca banco de imagens),
paleta de 2 a 3 cores no máximo, e o CTA de matrícula sempre a um toque de distância.
