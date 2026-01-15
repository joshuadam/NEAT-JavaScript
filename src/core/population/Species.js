/** @typedef {import('../../config/Config')} Config */
/** @typedef {import('../genome/Genome')} Genome */

/**
 * Represents a species in the NEAT algorithm.
 */
class Species {
  /**
   * Creates a new Species instance.
   * @param {number} id - The unique identifier for this species.
   * @param {Config} config - The configuration object.
   */
  constructor(id, config) {
    /** @type {number} */
    this.id = id;
    /** @type {Config} */
    this.config = config;
    /** @type {number} */
    this.bestFitness = 0;
    /** @type {number} */
    this.generationsSinceImprovement = 0;
    /** @type {boolean} */
    this.stagnated = false;
    /** @type {Genome[]} */
    this.genomes = [];
    /** @type {Genome|null} */
    this.representative = null;
    /** @type {number} */
    this.offspringCount = 0;
  }

  /**
   * Adds a genome to this species.
   * If this is the first genome, it becomes the representative.
   * @param {Genome} genome - The genome to add.
   */
  addGenome(genome) {
    if (this.genomes.length === 0) {
      this.representative = genome;
    }
    this.genomes.push(genome);
  }

  /**
   * Calculates and sets the adjusted fitness for all genomes in this species.
   * Adjusted fitness is the raw fitness divided by the species size (fitness sharing).
   */
  setAdjustedFitness() {
    for (const genome of this.genomes) {
      genome.adjustedFitness = genome.fitness / this.genomes.length;
    }
  }

  /**
   * Removes the worst-performing genomes from this species.
   */
  removeBadGenomes() {
    this.genomes.sort((a, b) => b.fitness - a.fitness);

    const totalGenomes = this.genomes.length;
    const numberToSurvive = Math.max(1, Math.floor(totalGenomes * this.config.survivalRate));

    if (this.genomes.length > numberToSurvive) {
      this.genomes.splice(numberToSurvive, this.genomes.length - numberToSurvive);
    }
  }

  /**
   * Updates the species' best fitness and stagnation tracking.
   */
  updateFitnessAndStagnation() {
    let currentBest = this.getBestGenome().fitness;
    if (currentBest > this.bestFitness) {
      this.bestFitness = currentBest;
      this.generationsSinceImprovement = 0;
    } else {
      this.generationsSinceImprovement++;
    }
    if (this.generationsSinceImprovement > this.config.dropoffAge) {
      this.stagnated = true;
    }
  }

  /**
   * Calculates the total adjusted fitness of all genomes in this species.
   * @returns {number} The sum of all adjusted fitness values.
   */
  getTotalAdjustedFitness() {
    let total = 0;
    for (const genome of this.genomes) {
      total += genome.adjustedFitness;
    }
    return total;
  }

  /**
   * Gets the genome with the highest fitness in this species.
   * @returns {Genome} The best-performing genome.
   */
  getBestGenome() {
    let bestGenome = this.genomes[0];
    for (const genome of this.genomes) {
      if (genome.fitness > bestGenome.fitness) {
        bestGenome = genome;
      }
    }
    return bestGenome;
  }

  /**
   * Sets a random genome from this species as the new representative.
   */
  setRandomRepresentative() {
    if (this.genomes.length === 0) {
      this.representative = null;
    } else {
      this.representative = this.genomes[Math.floor(Math.random() * this.genomes.length)];
    }
  }
}

module.exports = Species;
