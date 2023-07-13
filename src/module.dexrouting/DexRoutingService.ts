import { Injectable } from '@nestjs/common';
import { PoolPair, TokenSymbol, DexService } from './DexService';
@Injectable()
export class DexRoutingService {
  private readonly dexService: DexService = new DexService();

  async listAllRoutes(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<AllRoutesResult> {
    const poolPairs = await this.dexService.listPools();

    const routes: PoolPair[][] = [];

    const intermediateTokens = findIntermediateTokens(poolPairs, fromTokenSymbol, toTokenSymbol);

    for (const intermediateToken of intermediateTokens) {
      const intermediateRoutes = findRoutesWithIntermediateToken(
        poolPairs,
        fromTokenSymbol,
        toTokenSymbol,
        intermediateToken
      );
      routes.push(...intermediateRoutes);
    }

    // Find direct routes without intermediate tokens
    const directRoutes = findDirectRoutes(poolPairs, fromTokenSymbol, toTokenSymbol);
    routes.push(...directRoutes);
    
    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      routes,
    };
  }

  async getBestRoute(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<BestRouteResult> {
    const allRoutes = await this.listAllRoutes(fromTokenSymbol, toTokenSymbol);
    const bestRoute = findBestRoute(allRoutes.routes);
    console.log('best route :', bestRoute);
    let estimatedReturn = calculateRouteReturn(bestRoute);
    if (bestRoute.length === 0) {
      if (fromTokenSymbol != toTokenSymbol) {
        estimatedReturn = 0;
      }
    }

    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      bestRoute,
      estimatedReturn: estimatedReturn, // TODO: Calculate the estimated return based on the best route
    }; 
  }
}

export function findRoutesWithIntermediateToken(
  poolPairs: PoolPair[],
  fromToken: TokenSymbol,
  toToken: TokenSymbol,
  intermediateToken: TokenSymbol
): PoolPair[][] {
  const routes: PoolPair[][] = [];
  const intermediatePairs = poolPairs.filter(
    (pair) =>
      (pair.tokenA === intermediateToken && pair.tokenB === fromToken) ||
      (pair.tokenA === fromToken && pair.tokenB === intermediateToken) ||
      (pair.tokenA === intermediateToken && pair.tokenB === toToken) ||
      (pair.tokenA === toToken && pair.tokenB === intermediateToken)
  );

  for (const intermediatePair of intermediatePairs) {
    const startPairs = findDirectRoutes(poolPairs, fromToken, intermediatePair.tokenA);
    const endPairs = findDirectRoutes(poolPairs, intermediatePair.tokenB, toToken);

    for (const startPair of startPairs) {
      for (const endPair of endPairs) {
        const route: PoolPair[] = [];
        route.push(...startPair);
        route.push(intermediatePair);
        route.push(...endPair);
        routes.push(route);
      }
    }
  }

  return routes;
}


export function findDirectRoutes(poolPairs: PoolPair[], fromToken: TokenSymbol, toToken: TokenSymbol): PoolPair[][] {
  const routes: PoolPair[][] = [];
  const directPairs = poolPairs.filter(
    (pair) =>
      (pair.tokenA === fromToken && pair.tokenB === toToken) ||
      (pair.tokenA === toToken && pair.tokenB === fromToken)
  );

  for (const pair of directPairs) {
    const route: PoolPair[] = [];

    // If the pair is in the correct order, add it directly to the route
    if (pair.tokenA === fromToken && pair.tokenB === toToken) {
      route.push(pair);
    }
    // If the pair is in the inverted order, create a new pair with inverted tokens and add it to the route
    else if (pair.tokenA === toToken && pair.tokenB === fromToken) {
      const invertedPair: PoolPair = {
        symbol: `${pair.tokenB}-${pair.tokenA}`,
        tokenA: pair.tokenB,
        tokenB: pair.tokenA,
        priceRatio: [1 / pair.priceRatio[0], 1 / pair.priceRatio[1]]
      };
      route.push(invertedPair);
    }

    routes.push(route);
  }

  return routes;
}

export function findIntermediateTokens(poolPairs: PoolPair[], fromToken: TokenSymbol, toToken: TokenSymbol): TokenSymbol[] {
  const intermediateTokens = new Set<TokenSymbol>();

  for (const pair of poolPairs) {
    if (
      (pair.tokenA === fromToken || pair.tokenB === fromToken) &&
      (pair.tokenA === toToken || pair.tokenB === toToken)
    ) {
      // Found a pool pair that connects the fromToken and toToken directly
      return [];
    }

    if (pair.tokenA === fromToken || pair.tokenB === fromToken) {
      intermediateTokens.add(pair.tokenA === fromToken ? pair.tokenB : pair.tokenA);
    }
  }

  return Array.from(intermediateTokens);
}

export function findBestRoute(routes: PoolPair[][]): PoolPair[] {
  let bestRoute: PoolPair[] = [];

  for (const route of routes) {
    if (calculateRouteReturn(route) > calculateRouteReturn(bestRoute)) {
      bestRoute = route;
    }
  }

  return bestRoute;
}

export function calculateRouteReturn(route: PoolPair[]): number {
  let returnRatio = 1;

  for (const pair of route) {
    const [tokenA, tokenB] = pair.priceRatio;
    returnRatio *= tokenA / tokenB;
  }

  return returnRatio;
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
