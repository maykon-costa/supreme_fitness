import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { supino } from "@/config/site";
import { assinarCarga } from "@/lib/carga";

/**
 * Cena 3D — a barra de supino do conceito PROGRESSIVE OVERLOAD. BRIEF §2 e §4.
 *
 * Uma barra olímpica em metal escovado que ganha ANILHAS DE VERDADE conforme o
 * usuário rola: a hero fica presa por um viewport e, nesse trecho, os 6 pares
 * entram voando e travam na barra. Scrollar é literalmente carregar o supino.
 *
 * Por que three.js puro e não @react-three/fiber:
 * o chunk com R3F fechava 236kb gz, acima do teto de 200kb do LP_GUIDE §6.
 * A camada declarativa custava ~45kb gz sem entregar nada que este arquivo não
 * resolva. Vale a regra do LP_GUIDE §1: se dá para cortar sem perder efeito, corta.
 *
 * Performance — LP_GUIDE §5.2:
 *   · geometria procedural: nenhum .glb para baixar
 *   · UMA geometria de anilha reaproveitada por todas as instâncias (escalada)
 *   · pixel ratio limitado a 1.75 · antialias off
 *   · loop pausado fora da viewport e com a aba em segundo plano
 *   · pointer-events-none: nunca rouba o clique do CTA
 *
 * Só é montado quando useCan3D() aprova o device.
 */

/**
 * Proporções da barra olímpica. O eixo precisa ser ~3,5× o diâmetro da anilha:
 * com um eixo curto o objeto lê como HALTER, não como barra de supino.
 * (Barra real: 2,2 m de eixo para 45 cm de anilha ≈ 4,9×.)
 */
const DENTRO = 1.75; // meia-distância entre as presilhas: onde a 1ª anilha encosta
const FOLGA = 0.022;
const PONTA = 0.42; // sobra de eixo depois da última anilha

/** Anilha mais pesada = disco maior e mais grosso. Leitura instantânea. */
function escalaPara(kg) {
  if (kg >= 20) return 1;
  if (kg >= 15) return 0.86;
  if (kg >= 10) return 0.72;
  return 0.56;
}

function criarGeometriaAnilha() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false);

  const centro = new THREE.Path();
  centro.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
  shape.holes.push(centro);

  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const furo = new THREE.Path();
    furo.absarc(Math.cos(ang) * 0.62, Math.sin(ang) * 0.62, 0.14, 0, Math.PI * 2, true);
    shape.holes.push(furo);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.17,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 44,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/** Posição final de cada anilha ao longo da barra, acumulando espessuras. */
function calcularPosicoes() {
  const posicoes = [];
  let borda = DENTRO;
  for (const kg of supino.pares) {
    const esc = escalaPara(kg);
    const espessura = 0.26 * esc;
    posicoes.push({ x: borda + espessura / 2, escala: esc });
    borda += espessura + FOLGA;
  }
  return { posicoes, bordaFinal: borda };
}

export default function HeroScene({ variante = "hero" }) {
  const wrap = useRef(null);
  const close = variante === "close";

  useEffect(() => {
    const container = wrap.current;
    if (!container) return;

    const descartaveis = [];
    const alvoMouse = { x: 0, y: 0 };
    let visivel = true;
    let rafId = 0;

    // ---- renderer ----
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = close ? 7 : 8.4;

    // ---- environment procedural: reflexo de metal sem baixar HDR ----
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;

    // ---- luzes ----
    const principal = new THREE.DirectionalLight(0xffffff, 2.1);
    principal.position.set(4, 5, 5);
    const contra = new THREE.DirectionalLight(0xffbb00, 1.6);
    contra.position.set(-5, -2, -3);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35), principal, contra);

    // ---- materiais (compartilhados por todas as instâncias) ----
    const matMetal = new THREE.MeshStandardMaterial({
      color: 0x1b1c20,
      metalness: 0.94,
      roughness: 0.31,
      envMapIntensity: 1.15,
    });
    const matBarra = new THREE.MeshStandardMaterial({
      color: 0x9aa0aa,
      metalness: 1,
      roughness: 0.26,
      envMapIntensity: 1.3,
    });
    const matPresilha = new THREE.MeshStandardMaterial({
      color: 0xffbb00,
      metalness: 0.55,
      roughness: 0.3,
      emissive: 0xffbb00,
      emissiveIntensity: 0.28,
    });
    descartaveis.push(matMetal, matBarra, matPresilha, env.texture);

    // ---- barra ----
    const grupo = new THREE.Group();
    grupo.scale.setScalar(close ? 1.15 : 0.62);
    // 3/4 de perfil: mostra o comprimento da barra e a espessura das anilhas
    grupo.rotation.set(0.22, -0.24, -0.09);

    const { posicoes, bordaFinal } = calcularPosicoes();

    // O eixo é dimensionado a partir da pilha real de anilhas + a ponta
    const COMPRIMENTO = 2 * (bordaFinal + PONTA);
    const geoEixo = new THREE.CylinderGeometry(0.048, 0.048, COMPRIMENTO, 18);
    const eixo = new THREE.Mesh(geoEixo, matBarra);
    eixo.rotation.z = Math.PI / 2;
    grupo.add(eixo);
    descartaveis.push(geoEixo);

    // presilhas vermelhas: onde as anilhas encostam
    const geoPresilha = new THREE.CylinderGeometry(0.115, 0.115, 0.09, 20);
    descartaveis.push(geoPresilha);
    for (const lado of [-1, 1]) {
      const p = new THREE.Mesh(geoPresilha, matPresilha);
      p.rotation.z = Math.PI / 2;
      p.position.x = lado * (DENTRO - 0.05);
      grupo.add(p);
    }

    scene.add(grupo);

    // ---- anilhas ----
    const geoAnilha = criarGeometriaAnilha();
    descartaveis.push(geoAnilha);

    const anilhas = []; // { mesh, alvoX, entrada, lado, escala }

    /**
     * Enquadramento dirigido pela carga: vazia, a barra fica recuada no canto
     * inferior direito, longe da headline. Conforme carrega, ela vem para o
     * centro e cresce — exatamente enquanto o texto da hero desaparece.
     * Sem isso a barra cruza o título e mata a legibilidade (LP_GUIDE §7).
     */
    const enquadramento = { atual: 0, alvo: 0 };

    function sincronizar(pares) {
      enquadramento.alvo = pares / supino.pares.length;
      // adiciona os pares que faltam
      while (anilhas.length < pares * 2) {
        const indice = Math.floor(anilhas.length / 2);
        const lado = anilhas.length % 2 === 0 ? -1 : 1;
        const { x, escala } = posicoes[indice];

        const mesh = new THREE.Mesh(geoAnilha, matMetal);
        mesh.rotation.y = Math.PI / 2; // face voltada para o eixo da barra
        mesh.scale.setScalar(escala);
        grupo.add(mesh);

        anilhas.push({ mesh, alvoX: lado * x, entrada: 0, lado, escala });
      }
      // remove se o usuário rolar de volta pra cima
      while (anilhas.length > pares * 2) {
        const { mesh } = anilhas.pop();
        grupo.remove(mesh);
      }
    }

    const cancelarAssinatura = assinarCarga(sincronizar);

    // ---- interação ----
    const onMove = (e) => {
      alvoMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      alvoMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ---- loop ----
    const relogio = new THREE.Clock();
    const suave = (t) => 1 - Math.pow(1 - t, 3); // easing da entrada da anilha
    let tempo = 0;

    const animar = () => {
      rafId = requestAnimationFrame(animar);
      if (!visivel) return;

      const delta = Math.min(relogio.getDelta(), 0.05);
      const k = 1 - Math.pow(0.001, delta);
      tempo += delta;

      /**
       * Balanço em vez de rotação contínua. Girando 360°, a barra passava por
       * ângulos quase de topo em que as anilhas se sobrepõem e o objeto vira um
       * borrão — deixava de ler como barra. O seno mantém sempre o 3/4 que
       * mostra o comprimento do eixo e a espessura da pilha.
       */
      grupo.rotation.y =
        -0.24 + Math.sin(tempo * 0.34) * 0.13 + alvoMouse.x * 0.15;

      // enquadramento: recuada quando vazia, protagonista quando cheia
      enquadramento.atual += (enquadramento.alvo - enquadramento.atual) * k * 0.55;
      const t = close ? 1 : enquadramento.atual;

      grupo.scale.setScalar((close ? 1.15 : 0.62 + t * 0.33) * 1);
      grupo.position.x = close ? 0 : 1.5 - t * 1.45;

      // parallax de mouse com lerp — nunca 1:1 (BRIEF §4)
      // Começa bem abaixo da headline e sobe só depois que o texto saiu
      const baseY = close ? 0 : -1.7 + t * 1.6;
      grupo.rotation.x += (0.22 + alvoMouse.y * 0.16 - grupo.rotation.x) * k;
      grupo.position.y += (baseY - alvoMouse.y * 0.12 - grupo.position.y) * k;

      // anilha entra deslizando de fora e assenta na presilha
      for (const a of anilhas) {
        if (a.entrada < 1) {
          a.entrada = Math.min(1, a.entrada + delta * 2.4);
          const t = suave(a.entrada);
          a.mesh.position.x = a.alvoX + a.lado * (1 - t) * 2.6;
          a.mesh.scale.setScalar(a.escala * (0.6 + 0.4 * t));
        }
      }

      renderer.render(scene, camera);
    };
    animar();

    // ---- pausa fora da viewport / aba em segundo plano ----
    const obs = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting && document.visibilityState === "visible";
        if (visivel) relogio.getDelta();
      },
      { threshold: 0.01 }
    );
    obs.observe(container);

    const onVisibilidade = () => {
      visivel = document.visibilityState === "visible";
      if (visivel) relogio.getDelta();
    };
    document.addEventListener("visibilitychange", onVisibilidade);

    // ---- resize ----
    const onResize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ---- cleanup completo — LP_GUIDE §10 ----
    return () => {
      cancelAnimationFrame(rafId);
      cancelarAssinatura();
      obs.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilidade);
      window.removeEventListener("pointermove", onMove);

      descartaveis.forEach((d) => d.dispose());
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.clear();
    };
  }, [close]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] ${
        close ? "opacity-30" : "opacity-90"
      }`}
      style={{
        // O deslocamento agora é feito em 3D (dirigido pela carga), não em CSS
        transform: "none",
        // Profundidade de campo no CTA: sem o desfoque a barra disputa leitura
        // com a headline que está por cima. Só roda no desktop (useCan3D barra mobile).
        filter: close ? "blur(7px)" : "none",
      }}
    />
  );
}
