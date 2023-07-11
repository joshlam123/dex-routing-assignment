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
      // Add more assertions based on the expected results
    });
  
    // Test that DexRoutingController.listAllRoutes() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
        const routes = await controller.listAllRoutes('UNKNOWN', 'BTC');
        expect(routes.routes).toEqual([]);
      });

    // Test that DexRoutingController.getBestRoute() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
        const route = await controller.getBestRoute('UNKNOWN', 'BTC');
        expect(route.bestRoute).toEqual([]);
      });

      it('should return all possible paths between fromToken and toToken', () => {
        const routes = controller.listAllRoutes('TOKEN1', 'TOKEN5');
        expect(routes.fromToken).toBe('TOKEN1');
        expect(routes.toToken).toBe('TOKEN5');
        expect(routes.routes).toHaveLength(3); // Assuming 3 possible routes
        // Additional assertions for the retrieved routes
        expect(routes.routes[0]).toEqual(['TOKEN1', 'TOKEN2', 'TOKEN4', 'TOKEN5']);
        // ... additional assertions for other routes
    });
    
      it('should return an empty array if no paths exist between fromToken and toToken', () => {
        const routes = controller.listAllRoutes('TOKEN3', 'TOKEN6');
        expect(routes.fromToken).toBe('TOKEN3');
        expect(routes.toToken).toBe('TOKEN6');
        expect(routes.routes).toEqual([]);
    });

  });
  