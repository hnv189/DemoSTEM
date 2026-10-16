import { useEffect, useState } from 'react';
import type { Texture } from 'three';
import { CUBES } from '../content/vocabulary';
import { buildFaceTextures } from './faceTextures';

/** Face textures are drawn once per visit and shared by the demo and the build page. */
let cache: Promise<Texture[][]> | null = null;
let progressValue = 0;
const listeners = new Set<(n: number) => void>();

function load() {
  if (!cache) {
    cache = buildFaceTextures(CUBES, (done) => {
      progressValue = done;
      listeners.forEach((l) => l(done));
    }).then((res) => {
      if (res.failed.length) console.warn('Missing illustrations:', res.failed);
      return res.textures;
    });
  }
  return cache;
}

export function useFaceTextures(enabled: boolean) {
  const [textures, setTextures] = useState<Texture[][] | null>(null);
  const [progress, setProgress] = useState(progressValue);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    listeners.add(setProgress);
    load().then((t) => alive && setTextures(t));
    return () => {
      alive = false;
      listeners.delete(setProgress);
    };
  }, [enabled]);
  return { textures, progress, total: 18 };
}
