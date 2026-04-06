const COEFFS = { concentration: 20.9, flow: 136, distance: -87.1, voltage: -0.5 };
const INTERCEPT = 1340;
const BASE = { concentration: 15, flow: 1.0, distance: 15, voltage: 15 };
const RANGES = {
  concentration: [0.1, 30],
  flow: [0.01, 10],
  distance: [1, 40],
  voltage: [1, 50],
};
const concStep = 1;
const target = process.argv[2] ? Number(process.argv[2]) : 900;

const d0 = INTERCEPT + Object.keys(COEFFS).reduce((s, k) => s + COEFFS[k] * BASE[k], 0);
const delta = target - d0;
const denom = Object.keys(COEFFS).reduce((s, k) => s + COEFFS[k] * COEFFS[k], 0) || 1e-12;
const dxScale = delta / denom;

const unquant = {};
Object.keys(COEFFS).forEach((k) => {
  unquant[k] = BASE[k] + COEFFS[k] * dxScale;
});

const quant = {};
Object.keys(COEFFS).forEach((k) => {
  let xi = unquant[k];
  if (k === 'concentration' && concStep && concStep > 0) {
    xi = Math.round(xi / concStep) * concStep;
  }
  const [min, max] = RANGES[k] || [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  if (xi < min) xi = min;
  if (xi > max) xi = max;
  quant[k] = Number(xi.toFixed(3));
});

const predict = (params) => INTERCEPT + Object.keys(COEFFS).reduce((s, k) => s + COEFFS[k] * params[k], 0);

console.log('TARGET:', target);
console.log('BASE d0:', d0.toFixed(6));
console.log('DELTA:', delta.toFixed(6));
console.log('DENOM (||c||^2):', denom.toFixed(6));
console.log('\nUnquantized solution (minimal-norm):');
Object.keys(unquant).forEach((k) => console.log(`  ${k}: ${unquant[k].toFixed(6)}`));
console.log('Predicted D (unquantized):', predict(unquant).toFixed(6));

console.log('\nQuantized/displayed solution:');
Object.keys(quant).forEach((k) => console.log(`  ${k}: ${quant[k]}`));
const predQ = predict(quant);
console.log('Predicted D (quantized):', predQ.toFixed(6));
console.log('Error vs target (quantized):', (predQ - target).toFixed(6));
