import { dijkstra, AdjacencyMatrix } from '../DexRoutingService';

describe('Dijkstra', () => {
  const adjacencyMatrix: AdjacencyMatrix = {
    TOKEN1: { TOKEN2: 0.5, TOKEN3: 2.0, TOKEN4: 0 },
    TOKEN2: { TOKEN1: 0, TOKEN3: 4.0, TOKEN4: 0 },
    TOKEN3: { TOKEN1: 0, TOKEN2: 0, TOKEN4: 3.0 },
    TOKEN4: { TOKEN1: 0, TOKEN2: 0, TOKEN3: 0 },
  };

  it('should calculate the shortest path between two nodes', () => {
    const path = dijkstra(adjacencyMatrix, 'TOKEN1', 'TOKEN4');
    expect(path).toEqual(['TOKEN1', 'TOKEN3', 'TOKEN4']);
    console.log('Shortest path:', path);
  });

  it('should return an empty path if no path exists', () => {
    const path = dijkstra(adjacencyMatrix, 'TOKEN4', 'TOKEN1');
    expect(path).toEqual([]);
    console.log('Path:', path);
  });
});
