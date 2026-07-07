import type { Config } from '../../config/Config';
import type { Genome } from '../genome/Genome';

/**
 * Represents a species in the NEAT algorithm.
 */
export class Species {
  bestFitness = 0;
  generationsSinceImprovement = 0;
  stagnated = false;
  genomes: Genome[] = [];
  representative: Genome | null = null;
  offspringCount = 0;

  /**
   * Creates a new Species instance.
   * @param id - The unique identifier for this species.
   * @param config - The configuration object.
   */
  constructor(public id: number, public config: Config) {}

  /**
   * Adds a genome to this species.
   * If this is the first genome, it becomes the representative.
   * @param genome - The genome to add.
   */
  addGenome(genome: Genome): void {
    if (this.genomes.length === 0) {
      this.representative = genome;
    }
    this.genomes.push(genome);
  }

  /**
   * Calculates and sets the adjusted fitness for all genomes in this species.
   * Adjusted fitness is the raw fitness divided by the species size (fitness sharing).
   */
  setAdjustedFitness(): void {
    for (const genome of this.genomes) {
      genome.adjustedFitness = genome.fitness / this.genomes.length;
    }
  }

  /**
   * Removes the worst-performing genomes from this species.
   */
  removeBadGenomes(): void {
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
  updateFitnessAndStagnation(): void {
    const currentBest = this.getBestGenome().fitness;
    if (currentBest > this.bestFitness) {
      this.bestFitness = currentBest;
      this.generationsSinceImprovement = 0;
    } else {
      this.generationsSinceImprovement++;
    }
    if (this.generationsSinceImprovement > this.config.dropOffAge) {
      this.stagnated = true;
    }
  }

  /**
   * Calculates the total adjusted fitness of all genomes in this species.
   * @returns The sum of all adjusted fitness values.
   */
  getTotalAdjustedFitness(): number {
    let total = 0;
    for (const genome of this.genomes) {
      total += genome.adjustedFitness;
    }
    return total;
  }

  /**
   * Gets the genome with the highest fitness in this species.
   * @returns The best-performing genome.
   */
  getBestGenome(): Genome {
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
  setRandomRepresentative(): void {
    if (this.genomes.length === 0) {
      this.representative = null;
    } else {
      this.representative = this.genomes[Math.floor(Math.random() * this.genomes.length)];
    }
  }
}
