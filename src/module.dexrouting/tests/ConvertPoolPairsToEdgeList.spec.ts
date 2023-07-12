import { convertPoolPairsToEdgeList } from '../DexRoutingService';

type PoolPair = {
  symbol: string;
  tokenA: string;
  tokenB: string;
  priceRatio: [number, number];
};

describe('convertPoolPairsToEdgeList', () => {
  it('should convert pool pairs to an edge list', () => {
    const poolPairs: PoolPair[] = [
      { symbol: 'TOKEN1-TOKEN2', tokenA: 'TOKEN1', tokenB: 'TOKEN2', priceRatio: [1, 0.5] },
      { symbol: 'TOKEN1-TOKEN3', tokenA: 'TOKEN1', tokenB: 'TOKEN3', priceRatio: [1, 2.0] },
      { symbol: 'TOKEN2-TOKEN3', tokenA: 'TOKEN2', tokenB: 'TOKEN3', priceRatio: [1, 4.0] },
      { symbol: 'TOKEN3-TOKEN4', tokenA: 'TOKEN3', tokenB: 'TOKEN4', priceRatio: [1, 3.0] },
    ];

    const edgeList = convertPoolPairsToEdgeList(poolPairs);
    expect(edgeList).toEqual([
      ['TOKEN1', 'TOKEN2', 0.5],
      ['TOKEN1', 'TOKEN3', 2.0],
      ['TOKEN2', 'TOKEN3', 4.0],
      ['TOKEN3', 'TOKEN4', 3.0],
    ]);
    console.log('Edge List:', edgeList);
  });

  it('should return an empty edge list if no pool pairs are provided', () => {
    const edgeList = convertPoolPairsToEdgeList([]);
    expect(edgeList).toEqual([]);
    console.log('Edge List:', edgeList);
  });
});

