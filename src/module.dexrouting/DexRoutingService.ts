import { Injectable } from '@nestjs/common';
import { PoolPair, TokenSymbol, DexService } from './DexService';
@Injectable()
export class DexRoutingService {
  private readonly dexService: DexService = new DexService();

  async listAllRoutes(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<AllRoutesResult> {
    const poolPairs = await this.dexService.listPools();
    const routes: PoolPair[][] = [];
    const intermediateTokens = findIntermediateTokens(poolPairs, fromTokenSymbol, toTokenSymbol);
  
    // Find direct routes without intermediate tokens
    const directRoutes = findDirectRoutes(poolPairs, fromTokenSymbol, toTokenSymbol);
    routes.push(...directRoutes);
  
    for (const intermediateToken of intermediateTokens) {
      const intermediateRoutes = findRoutesWithIntermediateToken(
        poolPairs,
        fromTokenSymbol,
        toTokenSymbol,
        intermediateToken
      );
      routes.push(...intermediateRoutes);
    }
  
    return {
      fromToken: fromTokenSymbol,
      toToken: toTokenSymbol,
      routes,
    };
  }  
  
  
  async getBestRoute(fromTokenSymbol: TokenSymbol, toTokenSymbol: TokenSymbol): Promise<BestRouteResult> {
    const routes = await this.listAllRoutes(fromTokenSymbol, toTokenSymbol);
    console.log('From: ', fromTokenSymbol, 'To: ', toTokenSymbol, 'Best Routes: ', routes);
    const estimatedReturns = routes.routes.map((route) => calculateRouteReturn(route));

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
  
    return {
      fromToken: routes.fromToken,
      toToken: routes.toToken,
      bestRoute,
      estimatedReturn: bestEstimatedReturn,
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

        // If the intermediate pair is in the correct order, add it directly to the route
        if (
          intermediatePair.tokenA === intermediateToken &&
          intermediatePair.tokenB === fromToken
        ) {
          route.push(...startPair);
          route.push(intermediatePair);
          route.push(...endPair);
        }
        // If the intermediate pair is in the inverted order, create a new pair with inverted tokens and add it to the route
        else if (
          intermediatePair.tokenA === fromToken &&
          intermediatePair.tokenB === intermediateToken
        ) {
          const invertedIntermediatePair: PoolPair = {
            symbol: `${intermediatePair.tokenB}-${intermediatePair.tokenA}`,
            tokenA: intermediatePair.tokenB,
            tokenB: intermediatePair.tokenA,
            priceRatio: [1 / intermediatePair.priceRatio[0], 1 / intermediatePair.priceRatio[1]],
          };
          route.push(...startPair);
          route.push(invertedIntermediatePair);
          route.push(...endPair);
        }
        // If the intermediate pair is in the correct order with respect to the destination token, add it to the route
        else if (
          intermediatePair.tokenA === intermediateToken &&
          intermediatePair.tokenB === toToken
        ) {
          route.push(...startPair);
          route.push(intermediatePair);
          route.push(...endPair);
        }
        // If the intermediate pair is in the inverted order with respect to the destination token, create a new pair with inverted tokens and add it to the route
        else if (
          intermediatePair.tokenA === toToken &&
          intermediatePair.tokenB === intermediateToken
        ) {
          const invertedIntermediatePair: PoolPair = {
            symbol: `${intermediatePair.tokenB}-${intermediatePair.tokenA}`,
            tokenA: intermediatePair.tokenB,
            tokenB: intermediatePair.tokenA,
            priceRatio: [1 / intermediatePair.priceRatio[1], 1 / intermediatePair.priceRatio[0]],
          };
          route.push(...startPair);
          route.push(invertedIntermediatePair);
          route.push(...endPair);
        }

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
        priceRatio: [1 / pair.priceRatio[1], 1 / pair.priceRatio[0]],
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
