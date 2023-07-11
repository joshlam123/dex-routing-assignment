import { convertPoolPairsToEdgeList } from '../DexRoutingService';

describe('convertPoolPairsToEdgeList', () => {
    it('should convert pool pairs to an edge list', () => {
      const poolPairs = [
        { fromToken: 'TOKEN1', toToken: 'TOKEN2', priceRatio: 0.5 },
        { fromToken: 'TOKEN1', toToken: 'TOKEN3', priceRatio: 2.0 },
        { fromToken: 'TOKEN2', toToken: 'TOKEN3', priceRatio: 4.0 },
        { fromToken: 'TOKEN3', toToken: 'TOKEN4', priceRatio: 3.0 },
      ];
  
      const edgeList = convertPoolPairsToEdgeList(poolPairs);
      expect(edgeList).toEqual([
        ['TOKEN1', 'TOKEN2', 0.5],
        ['TOKEN1', 'TOKEN3', 2.0],
        ['TOKEN2', 'TOKEN3', 4.0],
        ['TOKEN3', 'TOKEN4', 3.0],
      ]);
    });
  
    it('should return an empty edge list if no pool pairs are provided', () => {
      const edgeList = convertPoolPairsToEdgeList([]);
      expect(edgeList).toEqual([]);
    });
  });

  