import { Test, TestingModule } from '@nestjs/testing';
import { DexRoutingService, calculateRouteReturn } from '../DexRoutingService';
import { DexService, PoolPair, TokenSymbol } from '../DexService';

describe('DexRoutingService', () => {
  let service: DexRoutingService;
  let dexService: DexService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DexRoutingService,
        {
          provide: DexService,
          useClass: DexService,
        },
      ],
    }).compile();

    service = moduleRef.get<DexRoutingService>(DexRoutingService);
    dexService = moduleRef.get<DexService>(DexService);
  });

  describe('listAllRoutes', () => {
    it('should return empty routes for unknown tokens', async () => {
      const routes = await service.listAllRoutes('UNKNOWN', 'BTC');
      expect(routes).toEqual({
        fromToken: 'UNKNOWN',
        toToken: 'BTC',
        routes: [],
      });
    });

    it('should return direct routes for known tokens', async () => {
      const routes = await service.listAllRoutes('DOGE', 'ETH');
      expect(routes).toEqual({
        fromToken: 'DOGE',
        toToken: 'ETH',
        routes: [[createPoolPair('DOGE', 'ETH', [18617, 1])]],
      });
    });

  });

  describe('getBestRoute', () => {
    it('should return empty best route for unknown tokens', async () => {
      const bestRoute = await service.getBestRoute('UNKNOWN', 'BTC');
      expect(bestRoute).toEqual({
        fromToken: 'UNKNOWN',
        toToken: 'BTC',
        bestRoute: [],
        estimatedReturn: 0,
      });
    });

    it('should return best direct route for known tokens', async () => {
      const bestRoute = await service.getBestRoute('DOGE', 'ETH');
      const expectedReturn = calculateRouteReturn([createPoolPair('DOGE', 'ETH', [18617, 1])]);
      expect(bestRoute).toEqual({
        fromToken: 'DOGE',
        toToken: 'ETH',
        bestRoute: [createPoolPair('DOGE', 'ETH', [18617, 1])],
        estimatedReturn: expectedReturn,
      });
    });

    it('should return best route with higher estimated return', async () => {
      const bestRoute = await service.getBestRoute('ETH', 'BTC');
      const expectedReturn = calculateRouteReturn([createPoolPair('ETH', 'BTC', [1, 132], true)]);
      expect(bestRoute).toEqual({
        fromToken: 'ETH',
        toToken: 'BTC',
        bestRoute: [createPoolPair('ETH', 'BTC', [1, 132], true)],
        estimatedReturn: expectedReturn,
      });
    });
  });

  // Additional tests...

  it('should return empty routes for same tokens', async () => {
    const routes = await service.listAllRoutes('ETH', 'ETH');
    expect(routes).toEqual({
      fromToken: 'ETH',
      toToken: 'ETH',
      routes: [],
    });
  });

  it('should return empty best route for same tokens', async () => {
    const bestRoute = await service.getBestRoute('ETH', 'ETH');
    expect(bestRoute).toEqual({
      fromToken: 'ETH',
      toToken: 'ETH',
      bestRoute: [],
      estimatedReturn: 1,
    });
  });

  it('should return empty routes for tokens without pool pairs', async () => {
    const routes = await service.listAllRoutes('LTC', 'XRP');
    expect(routes).toEqual({
      fromToken: 'LTC',
      toToken: 'XRP',
      routes: [],
    });
  });

  it('should return empty best route for tokens without pool pairs', async () => {
    const bestRoute = await service.getBestRoute('LTC', 'XRP');
    expect(bestRoute).toEqual({
      fromToken: 'LTC',
      toToken: 'XRP',
      bestRoute: [],
      estimatedReturn: 0,
    });
  });

  // Helper function to create PoolPair object
  function createPoolPair(tokenA: TokenSymbol, tokenB: TokenSymbol, priceRatio: [number, number], isInverted: boolean = false): PoolPair {
    const [token1, token2] = [tokenA, tokenB];
    const [price1, price2] = isInverted ? [1 / priceRatio[1], 1 / priceRatio[0]] : priceRatio;
  
    return {
      symbol: `${token1}-${token2}`,
      tokenA: token1,
      tokenB: token2,
      priceRatio: [price1, price2],
    };
  }
  
});