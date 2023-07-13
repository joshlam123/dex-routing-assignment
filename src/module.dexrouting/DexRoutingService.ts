import { Injectable } from '@nestjs/common'
import { DexService, PoolPair, TokenSymbol } from './DexService'

export type EdgeList = Edge[];
export type AdjacencyMatrix = number[][];
type Edge = [TokenSymbol, TokenSymbol, number];
type Path = TokenSymbol[];

@Injectable()
export class DexRoutingService {
  // TODO: make use of DexService to retrieve the poolPairs state
  //       and implement the following features
  constructor(private readonly dexService: DexService) {}

  async listAllRoutes (fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<AllRoutesResult> {
    // Get the pool pairs from the DexService
    const poolPairs = await this.dexService.listPools();

    // Convert the pool pairs to an adjacency matrix
    const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix(poolPairs);
    

    // Implement Dijkstra's algorithm to find all possible paths
    const paths = dijkstra(adjacencyMatrix, fromTokenSymbol, toTokenSymbol);
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
    const edgeList = convertPoolPairsToEdgeList(poolPairs);

    // Convert the pool pairs to an adjacency matrix
    const adjacencyMatrix = convertPoolPairsToAdjacencyMatrix(poolPairs);

    // Implement Bellman-Ford's algorithm to find the best path
    const path = bellmanFord(edgeList, fromTokenSymbol, toTokenSymbol);

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

}

export function convertPoolPairsToAdjacencyMatrix(poolPairs: PoolPair[]): number[][] {
  const tokens: string[] = [];

  // Collect unique tokens
  poolPairs.forEach((pair) => {
    if (!tokens.includes(pair.tokenA)) {
      tokens.push(pair.tokenA);
    }
    if (!tokens.includes(pair.tokenB)) {
      tokens.push(pair.tokenB);
    }
  });

  const adjacencyMatrix: number[][] = [];

  // Initialize the adjacency matrix with zeros
  for (let i = 0; i < tokens.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < tokens.length; j++) {
      row.push(0);
    }
    adjacencyMatrix.push(row);
  }

  // Populate the adjacency matrix with the price ratios
  poolPairs.forEach((pair) => {
    const { tokenA, tokenB, priceRatio } = pair;
    const indexA = tokens.indexOf(tokenA);
    const indexB = tokens.indexOf(tokenB);
    adjacencyMatrix[indexA][indexB] = priceRatio[1] / priceRatio[0];
  });

  return adjacencyMatrix;
}

export function convertPoolPairsToEdgeList(poolPairs: PoolPair[]): EdgeList {
  return poolPairs.map(({ tokenA, tokenB, priceRatio }) => [tokenA, tokenB, priceRatio[1] / priceRatio[0]]);
}


export function dijkstra(adjacencyMatrix: AdjacencyMatrix, startNode: string, endNode: string): Path[] {
  const distances: { [key: string]: number } = {};
  const visited: { [key: string]: boolean } = {};
  const previousNodes: { [key: string]: string | null } = {};

  // Initialize distances
  for (const node in adjacencyMatrix) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  while (true) {
    let currentNode: string | null = null;
    let shortestDistance: number = Infinity;

    // Find the node with the shortest distance
    for (const node in adjacencyMatrix) {
      if (!visited[node] && distances[node] < shortestDistance) {
        currentNode = node;
        shortestDistance = distances[node];
      }
    }

    if (currentNode === null) {
      // No reachable nodes remaining
      break;
    }

    visited[currentNode] = true;

    // Update distances and previous nodes for the neighbors of the current node
    for (const neighbor in adjacencyMatrix[currentNode]) {
      const weight = adjacencyMatrix[currentNode][neighbor];
      const distance = distances[currentNode] + weight;

      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previousNodes[neighbor] = currentNode;
      }
    }
  }

  // Build the path from endNode to startNode
  const path: Path[] = [];
  let currentNode: string | null = endNode;
  while (currentNode !== null) {
    const distance = distances[currentNode];
    if (distance !== undefined) {
      path.unshift([currentNode, distance.toString()]);
      currentNode = previousNodes[currentNode];
    } else {
      break;
    }
  }
  

  return path;
}



export function bellmanFord(edgeList: EdgeList, startNode: TokenSymbol, endNode: TokenSymbol): Path {
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
