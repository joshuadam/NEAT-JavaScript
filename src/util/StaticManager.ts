import { GenomeTracker } from './trackers/GenomeTracker';
import { NodeTracker } from './trackers/NodeTracker';
import { InnovationTracker } from './trackers/InnovationTracker';

/**
 * Singleton manager class for accessing per-population trackers.
 * The module exports a single shared instance.
 */
class StaticManager {
  private readonly innovationTrackerMap = new Map<number, InnovationTracker>();
  private readonly genomeTrackerMap = new Map<number, GenomeTracker>();
  private readonly nodeTrackerMap = new Map<number, NodeTracker>();

  /**
   * Gets or creates an InnovationTracker for the specified population.
   * @param populationId - The unique identifier of the population.
   * @returns The InnovationTracker instance for this population.
   */
  getInnovationTracker(populationId: number): InnovationTracker {
    let tracker = this.innovationTrackerMap.get(populationId);
    if (tracker === undefined) {
      tracker = new InnovationTracker();
      this.innovationTrackerMap.set(populationId, tracker);
    }
    return tracker;
  }

  /**
   * Gets or creates a GenomeTracker for the specified population.
   * @param populationId - The unique identifier of the population.
   * @returns The GenomeTracker instance for this population.
   */
  getGenomeTracker(populationId: number): GenomeTracker {
    let tracker = this.genomeTrackerMap.get(populationId);
    if (tracker === undefined) {
      tracker = new GenomeTracker();
      this.genomeTrackerMap.set(populationId, tracker);
    }
    return tracker;
  }

  /**
   * Gets or creates a NodeTracker for the specified population.
   * @param populationId - The unique identifier of the population.
   * @returns The NodeTracker instance for this population.
   */
  getNodeTracker(populationId: number): NodeTracker {
    let tracker = this.nodeTrackerMap.get(populationId);
    if (tracker === undefined) {
      tracker = new NodeTracker();
      this.nodeTrackerMap.set(populationId, tracker);
    }
    return tracker;
  }
}

export default new StaticManager();
