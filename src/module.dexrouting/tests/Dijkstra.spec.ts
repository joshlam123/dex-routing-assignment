import { dijkstra, AdjacencyMatrix } from '../DexRoutingService';

describe('Dijkstra', () => {
  const adjacencyMatrix: AdjacencyMatrix = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
    [2, 1, 0, 1, 2, 3, 4, 5, 6, 7],
    [3, 2, 1, 0, 1, 2, 3, 4, 5, 6],
    [4, 3, 2, 1, 0, 1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1, 0, 1, 2, 3, 4],
    [6, 5, 4, 3, 2, 1, 0, 1, 2, 3],
    [7, 6, 5, 4, 3, 2, 1, 0, 1, 2],
    [8, 7, 6, 5, 4, 3, 2, 1, 0, 1],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  

  it('should calculate the shortest path between two nodes in a 10x10 graph', () => {
    const path = dijkstra(adjacencyMatrix, '0', '9');
    console.log('Shortest path:', path);
    expect(path).toEqual([['0', '0'], ['9', '9']]);
  });

  it('should return an empty path if no path exists', () => {
    const path = dijkstra(adjacencyMatrix, 'TOKEN1', 'TOKEN11');
    expect(path).toEqual([]);
    console.log('Path:', path); 
  });
});
