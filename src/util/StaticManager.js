const GenomeTracker = require('./trackers/GenomeTracker');
const NodeTracker = require('./trackers/NodeTracker');

/** @typedef {import('./trackers/InnovationTracker')} InnovationTracker */

/**
 * Singleton manager class for accessing trackers.
 */
class StaticManager {
  /**
   * Creates or returns the singleton StaticManager instance.
   * Initializes tracker maps for storing population-specific trackers.
   */
  constructor() {
    if (!StaticManager.instance) {
      StaticManager.instance = this;
      this.innovationTrackerMap = new Map();
      this.genomeTrackerMap = new Map();
      this.nodeTrackerMap = new Map();
    }
    return StaticManager.instance;
  }

  /**
   * Gets or creates an InnovationTracker for the specified population.
   * @param {number} populationId - The unique identifier of the population.
   * @returns {InnovationTracker} The InnovationTracker instance for this population.
   */
  getInnovationTracker(populationId) {
    if (this.innovationTrackerMap.has(populationId)) {
      return this.innovationTrackerMap.get(populationId);
    } else {
      const InnovationTracker = require('./trackers/InnovationTracker');
      const newInnovationTracker = new InnovationTracker();
      this.innovationTrackerMap.set(populationId, newInnovationTracker);
      return newInnovationTracker;
    }
  }

  /**
   * Gets or creates a GenomeTracker for the specified population.
   * @param {number} populationId - The unique identifier of the population.
   * @returns {GenomeTracker} The GenomeTracker instance for this population.
   */
  getGenomeTracker(populationId) {
    if (this.genomeTrackerMap.has(populationId)) {
      return this.genomeTrackerMap.get(populationId);
    } else {
      const genomeTracker = new GenomeTracker();
      this.genomeTrackerMap.set(populationId, genomeTracker);
      return genomeTracker;
    }
  }

  /**
   * Gets or creates a NodeTracker for the specified population.
   * @param {number} populationId - The unique identifier of the population.
   * @returns {NodeTracker} The NodeTracker instance for this population.
   */
  getNodeTracker(populationId) {
    if (this.nodeTrackerMap.has(populationId)) {
      return this.nodeTrackerMap.get(populationId);
    } else {
      const nodeTracker = new NodeTracker();
      this.nodeTrackerMap.set(populationId, nodeTracker);
      return nodeTracker;
    }
  }
}

module.exports = new StaticManager();