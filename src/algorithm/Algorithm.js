const Population = require('../core/population/Population');

/** @typedef {import('../config/Config')} Config */

/**
 * NEAT algorithm runner class.
 * Manages the evolutionary process by creating a population and running
 * the evolution loop until target fitness is reached or generations are exhausted.
 */
class Algorithm {
  /**
   * Creates a new NEAT algorithm instance.
   * @param {Config} config - The configuration object used to initialize the population and set target fitness / generations.
   */
  constructor(config) {
    this.config = config;
    this.population = new Population(config);
  }

  /**
   * Runs the NEAT evolutionary algorithm.
   * Evaluates the initial population, then iteratively evolves and evaluates
   * until the target fitness is reached or the maximum number of generations is completed.
   * Logs progress to the console after each generation.
   */
  run() {
    this.population.evaluatePopulation();
      for (let i = 0; i < this.config.generations; i++) {
        this.population.evolve();
        this.population.evaluatePopulation();
        let bestFitness = this.population.getBestGenome().fitness;

        console.log('Generation: ' + this.population.generation + ' best fitness: ' + bestFitness);
        if (bestFitness >= this.config.targetFitness) {
          console.log('Target fitness reached');
          break;
        }
      }
  }
}

module.exports = Algorithm;