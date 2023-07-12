import { DexRoutingService } from '../DexRoutingService';
import { DexRoutingController } from '../DexRoutingController';
import { DexService } from '../DexService';

describe('DexRoutingController', () => {
    let controller: DexRoutingController;
    let dexRoutingService: DexRoutingService;
  
    beforeEach(async () => {
      dexRoutingService = new DexRoutingService(new DexService());
      controller = new DexRoutingController(dexRoutingService);
    });
  
    // Test that DexRoutingController.listAllRoutes() returns all routes:
    it('should return all routes', async () => {
      const routes = await controller.listAllRoutes('DOGE', 'BTC');
      expect(routes).toBeInstanceOf(Object);
      console.log('All Routes:', routes.routes);
    });
  
    // Test that DexRoutingController.listAllRoutes() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
        const routes = await controller.listAllRoutes('UNKNOWN', 'BTC');
        expect(routes.routes).toEqual([]);
        console.log('Routes:', routes.routes);
      });

    // Test that DexRoutingController.getBestRoute() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
        const routes = await controller.getBestRoute('UNKNOWN', 'BTC');
        expect(routes.bestRoute).toEqual([]);
        console.log('Best Route:', routes.bestRoute);
      });

      it('should return all possible paths between fromToken and toToken', async () => {
        const routes = await controller.listAllRoutes('TOKEN1', 'TOKEN5');
        expect(routes.fromToken).toBe('TOKEN1');
        expect(routes.toToken).toBe('TOKEN5');
        expect(routes.routes).toHaveLength(3); // Assuming 3 possible routes
        // Additional assertions for the retrieved routes
        expect(routes.routes[0]).toEqual(['TOKEN1', 'TOKEN2', 'TOKEN4', 'TOKEN5']);
        console.log('From Token: ', routes.fromToken, ' To Token: ', routes.toToken, ' Routes: ', routes.routes);
    });
    
      it('should return an empty array if no paths exist between fromToken and toToken', async () => {
        const routes = await controller.listAllRoutes('TOKEN3', 'TOKEN6');
        expect(routes.fromToken).toBe('TOKEN3');
        expect(routes.toToken).toBe('TOKEN6');
        expect(routes.routes).toEqual([]);
        console.log('From Token: ', routes.fromToken, ' To Token: ', routes.toToken, ' Routes: ', routes.routes);
    });

  });
  