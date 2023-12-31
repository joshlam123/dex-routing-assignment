/**
 * We 💜 automated tests at CakeDeFi + BirthdayResearch.
 * Any code introducing new behaviour should be accompanied by tests to
 * clearly demonstrate said behaviour and the expectations surrounding it.
 *
 * If you feel like the provided example state in DexService.ts is insufficient
 * to cover all cases, feel free to use your modify it / mock the return value
 * as you see fit!
 *
 * Have fun! 🚀
 */

import { Test, TestingModule } from '@nestjs/testing'
import { DexRoutingController } from './DexRoutingController'
import { DexRoutingModule } from './DexRoutingModule'
import { PoolPair, TokenSymbol } from './DexService';
import { calculateEstimatedReturn } from './DexRoutingService';

let testingModule: TestingModule
let controller: DexRoutingController

beforeAll(async () => {
  testingModule = await Test.createTestingModule({
    imports: [
      DexRoutingModule
    ]
  }).compile()
  console.log('Created testing module');
  controller = testingModule.get<DexRoutingController>(DexRoutingController)
  console.log('Got dex routing controller');
})

afterAll(async () => {
  await testingModule.close()
})

// Helper function to create PoolPair object

describe('/routes', () => {
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
  function createPoolPairFromSymbol(symbol: string, pool_pair_format: boolean = false): PoolPair {
    const [tokenA, tokenB] = symbol.split('-');
    let priceRatio: [number, number];
  
    switch (symbol) {
      case 'ETH-DFI':
        priceRatio = [1, 5];
        break;
      case 'DFI-ETH':
        priceRatio = [5, 1];
        break;
      case 'BTC-DFI':
        priceRatio = [2, 1337];
        break;
      case 'DFI-BTC':
        priceRatio = [1337, 2];
        break;
      case 'DOGE-DFI':
        priceRatio = [18933, 5];
        break;
      case 'DFI-DOGE':
        priceRatio = [5, 18933];
        break;
      case 'DOGE-ETH':
        priceRatio = [18617, 1];
        break;
      case 'ETH-DOGE':
        priceRatio = [1, 18617];
        break;
      case 'BTC-ETH':
        priceRatio = [1, 132];
        break;
      case 'ETH-BTC':
        priceRatio = [132, 1];
        break;
      default:
        throw new Error(`Unknown pool pair symbol: ${symbol}`);
    }
    return {
      symbol,
      tokenA,
      tokenB,
      priceRatio: [priceRatio[0], 1 / priceRatio[1]],
    };
  }
  

  describe('/routes/from/:fromToken/to/:toToken', () => {
    it('should return all routes from DOGE to BTC', async () => {
      const routes = await controller.listAllRoutes('DOGE', 'BTC');
      expect(routes).toBeDefined();
      expect(routes.fromToken).toBe('DOGE');
      expect(routes.toToken).toBe('BTC');

      // Check for specific routes
      const expectedRoutes = [
        [
          {
            symbol: 'DOGE-DFI',
            tokenA: 'DOGE',
            tokenB: 'DFI',
            priceRatio: [ 1, 0.00026408915649923416 ]
          },
          {
            symbol: 'DFI-ETH',
            tokenA: 'DFI',
            tokenB: 'ETH',
            priceRatio: [ 5, 1 ]
          },
          {
            symbol: 'ETH-BTC',
            tokenA: 'ETH',
            tokenB: 'BTC',
            priceRatio: [ 132, 1 ]
          }
        ],
        [
          {
            symbol: 'DOGE-DFI',
            tokenA: 'DOGE',
            tokenB: 'DFI',
            priceRatio: [ 1, 0.00026408915649923416 ]
          },
          {
            symbol: 'DFI-BTC',
            tokenA: 'DFI',
            tokenB: 'BTC',
            priceRatio: [ 668.5, 1 ]
          }
        ],
        [
          {
            symbol: 'DOGE-ETH',
            tokenA: 'DOGE',
            tokenB: 'ETH',
            priceRatio: [ 1, 0.00005371434710211097 ]
          },
          {
            symbol: 'ETH-DFI',
            tokenA: 'ETH',
            tokenB: 'DFI',
            priceRatio: [ 1, 5 ]
          },
          {
            symbol: 'DFI-BTC',
            tokenA: 'DFI',
            tokenB: 'BTC',
            priceRatio: [ 668.5, 1 ]
          }
        ],
        [
          {
            symbol: 'DOGE-ETH',
            tokenA: 'DOGE',
            tokenB: 'ETH',
            priceRatio: [ 1, 0.00005371434710211097 ]
          },
          {
            symbol: 'ETH-BTC',
            tokenA: 'ETH',
            tokenB: 'BTC',
            priceRatio: [ 132, 1 ]
          }
        ]
      ];

      expect(routes).toStrictEqual({
        fromToken: 'DOGE',
        toToken: 'BTC',
        routes: expectedRoutes
      })
    })
  })

  describe('/routes/best/from/:fromToken/to/:toToken', () => {
    it('should return best route from DOGE to BTC', async () => {
      const best_route = await controller.getBestRoute('DOGE', 'BTC');
      expect(best_route).toBeDefined();
      expect(best_route.fromToken).toBe('DOGE');
      expect(best_route.toToken).toBe('BTC');

      const expectedRoutes: PoolPair[] = [
        {
          symbol: 'DOGE-ETH',
          tokenA: 'DOGE',
          tokenB: 'ETH',
          priceRatio: [ 1, 0.00005371434710211097 ]
        },
        {
          symbol: 'ETH-BTC',
          tokenA: 'ETH',
          tokenB: 'BTC',
          priceRatio: [ 132, 1 ]
        }
      ];

      let estimatedReturn = calculateEstimatedReturn(expectedRoutes)

      expect(best_route).toStrictEqual({
        fromToken: 'DOGE',
        toToken: 'BTC',
        bestRoute: expectedRoutes,
        estimatedReturn: estimatedReturn
      })
    })
  })

  // Additional tests...
  describe('getBestRoute', () => {
    it('should return best direct route (DOGE to ETH)', async () => {
      const bestRoute = await controller.getBestRoute('DOGE', 'ETH');
      expect(bestRoute).toStrictEqual({
        fromToken: 'DOGE',
        toToken: 'ETH',
        bestRoute: [
          {
            symbol: 'DOGE-ETH',
            tokenA: 'DOGE',
            tokenB: 'ETH',
            priceRatio: [ 1, 0.00005371434710211097 ]
          }
        ],
        estimatedReturn: 0.00005371434710211097,
      });
    }); 

    it('should return empty best route for unknown tokens (UNKONWN to BTC)', async () => {
      const bestRoute = await controller.getBestRoute('UNKNOWN', 'BTC');
      expect(bestRoute).toStrictEqual({
        fromToken: 'UNKNOWN',
        toToken: 'BTC',
        bestRoute: [],
        estimatedReturn: 0,
      });
    });
    it('should return best route from ETH to BTC', async () => {
      const bestRoute = await controller.getBestRoute('ETH', 'BTC');

      expect(bestRoute).toStrictEqual({
        fromToken: 'ETH',
        toToken: 'BTC',
        bestRoute: [
          {
            symbol: 'ETH-BTC',
            tokenA: 'ETH',
            tokenB: 'BTC',
            priceRatio: [ 132, 1 ]
          }
        ],
        estimatedReturn: 0.007575757575757576,
      });
    });
    it('should return empty best route for same tokens (ETH to ETH)', async () => {
      const bestRoute = await controller.getBestRoute('ETH', 'ETH');
      expect(bestRoute).toEqual({
        fromToken: 'ETH',
        toToken: 'ETH',
        bestRoute: [],
        estimatedReturn: 1,
      });
    });
    it('should return empty best route for tokens without pool pairs (LTC to XRP)', async () => {
      const bestRoute = await controller.getBestRoute('LTC', 'XRP');
      expect(bestRoute).toEqual({
        fromToken: 'LTC',
        toToken: 'XRP',
        bestRoute: [],
        estimatedReturn: 0,
      });
    });
  })

  describe('listAllRoutes', () => {

    it('should return all routes from DOGE to ETH', async () => {
      const routes = await controller.listAllRoutes('DOGE', 'ETH');
      expect(routes).toBeDefined();
      expect(routes.fromToken).toBe('DOGE');
      expect(routes.toToken).toBe('ETH');

      const expectedRoutes = [[
          {
            symbol: 'DOGE-DFI',
            tokenA: 'DOGE',
            tokenB: 'DFI',
            priceRatio: [ 1, 0.00026408915649923416 ]
          },
          {
            symbol: 'DFI-ETH',
            tokenA: 'DFI',
            tokenB: 'ETH',
            priceRatio: [ 5, 1 ]
          }
        ],
        [
          {
            symbol: 'DOGE-DFI',
            tokenA: 'DOGE',
            tokenB: 'DFI',
            priceRatio: [ 1, 0.00026408915649923416 ]
          },
          {
            symbol: 'DFI-BTC',
            tokenA: 'DFI',
            tokenB: 'BTC',
            priceRatio: [ 668.5, 1 ]
          },
          {
            symbol: 'BTC-ETH',
            tokenA: 'BTC',
            tokenB: 'ETH',
            priceRatio: [ 1, 132 ]
          }
        ],
        [
          {
            symbol: 'DOGE-ETH',
            tokenA: 'DOGE',
            tokenB: 'ETH',
            priceRatio: [ 1, 0.00005371434710211097 ]
          }
        ]
      ];

      expect(routes).toStrictEqual({
        fromToken: 'DOGE',
        toToken: 'ETH',
        routes: expectedRoutes
      })
    });

    it('should return empty routes for unknown tokens (UNKNOWN to BTC)', async () => {
      const routes = await controller.listAllRoutes('UNKNOWN', 'BTC');
      expect(routes).toEqual({
        fromToken: 'UNKNOWN',
        toToken: 'BTC',
        routes: [],
      });
    });


    it('should return empty routes for same tokens (ETH to ETH)', async () => {
      const routes = await controller.listAllRoutes('ETH', 'ETH');
      expect(routes).toEqual({
        fromToken: 'ETH',
        toToken: 'ETH',
        routes: [[]],
      });
    });

    it('should return empty routes for tokens without pool pairs (LTC to XRP)', async () => {
      const routes = await controller.listAllRoutes('LTC', 'XRP');
      expect(routes).toEqual({
        fromToken: 'LTC',
        toToken: 'XRP',
        routes: [],
      });
    });
  })
})
