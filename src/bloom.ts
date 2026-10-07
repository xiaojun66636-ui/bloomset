export type BloomOptions = {
  /** Bit array length. */
  bits: number;
  /** Independent hash positions per insert. */
  hashes: number;
};

/**
 * Bloom filter. `has` false means the value was never added.
 * `has` true means it might have been added.
 */
export class BloomSet {
  private readonly bits: number;
  private readonly hashes: number;
  private readonly words: Uint8Array;

  constructor(options: BloomOptions) {
    if (!Number.isInteger(options.bits) || options.bits < 1) {
      throw new Error("bits must be an integer >= 1");
    }
    if (!Number.isInteger(options.hashes) || options.hashes < 1) {
      throw new Error("hashes must be an integer >= 1");
    }
    this.bits = options.bits;
    this.hashes = options.hashes;
    this.words = new Uint8Array(Math.ceil(options.bits / 8));
  }

  add(value: string): void {
    for (const index of this.indexes(value)) this.setBit(index);
  }

  has(value: string): boolean {
    for (const index of this.indexes(value)) {
      if (!this.getBit(index)) return false;
    }
    return true;
  }

  /**
   * Expected false-positive rate for `items` inserts: (1 - e^(-k n / m))^k.
   * This is the formula, not a count of what this instance has stored.
   */
  static falsePositiveRate(bits: number, hashes: number, items: number): number {
    if (bits < 1 || hashes < 1 || items < 0) {
      throw new Error("bits and hashes must be >= 1, items >= 0");
    }
    const clear = Math.exp((-hashes * items) / bits);
    return (1 - clear) ** hashes;
  }

  private indexes(value: string): number[] {
    const first = fnv1a(value, 0x811c9dc5);
    const second = fnv1a(value, 0x01000193) || 1;
    const out: number[] = [];
    for (let i = 0; i < this.hashes; i++) {
      out.push((first + i * second) % this.bits);
    }
    return out;
  }

  private setBit(index: number) {
    this.words[index >> 3] |= 1 << (index & 7);
  }

  private getBit(index: number): boolean {
    return (this.words[index >> 3] & (1 << (index & 7))) !== 0;
  }
}

function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
