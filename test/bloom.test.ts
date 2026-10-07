import assert from "node:assert/strict";
import { test } from "node:test";
import { BloomSet } from "../src/bloom.ts";

test("a miss is never reported for an inserted value", () => {
  const bloom = new BloomSet({ bits: 4096, hashes: 4 });
  for (let i = 0; i < 200; i++) bloom.add(`member-${i}`);
  for (let i = 0; i < 200; i++) assert.equal(bloom.has(`member-${i}`), true);
});

test("an empty filter rejects everything", () => {
  const bloom = new BloomSet({ bits: 64, hashes: 3 });
  assert.equal(bloom.has("nope"), false);
});

test("false positives stay under the loose bound", () => {
  const bits = 2048;
  const hashes = 3;
  const items = 100;
  const bloom = new BloomSet({ bits, hashes });
  for (let i = 0; i < items; i++) bloom.add(`in-${i}`);
  let hits = 0;
  const samples = 800;
  for (let i = 0; i < samples; i++) {
    if (bloom.has(`out-${i}`)) hits += 1;
  }
  const expected = BloomSet.falsePositiveRate(bits, hashes, items);
  assert.ok(hits / samples < expected + 0.08, `${hits / samples} vs ${expected}`);
});

test("the rate formula matches a known point", () => {
  const rate = BloomSet.falsePositiveRate(1000, 3, 100);
  assert.ok(rate > 0.01 && rate < 0.05, String(rate));
  assert.equal(BloomSet.falsePositiveRate(100, 2, 0), 0);
});

test("rejects bad sizes", () => {
  assert.throws(() => new BloomSet({ bits: 0, hashes: 1 }));
  assert.throws(() => new BloomSet({ bits: 8, hashes: 0 }));
});
