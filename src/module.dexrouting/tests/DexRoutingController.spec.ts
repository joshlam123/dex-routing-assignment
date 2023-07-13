import { Test, TestingModule } from '@nestjs/testing';
import { DexRoutingController } from '../DexRoutingController';
import { DexRoutingService, AllRoutesResult, BestRouteResult } from '../DexRoutingService';

describe('DexRoutingController', () => {
  let controller: DexRoutingController;
  let service: DexRoutingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DexRoutingController],
      providers: [DexRoutingService],
    }).compile();

    controller = module.get<DexRoutingController>(DexRoutingController);
    service = module.get<DexRoutingService>(DexRoutingService);
  });

  describe('/routes', () => {
    describe('/routes/from/:fromToken/to/:toToken', () => {
      it('should return empty routes from DOGE to BTC', async () => {
        const routes: AllRoutesResult = {
          fromToken: 'DOGE',
          toToken: 'BTC',
          routes: [],
        };
        jest.spyOn(service, 'listAllRoutes').mockResolvedValue(routes);

        const result = await controller.listAllRoutes('DOGE', 'BTC');
        expect(result).toBe(routes);
      });

      it('should return routes from DOGE to ETH', async () => {
        const routes: AllRoutesResult = {
          fromToken: 'DOGE',
          toToken: 'ETH',
          routes: [
            [
              {
                symbol: 'DOGE-ETH',
                tokenA: 'DOGE',
                tokenB: 'ETH',
                priceRatio: [18617, 1],
              },
            ],
          ],
        };
        jest.spyOn(service, 'listAllRoutes').mockResolvedValue(routes);

        const result = await controller.listAllRoutes('DOGE', 'ETH');
        expect(result).toBe(routes);
      });
    });

    describe('/routes/best/from/:fromToken/to/:toToken', () => {
      it('should return empty best route from DOGE to BTC', async () => {
        const bestRoute: BestRouteResult = {
          fromToken: 'DOGE',
          toToken: 'BTC',
          bestRoute: [],
          estimatedReturn: 0,
        };
        jest.spyOn(service, 'getBestRoute').mockResolvedValue(bestRoute);

        const result = await controller.getBestRoute('DOGE', 'BTC');
        expect(result).toBe(bestRoute);
      });

      it('should return best route from DOGE to ETH', async () => {
        const bestRoute: BestRouteResult = {
          fromToken: 'DOGE',
          toToken: 'ETH',
          bestRoute: [
            {
              symbol: 'DOGE-ETH',
              tokenA: 'DOGE',
              tokenB: 'ETH',
              priceRatio: [18617, 1],
            },
          ],
          estimatedReturn: 0,
        };
        jest.spyOn(service, 'getBestRoute').mockResolvedValue(bestRoute);

        const result = await controller.getBestRoute('DOGE', 'ETH');
        expect(result).toBe(bestRoute);
      });
    });
  });

  // Additional tests...

  it('should call listAllRoutes method of service with correct parameters', async () => {
    const routes: AllRoutesResult = {
      fromToken: 'DOGE',
      toToken: 'BTC',
      routes: [],
    };
    const listAllRoutesSpy = jest.spyOn(service, 'listAllRoutes').mockResolvedValue(routes);

    await controller.listAllRoutes('DOGE', 'BTC');

    expect(listAllRoutesSpy).toHaveBeenCalledWith('DOGE', 'BTC');
  });

  it('should call getBestRoute method of service with correct parameters', async () => {
    const bestRoute: BestRouteResult = {
      fromToken: 'DOGE',
      toToken: 'ETH',
      bestRoute: [
        {
          symbol: 'DOGE-ETH',
          tokenA: 'DOGE',
          tokenB: 'ETH',
          priceRatio: [18617, 1],
        },
      ],
      estimatedReturn: 0,
    };
    const getBestRouteSpy = jest.spyOn(service, 'getBestRoute').mockResolvedValue(bestRoute);

    await controller.getBestRoute('DOGE', 'ETH');

    expect(getBestRouteSpy).toHaveBeenCalledWith('DOGE', 'ETH');
  });
});
