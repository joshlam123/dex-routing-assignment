import { dijkstra } from '../DexRoutingService';

describe('dijkstra', () => {
    const adjacencyMatrix = [
        [0, 1, 4, 0],
        [0, 0, 2, 0],
        [0, 0, 0, 3],
        [0, 0, 0, 0],
      ];
    
      it('should calculate the shortest path between two nodes', () => {
        const path = dijkstra(adjacencyMatrix, 0, 3);
        expect(path).toEqual([0, 1, 2, 3]);
      });
    
      it('should return an empty path if no path exists', () => {
        const path = dijkstra(adjacencyMatrix, 3, 0);
        expect(path).toEqual([]);
      });
  });
