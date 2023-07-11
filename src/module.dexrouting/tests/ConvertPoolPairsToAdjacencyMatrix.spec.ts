import { convertPoolPairsToAdjacencyMatrix } from '../DexRoutingService';

describe('convertPoolPairsToAdjacencyMatrix', () => {
    it('should convert pool pairs to an adjacency matrix', () => {
      const poolPairs = [
        { fromToken: 'TOKEN1', toToken: 'TOKEN2', priceRatio: 0.5 },
        { fromToken: 'TOKEN1', toToken: 'TOKEN3', priceRatio: 2.0 },
        { fromToken: 'TOKEN2', toToken: 'TOKEN3', priceRatio: 4.0 },
        { fromToken: 'TOKEN3', toToken: 'TOKEN4', priceRatio: 3.0 },
      ];
  
      const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix(poolPairs);
      expect(adjacencyMatrix).toEqual([
        [0, 0.5, 2.0, 0],
        [0, 0, 4.0, 0],
        [0, 0, 0, 3.0],
        [0, 0, 0, 0],
      ]);
    });
  
    it('should return an empty matrix if no pool pairs are provided', () => {
      const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix([]);
      expect(adjacencyMatrix).toEqual([]);
    });
  });