const COEFFS = { concentration: 13.0542, flow: 316.9467, distance: 0.1777, voltage: -2567.624 };
const INTERCEPT = -137.7312;
const BASE = { concentration: 30, flow: 0.35, distance: 25, voltage: 0.0109 };
const RANGES = {
  concentration: [0.1, 40],
  flow: [0.01, 10],
  distance: [1, 100],
  voltage: [0.001, 1],
};
const concStep = 0.01;
const target = process.argv[2] ? Number(process.argv[2]) : 350;

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
  quant[k] = Number(xi.toFixed(6));
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
