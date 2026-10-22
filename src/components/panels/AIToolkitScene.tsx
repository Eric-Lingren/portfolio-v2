"use client";
// three.js track of the five stages. Geometry is WebGL; the stage labels are real HTML projected
// from 3D so text stays crisp, hoverable and accessible. WebGL mounts only in the polished layer,
// so the fly-through's sketch copy never opens a second GL context.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STAGES } from "@/content/ai-toolkit";

const N = STAGES.length;
const STEP_X = 3.35;
const STEP_Z = 0.2;
// Fixed horizontal field of view, so the five stages always span the same share of the scene width.
const HFOV = (62 * Math.PI) / 180;
// Labels float this far above their plate so the cubes stay visible underneath.
const LABEL_LIFT = 1.1;
const CYAN = 0x06b6d4;
const DIM = 0x334155;

function StageLabel({ i, active, onPick, labelRef }: { i: number; active: boolean; onPick: (i: number) => void; labelRef?: (n: HTMLDivElement | null) => void }) {
  const s = STAGES[i];
  return (
    <div className="ai-stage" data-active={active} ref={labelRef} onClick={() => onPick(i)}>
      <button
        type="button"
        className="ai-stage-title"
        aria-current={active ? "step" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onPick(i);
        }}
      >
        <span className="ai-stage-num">{i + 1}</span> {s.title}
      </button>
      <ul className="ai-skills">
        {s.skills.map((k) => (
          <li key={k.id} className="ai-skill" data-tip={k.tip}>
            <span className="ai-q">{k.question}</span>
            <span className="ai-name">{k.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AIToolkitScene({ step, onPick, onUnsupported }: { step: number; onPick: (i: number) => void; onUnsupported: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const setActive = useRef<((s: number) => void) | null>(null);
  const stepRef = useRef(step);
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    setLive(!host.current?.closest('[data-layer="sketch"]'));
  }, []);

  useEffect(() => {
    if (!live || !host.current) return;
    const el = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onUnsupported();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "ai-canvas";
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 6, 13.6);
    camera.lookAt(0, 1.7, -1);
    // root carries the drag tilt around the scene centre. The track inside it is centred and still,
    // and only the highlight moves, so no stage ever clips.
    const root = new THREE.Group();
    const track = new THREE.Group();
    const mid = (N - 1) / 2;
    track.position.set(-mid * STEP_X, 0, mid * STEP_Z);
    root.add(track);
    scene.add(root);

    const plates: THREE.Group[] = [];
    const edgeMats: THREE.LineBasicMaterial[] = [];
    const cubeMats: THREE.MeshBasicMaterial[][] = [];
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const pos = (i: number) => new THREE.Vector3(i * STEP_X, 0, -i * STEP_Z);

    const plate = new THREE.BoxGeometry(2.3, 0.08, 1.7);
    const edges = new THREE.EdgesGeometry(plate);
    const cube = new THREE.BoxGeometry(0.42, 0.3, 0.42);
    geos.push(plate, edges, cube);
    const plateMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.85 });
    mats.push(plateMat);

    STAGES.forEach((s, i) => {
      const g = new THREE.Group();
      g.position.copy(pos(i));
      g.add(new THREE.Mesh(plate, plateMat));
      const em = new THREE.LineBasicMaterial({ color: DIM });
      edgeMats.push(em);
      mats.push(em);
      g.add(new THREE.LineSegments(edges, em));
      const cm: THREE.MeshBasicMaterial[] = [];
      s.skills.forEach((_, k) => {
        const m = new THREE.MeshBasicMaterial({ color: DIM });
        cm.push(m);
        mats.push(m);
        const mesh = new THREE.Mesh(cube, m);
        mesh.position.set((k % 2) * 0.8 - 0.4, 0.2, Math.floor(k / 2) * 0.7 - 0.35);
        g.add(mesh);
      });
      cubeMats.push(cm);
      plates.push(g);
      track.add(g);
    });

    // Connector line along the track.
    const line = new THREE.BufferGeometry().setFromPoints(STAGES.map((_, i) => pos(i).setY(0.05)));
    const lineMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 });
    geos.push(line);
    mats.push(lineMat);
    track.add(new THREE.Line(line, lineMat));

    const tilt = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    let raf = 0;
    let dragging: { x: number; y: number } | null = null;

    const project = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const wp = new THREE.Vector3();
      labels.current.forEach((lab, i) => {
        if (!lab) return;
        plates[i].getWorldPosition(wp);
        wp.y += LABEL_LIFT;
        wp.project(camera);
        lab.style.transform = `translate(${((wp.x + 1) / 2) * w}px, ${((1 - wp.y) / 2) * h}px) translate(-50%, -100%)`;
      });
      // Labels stay hidden until their first placement so they never flash at the corner.
      el.dataset.ready = "";
    };
    const frame = () => {
      raf = 0;
      let moving = false;
      for (const k of ["x", "y"] as const) {
        const d = goal[k] - tilt[k];
        if (Math.abs(d) > 0.001) {
          tilt[k] += d * 0.14;
          moving = true;
        } else tilt[k] = goal[k];
      }
      root.rotation.set(tilt.x, tilt.y, 0);
      renderer.render(scene, camera);
      project();
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    setActive.current = (s: number) => {
      plates.forEach((_, i) => {
        edgeMats[i].color.setHex(i === s ? CYAN : DIM);
        cubeMats[i].forEach((m) => m.color.setHex(i === s ? CYAN : DIM));
      });
      kick();
    };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = (2 * Math.atan(Math.tan(HFOV / 2) / camera.aspect) * 180) / Math.PI;
      camera.updateProjectionMatrix();
      kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Bounded tilt drag. No free orbit, springs back on release, never captures wheel or scroll.
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    const down = (e: PointerEvent) => {
      // Labels are clickable. Capturing the pointer would retarget their click.
      if ((e.target as HTMLElement).closest(".ai-stage")) return;
      dragging = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      goal.y = clamp((e.clientX - dragging.x) * 0.0021, 0.24);
      goal.x = clamp((e.clientY - dragging.y) * 0.0014, 0.14);
      kick();
    };
    const up = () => {
      dragging = null;
      goal.x = 0;
      goal.y = 0;
      kick();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    setActive.current(stepRef.current);
    resize();

    return () => {
      setActive.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [live, onUnsupported]);

  useEffect(() => {
    stepRef.current = step;
    setActive.current?.(step);
  }, [step]);

  // Sketch layer: the same labels in a plain row, no WebGL.
  if (live === false) {
    return (
      <div className="ai-scene ai-scene--sketch" ref={host}>
        {STAGES.map((s, i) => (
          <StageLabel key={s.id} i={i} active={i === step} onPick={onPick} />
        ))}
      </div>
    );
  }
  return (
    <div className="ai-scene ai-scene--three" ref={host} data-testid="ai-scene">
      {STAGES.map((s, i) => (
        <StageLabel
          key={s.id}
          i={i}
          active={i === step}
          onPick={onPick}
          labelRef={(n) => {
            labels.current[i] = n;
          }}
        />
      ))}
    </div>
  );
}
