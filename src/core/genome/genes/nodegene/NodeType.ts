/**
 * Enumeration of the node kinds that can appear in a NEAT genome.
 * The object is frozen at runtime and doubles as a string-literal
 * union type of its values.
 */
export const NodeType = Object.freeze({
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  HIDDEN: 'HIDDEN',
  BIAS: 'BIAS'
} as const);

export type NodeType = (typeof NodeType)[keyof typeof NodeType];
