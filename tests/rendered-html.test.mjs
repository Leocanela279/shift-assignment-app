import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exports the complete Cuadra editor as static HTML", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="es"/i);
  assert.match(html, /<title>Cuadra — Crea cuadrantes de trabajo gratis<\/title>/i);
  assert.match(html, /Tu equipo,/);
  assert.match(html, /Prepara el cuadrante/);
  assert.match(html, /Descargar PDF/);
  assert.match(html, /Desarrollado por Leandro Canela/);
  assert.match(html, /Sin registro/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});
