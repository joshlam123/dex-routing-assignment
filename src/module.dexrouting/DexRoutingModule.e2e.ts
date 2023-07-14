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
import { calculateRouteReturn } from './DexRoutingService';

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
    const [price1, price2] = isInverted ? [1 / priceRatio[1], 1 / priceRatio[0]] : priceRatio;
    return { symbol: `${tokenA}-${tokenB}`, tokenA, tokenB, priceRatio };
  }

  describe('/routes/from/:fromToken/to/:toToken', () => {
    it('should return all routes from DOGE to BTC', async () => {
      const expectedRoutes = [
      [createPoolPair('DOGE', 'DFI', [18933, 5]),
      createPoolPair('BTC', 'DFI', [2, 1337])],
      [
        createPoolPair('DOGE', 'ETH', [18617, 1]),
        createPoolPair('ETH', 'BTC', [1, 132], true),
      ],
      [
        createPoolPair('DOGE', 'ETH', [18617, 1]),
        createPoolPair('ETH', 'DFI', [1, 5]),
        createPoolPair('BTC', 'DFI', [2, 1337], true),
      ],
    ];
      const routes = await controller.listAllRoutes('DOGE', 'BTC')
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
      expect(best_route).toStrictEqual({
        fromToken: 'DOGE',
        toToken: 'BTC',
        bestRoute: controller.getBestRoute('DOGE', 'BTC'), // TODO
        estimatedReturn: calculateRouteReturn([
          createPoolPair('DOGE', 'DFI', [18933, 5]),
          createPoolPair('BTC', 'DFI', [2, 1337]),
        ])
      })
    })
  })
})
