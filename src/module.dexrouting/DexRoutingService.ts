import { Injectable } from '@nestjs/common';
import { PoolPair, TokenSymbol, DexService } from './DexService';
@Injectable()
export class DexRoutingService {
  private readonly dexService: DexService = new DexService();

  async listAllRoutes(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<AllRoutesResult> {
    const poolPairs = await this.dexService.listPools();
    const routes = findRoutesWithIntermediateToken(poolPairs, fromTokenSymbol, toTokenSymbol);
  
    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      routes,
    };
  } 

  async getBestRoute(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<BestRouteResult> {
    const routes = await this.listAllRoutes(fromTokenSymbol, toTokenSymbol);
    console.log('From: ', fromTokenSymbol, 'To: ', toTokenSymbol, 'Best Routes: ', routes);
    const estimatedReturns = routes.routes.map((route) => calculateEstimatedReturn(route));

    let bestIndex = 0;
    let bestEstimatedReturn = 0;

    for (let i = 0; i < estimatedReturns.length; i++) {
      if (estimatedReturns[i] > bestEstimatedReturn) {
        bestEstimatedReturn = estimatedReturns[i];
        bestIndex = i;
      }
    }

    let bestRoute = routes.routes[bestIndex];

    if (bestRoute === undefined) {
      if (fromTokenSymbol != toTokenSymbol) {
        bestEstimatedReturn = 0;
        bestRoute = [];
      }
      else {
        bestEstimatedReturn = 1;
        bestRoute = [];
      }
    }
    console.log('Returned best route: ', bestRoute);
    return {
      fromToken: routes.fromToken,
      toToken: routes.toToken,
      bestRoute,
      estimatedReturn: bestEstimatedReturn,
    };
  } 
}

export function calculateEstimatedReturn(route: PoolPair[]): number {
  return route.reduce((total, pair) => {
    const [tokenA, tokenB] = pair.priceRatio;
    // If the trade is made in the same direction as the pool pair, use the price ratio as is
    if (pair.tokenA === pair.symbol.split('-')[0]) {
      return total * (tokenB / tokenA);
    }
    // If the trade is made in the opposite direction, invert the price ratio
    else {
      return total * (tokenA / tokenB);
    }
  }, 1);
}


export function findRoutesWithIntermediateToken(
  poolPairs: PoolPair[],
  fromToken: TokenSymbol,
  toToken: TokenSymbol
): PoolPair[][] {
  const routes: PoolPair[][] = [];
  const visited: Set<TokenSymbol> = new Set();

  function dfs(currentToken: TokenSymbol, path: PoolPair[]): void {
    if (visited.has(currentToken)) {
      return;
    }
    visited.add(currentToken);

    if (currentToken === toToken) {
      routes.push(path);
      visited.delete(currentToken);
      return;
    }

    const nextPairs = poolPairs.filter(
      (pair) =>
        (pair.tokenA === currentToken && !visited.has(pair.tokenB)) ||
        (pair.tokenB === currentToken && !visited.has(pair.tokenA))
    );

    for (const nextPair of nextPairs) {
      const nextToken = nextPair.tokenA === currentToken ? nextPair.tokenB : nextPair.tokenA;
      const nextPath = [...path];

      // If the pair is in the correct order, add it directly to the path
      if (nextPair.tokenA === currentToken && nextPair.tokenB === nextToken) {
        nextPath.push(nextPair);
      }
      // If the pair is in the inverted order, create a new pair with inverted tokens and add it to the path
      else if (nextPair.tokenA === nextToken && nextPair.tokenB === currentToken) {
        const invertedPair: PoolPair = {
          symbol: `${nextPair.tokenB}-${nextPair.tokenA}`,
          tokenA: nextPair.tokenB,
          tokenB: nextPair.tokenA,
          priceRatio: [1 / nextPair.priceRatio[1], 1 / nextPair.priceRatio[0]],
        };
        nextPath.push(invertedPair);
      }

      dfs(nextToken, nextPath);
    }

    visited.delete(currentToken);
  }

  dfs(fromToken, []);

  return routes;
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
