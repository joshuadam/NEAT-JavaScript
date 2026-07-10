// Smoke test for the compiled library: exercises the public API end to end.
// Run with: npm test
const assert = require('assert');
const NEAT = require('../dist/index.js');

// 1. All public exports exist
const expectedExports = [
  'ActivationFunction', 'Gaussian', 'LeakyReLU', 'NEATSigmoid', 'ReLU', 'SELU', 'Sigmoid', 'Tanh',
  'Algorithm', 'Config', 'ConnectionGene', 'ConnectionGeneData', 'GeneticEncoding', 'NodeGeneData',
  'BiasNode', 'HiddenNode', 'InputNode', 'NodeGene', 'NodeType', 'OutputNode', 'Genome',
  'Population', 'Species', 'FitnessFunction', 'XOR', 'InnovationTracker', 'ConfigTracker',
  'GenomeTracker', 'NodeTracker', 'PopulationTracker', 'StaticManager', 'WeightInitialization',
  'RandomWeightInitialization', 'GenomeBuilder'
];
for (const name of expectedExports) {
  assert.ok(NEAT[name] !== undefined, `missing export: ${name}`);
}
assert.strictEqual(NEAT.NodeType.HIDDEN, 'HIDDEN');

// 2. Config resolves names/declarative forms to instances
const config = new NEAT.Config({ inputSize: 2, outputSize: 1 });
assert.ok(config.activationFunction instanceof NEAT.Sigmoid);
assert.ok(config.weightInitialization instanceof NEAT.RandomWeightInitialization);
assert.ok(config.fitnessFunction instanceof NEAT.XOR);
assert.throws(() => new NEAT.Config({ activationFunction: 'Nope' }), /Unknown activation function/);

// 3. Genome construction, propagation, copy, equality
const genome = NEAT.GenomeBuilder.buildGenome(config);
const out = genome.propagate([0, 1]);
assert.strictEqual(out.length, 1);
assert.ok(Number.isFinite(out[0]));
const clone = genome.copy();
assert.ok(genome.equalsGenome(clone));

// 4. JSON round trip
const json = genome.toJSON();
const restored = NEAT.GenomeBuilder.loadGenome(json, config);
assert.strictEqual(restored.connectionGenes.length, genome.connectionGenes.length);
assert.deepStrictEqual(restored.propagate([1, 0]), genome.propagate([1, 0]));

// 5. Crossover and prune
genome.fitness = 1;
clone.fitness = 0.5;
const child = genome.crossover(clone);
assert.ok(child.nodeGenes.length >= genome.nodeGenes.length - 1);
child.prune(true);
assert.ok(child.connectionGenes.every(c => c.enabled));

// 6. Evolution improves fitness on XOR
const popConfig = new NEAT.Config({ populationSize: 100, generations: 30 });
const population = new NEAT.Population(popConfig);
population.evaluatePopulation();
const initialBest = population.getBestGenome().fitness;
for (let i = 0; i < 30; i++) {
  population.evolve();
  population.evaluatePopulation();
}
const finalBest = population.getBestGenome().fitness;
assert.strictEqual(population.genomes.length, 100);
assert.ok(finalBest >= initialBest, `fitness regressed: ${initialBest} -> ${finalBest}`);
assert.ok(finalBest > 0.5, `expected XOR fitness above 0.5, got ${finalBest}`);

// 7. Custom structural (duck-typed) functions still work
const custom = new NEAT.Config({
  activationFunction: { apply: v => v },
  fitnessFunction: { calculateFitness: () => 42 }
});
const g2 = NEAT.GenomeBuilder.buildGenome(custom);
g2.evaluateFitness();
assert.strictEqual(g2.fitness, 42);

console.log(`smoke ok (XOR best fitness after 30 generations: ${finalBest.toFixed(3)})`);
