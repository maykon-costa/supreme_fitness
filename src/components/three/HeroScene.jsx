import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Cena 3D — a ÚNICA geometria do site. BRIEF §4 (seção 01) e §5.
 *
 * Uma anilha de 20kg em metal escovado, girando lento no eixo Y com parallax
 * de mouse suavizado. Reaproveitada no CTA final (mesmo chunk, zero download extra).
 *
 * Por que three.js puro e não @react-three/fiber:
 * o chunk com R3F fechava 236kb gz, acima do teto de 200kb do LP_GUIDE §6.
 * Para UM mesh, duas luzes e um loop de render, a camada declarativa do R3F
 * custava ~45kb gz sem entregar nada que este arquivo não resolva em 80 linhas.
 * Vale a regra do LP_GUIDE §1: se dá para cortar sem perder efeito, corta.
 *
 * Performance — LP_GUIDE §5.2:
 *   · geometria procedural: nenhum .glb para baixar
 *   · pixel ratio limitado a 1.75
 *   · antialias off (a silhueta é curva e escura, não aparece)
 *   · loop pausado fora da viewport e com a aba em segundo plano
 *   · pointer-events-none: nunca rouba o clique do CTA
 *
 * Só é montado quando useCan3D() aprova o device.
 */

function criarAnilha() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false);

  // furo central
  const centro = new THREE.Path();
  centro.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
  shape.holes.push(centro);

  // pegadas — o detalhe que faz ler como anilha de verdade
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
    curveSegments: 48,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
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
    camera.position.z = 6;

    // ---- environment procedural: reflexo de metal sem baixar HDR ----
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;

    // ---- luzes ----
    const ambiente = new THREE.AmbientLight(0xffffff, 0.35);
    const principal = new THREE.DirectionalLight(0xffffff, 2.1);
    principal.position.set(4, 5, 5);
    const contra = new THREE.DirectionalLight(0xe8232a, 1.5);
    contra.position.set(-5, -2, -3);
    scene.add(ambiente, principal, contra);

    // ---- anilha ----
    const grupo = new THREE.Group();
    // A anilha é elemento de apoio, não protagonista: em escala maior ela
    // invade a headline e derruba o contraste do texto (LP_GUIDE §7).
    // No CTA final a anilha vira fundo desfocado (ver `filter` no wrapper), não
    // objeto reconhecível cruzando a headline.
    grupo.scale.setScalar(close ? 2.4 : 0.92);
    grupo.rotation.set(0.42, 0, -0.12);

    const geoAnilha = criarAnilha();
    const matAnilha = new THREE.MeshStandardMaterial({
      color: 0x1b1c20,
      metalness: 0.94,
      roughness: 0.31,
      envMapIntensity: 1.15,
    });
    grupo.add(new THREE.Mesh(geoAnilha, matAnilha));

    // aro vermelho na FACE da anilha: leitura de marca sem precisar de textura.
    // Deitado (rotation.x = PI/2) ele lia como elástico atravessando o furo.
    const geoAro = new THREE.TorusGeometry(0.43, 0.019, 12, 72);
    const matAro = new THREE.MeshStandardMaterial({
      color: 0xe8232a,
      metalness: 0.5,
      roughness: 0.28,
      emissive: 0xe8232a,
      emissiveIntensity: 0.32,
    });
    const aro = new THREE.Mesh(geoAro, matAro);
    aro.position.z = 0.115; // assenta sobre a face frontal, não dentro da massa
    grupo.add(aro);

    scene.add(grupo);
    descartaveis.push(geoAnilha, matAnilha, geoAro, matAro, env.texture);

    // ---- interação ----
    const onMove = (e) => {
      alvoMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      alvoMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ---- loop ----
    const relogio = new THREE.Clock();

    const animar = () => {
      rafId = requestAnimationFrame(animar);
      if (!visivel) return;

      const delta = Math.min(relogio.getDelta(), 0.05);

      grupo.rotation.y += delta * 0.34;

      // parallax de mouse com lerp — nunca 1:1 (BRIEF §4)
      const k = 1 - Math.pow(0.001, delta);
      grupo.rotation.x += (alvoMouse.y * 0.26 - grupo.rotation.x) * k;
      grupo.position.x += (alvoMouse.x * 0.28 - grupo.position.x) * k;

      renderer.render(scene, camera);
    };
    animar();

    // ---- pausa fora da viewport / aba em segundo plano ----
    const obs = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting && document.visibilityState === "visible";
        if (visivel) relogio.getDelta(); // descarta o delta acumulado na pausa
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
        close ? "opacity-30" : "opacity-80"
      }`}
      style={{
        transform: close ? "none" : "translateX(31%)",
        // Profundidade de campo no CTA: sem o desfoque, os furos de pegada e o
        // aro vermelho disputam leitura com a headline que está por cima.
        // Só roda no desktop — o useCan3D já barra mobile.
        filter: close ? "blur(7px)" : "none",
      }}
    />
  );
}
