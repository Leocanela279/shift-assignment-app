import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exports the complete Cuadra editor as static HTML", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="es"/i);
  assert.match(html, /<title>Cuadra — Crea cuadrantes de trabajo gratis<\/title>/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/cuadra\.leo-dev\.es\/"\/>/i);
  assert.match(html, /<meta property="og:url" content="https:\/\/cuadra\.leo-dev\.es\/"\/>/i);
  assert.match(html, /<meta property="og:site_name" content="Cuadra"\/>/i);
  assert.match(html, /<meta property="og:image" content="https:\/\/cuadra\.leo-dev\.es\/og-share-v2\.jpg"\/>/i);
  assert.match(html, /<meta property="og:image:secure_url" content="https:\/\/cuadra\.leo-dev\.es\/og-share-v2\.jpg"\/>/i);
  assert.match(html, /<meta property="og:image:type" content="image\/jpeg"\/>/i);
  assert.match(html, /<meta property="og:image:width" content="1200"\/>/i);
  assert.match(html, /<meta property="og:image:height" content="630"\/>/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/i);
  assert.match(html, /<meta name="robots" content="index, follow"\/>/i);
  assert.match(html, /Saltar al editor/i);
  assert.match(html, /aria-label="Editor de cuadrantes"/i);
  assert.match(html, /Tu equipo,/);
  assert.match(html, /Prepara el cuadrante/);
  assert.match(html, /Descargar PDF/);
  assert.match(html, /Desarrollado por Leandro Canela/);
  assert.match(html, /Sin registro/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});
