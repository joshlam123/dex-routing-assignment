import { convertPoolPairsToAdjacencyMatrix } from '../DexRoutingService';

type PoolPair = {
  symbol: string;
  tokenA: string;
  tokenB: string;
  priceRatio: [number, number];
};

describe('convertPoolPairsToAdjacencyMatrix', () => {
  it('should convert pool pairs to an adjacency matrix', () => {
    const poolPairs: PoolPair[] = [
      { symbol: 'TOKEN1-TOKEN2', tokenA: 'TOKEN1', tokenB: 'TOKEN2', priceRatio: [1, 0.5] },
      { symbol: 'TOKEN1-TOKEN3', tokenA: 'TOKEN1', tokenB: 'TOKEN3', priceRatio: [1, 2.0] },
      { symbol: 'TOKEN2-TOKEN3', tokenA: 'TOKEN2', tokenB: 'TOKEN3', priceRatio: [1, 4.0] },
      { symbol: 'TOKEN3-TOKEN4', tokenA: 'TOKEN3', tokenB: 'TOKEN4', priceRatio: [1, 3.0] },
    ];

    const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix(poolPairs);
    expect(adjacencyMatrix).toEqual([
      [0, 0.5, 2.0, 0],
      [0, 0, 4.0, 0],
      [0, 0, 0, 3.0],
      [0, 0, 0, 0],
    ]);
    console.log('Adjacency Matrix:', adjacencyMatrix);
  });

  it('should return an empty matrix if no pool pairs are provided', () => {
    const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix({});
    expect(adjacencyMatrix).toEqual([]);
    console.log('Adjacency Matrix:', adjacencyMatrix);
  });
});