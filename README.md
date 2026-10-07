# bloomset

A Bloom filter. No dependencies.

`has` returning false means the value was never inserted. `has` returning true means it probably was. There are no false negatives. False positives are the cost of a fixed bit array and no stored keys.

Each insert sets `hashes` bits. Positions come from double hashing, not `k` independent hash functions. The expected false-positive rate for `n` inserts into `m` bits with `k` hashes is `(1 - e^(-k n / m))^k`. `BloomSet.falsePositiveRate` returns that number. It does not inspect the filter.

## Use

```ts
import { BloomSet } from "./src/bloom.ts";

const seen = new BloomSet({ bits: 4096, hashes: 4 });
seen.add("user-42");
seen.has("user-42"); // true
seen.has("user-43"); // false, or rarely true
```

Size the bit array for the item count you expect. A filter that is too small mostly returns true.

## Test

```bash
node --experimental-strip-types --test test/*.test.ts
```

## License

MIT
