import { Injectable } from '@nestjs/common'
import { DexService, PoolPair, TokenSymbol } from './DexService'

type Edge = [TokenSymbol, TokenSymbol, number];
type EdgeList = Edge[];
type Path = TokenSymbol[];
type AdjacencyMatrix = Record<TokenSymbol, Record<TokenSymbol, number>>;

@Injectable()
export class DexRoutingService {
  // TODO: make use of DexService to retrieve the poolPairs state
  //       and implement the following features
  constructor(private readonly dexService: DexService) {}

  async listAllRoutes (fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<AllRoutesResult> {
    // Get the pool pairs from the DexService
    const poolPairs = await this.dexService.listPools();

    // Convert the pool pairs to an adjacency matrix
    const adjacencyMatrix = this.convertPoolPairsToAdjacencyMatrix(poolPairs);
    

    // Implement Dijkstra's algorithm to find all possible paths
    const paths = this.dijkstra(adjacencyMatrix, fromTokenSymbol, toTokenSymbol);
    const routes: PoolPair[][] = paths.map((path) =>
      path.map((token, index) => {
        const nextToken = path[index + 1];
        const priceRatio: [number, number] = [adjacencyMatrix[token][nextToken], 1 / adjacencyMatrix[token][nextToken]];
        return { symbol: '', tokenA: token, tokenB: nextToken, priceRatio };
      })
    );

    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      routes: routes // TODO
    }
  }

  async getBestRoute (fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<BestRouteResult> {
    const poolPairs = await this.dexService.listPools();

    // Convert the pool pairs to an edge list
    const edgeList = this.convertPoolPairsToEdgeList(poolPairs);

    // Convert the pool pairs to an adjacency matrix
    const adjacencyMatrix = this.convertPoolPairsToAdjacencyMatrix(poolPairs);

    // Implement Bellman-Ford's algorithm to find the best path
    const path = this.bellmanFord(edgeList, fromTokenSymbol, toTokenSymbol);

    const bestRoute: PoolPair[] = path.map((token, index) => {
      const nextToken = path[index + 1];
      const priceRatio: [number, number] = [adjacencyMatrix[token][nextToken], 1 / adjacencyMatrix[token][nextToken]];
      return { symbol: '', tokenA: token, tokenB: nextToken, priceRatio };
    });

    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      bestRoute: bestRoute, // TODO
      estimatedReturn: 0
    }
  }

  private convertPoolPairsToAdjacencyMatrix(poolPairs: PoolPair[]): AdjacencyMatrix {
    const matrix: AdjacencyMatrix = {};
    poolPairs.forEach(({ tokenA, tokenB, priceRatio }) => {
      if (!matrix[tokenA]) matrix[tokenA] = {};
      if (!matrix[tokenB]) matrix[tokenB] = {};
      matrix[tokenA][tokenB] = Number(priceRatio);
      matrix[tokenA][tokenB] = 1 / Number(priceRatio);
    });
    return matrix;
  }

  private convertPoolPairsToEdgeList(poolPairs: PoolPair[]): EdgeList {
    // Assuming poolPairs is an array of objects with properties 'from', 'to', and 'priceRatio'
    // And assuming that the tokens are represented by numbers
    const edges: EdgeList = [];
    poolPairs.forEach(({ tokenA, tokenB, priceRatio }) => {
      const edge: Edge = [tokenA, tokenB, Number(priceRatio)];
      edges.push(edge);
    });
    return edges;
  }

  private dijkstra(adjacencyMatrix: AdjacencyMatrix, startNode: TokenSymbol, endNode: TokenSymbol): Path[] {
    const distances: Record<TokenSymbol, number> = {};
    const previous: Record<TokenSymbol, TokenSymbol | null> = {};

    // Initialize distances and previous nodes
    Object.keys(adjacencyMatrix).forEach((node) => {
      distances[node] = node === startNode ? 0 : Infinity;
      previous[node] = null;
    });  

    const unvisitedNodes = new Set(Object.keys(adjacencyMatrix));

    while (unvisitedNodes.size > 0) {
      let currentNode: TokenSymbol | null = null;
      let minDistance = Infinity;

      unvisitedNodes.forEach((node) => {
        if (distances[node] < minDistance) {
          currentNode = node;
          minDistance = distances[node];
        }
      });

      if (!currentNode) {
        break;
      }

      unvisitedNodes.delete(currentNode);

      Object.entries(adjacencyMatrix[currentNode]).forEach(([neighbor, weight]) => {
        const distance = distances[currentNode!] + weight;
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          previous[neighbor] = currentNode;
        }
      });
    }

    const paths: Path[] = [];
    Object.keys(previous).forEach((node) => {
      if (previous[node]) {
        const path: Path = [];
        let current: TokenSymbol | null = node;
        while (current !== null) {
          path.unshift(current);
          current = previous[current];
        }
        paths.push(path);
      }
    });
    return paths;
  }

  private bellmanFord(edgeList: EdgeList, startNode: TokenSymbol, endNode: TokenSymbol): Path {
    const distances: Record<TokenSymbol, number> = {};
    const previous: Record<TokenSymbol, TokenSymbol | null> = {};

    // Initialize distances and previous nodes
    Object.keys(edgeList).forEach((node) => {
      distances[node] = Infinity;
      previous[node] = null;
    });

    distances[startNode] = 0;

    // Relax edges repeatedly
    for (let i = 0; i < Object.keys(edgeList).length - 1; i++) {
      edgeList.forEach(([from, to, weight]) => {
        if (distances[from] + weight < distances[to]) {
          distances[to] = distances[from] + weight;
          previous[to] = from;
        }
      });
    }

    // Check for negative cycles
    let hasNegativeCycle = false;
    edgeList.forEach(([from, to, weight]) => {
      if (distances[from] + weight < distances[to]) {
        hasNegativeCycle = true;
      }
    });

    if (hasNegativeCycle) {
      // Handle negative cycle case
      return [];
    } else {
      // Build the best path
      const path: Path = [];
      let current: TokenSymbol | null = endNode;
      while (current !== null) {
        path.unshift(current);
        current = previous[current];
      }
      return path;
    }
  }
}

export interface AllRoutesResult {
  fromToken: TokenSymbol
  toToken: TokenSymbol
  routes: PoolPair[][]
}

export interface BestRouteResult {
  fromToken: TokenSymbol
  toToken: TokenSymbol
  bestRoute: PoolPair[]
  estimatedReturn: number
}
