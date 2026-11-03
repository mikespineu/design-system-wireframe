import { useEffect, useState } from 'react';
import { cancelRender, continueRender, delayRender } from 'remotion';

/** Families from `fonts.css` (default look) and `themes/bold-fonts.css` (bold look). */
export const FONT_FAMILIES = ['Red Hat Text', 'Red Hat Mono', 'Bricolage Grotesque', 'Figtree', 'IBM Plex Mono'];

export const FONT_FACES = FONT_FAMILIES.map((family) => `16px "${family}"`);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The fonts stylesheets are `@import`ed, so their @font-face rules can arrive after first paint. */
const waitForFaceRules = async (timeoutMs: number) => {
  const started = Date.now();
  const declared = () => new Set(Array.from(document.fonts, (face) => face.family.replace(/["']/g, '')));
  while (Date.now() - started < timeoutMs && !FONT_FAMILIES.every((family) => declared().has(family))) {
    await sleep(50);
  }
};

/**
 * Holds the render (`delayRender`) until the web fonts are declared and loaded, so no frame is captured
 * with a fallback font. Returns true once the fonts are ready.
 */
export const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading design system fonts'));

  useEffect(() => {
    let cancelled = false;
    waitForFaceRules(15_000)
      .then(() => Promise.all(FONT_FACES.map((face) => document.fonts.load(face))))
      .then(() => document.fonts.ready)
      .then(() => {
        if (cancelled) return;
        setReady(true);
        continueRender(handle);
      })
      .catch((err: unknown) => cancelRender(err));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return ready;
};
