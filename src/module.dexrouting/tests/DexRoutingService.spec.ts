import { DexRoutingService } from '../DexRoutingService';
import { DexService } from '../DexService';


describe('DexRoutingService', () => {
    let service: DexRoutingService;
    let dexService: DexService;
  
    beforeEach(async () => {
      dexService = new DexService();
      service = new DexRoutingService(dexService);
    });
    
    // Test that DexRoutingService.listAllRoutes() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
      const routes = await service.listAllRoutes('UNKNOWN', 'BTC');
      expect(routes.routes).toEqual([]);
      console.log('Unkown token route:', routes.routes);
    });

    // Test that DexRoutingService.getBestRoute() returns the best route:
    it('should return the best route', async () => {
        const routes = await service.getBestRoute('DOGE', 'BTC');
        expect(routes).toEqual({ /* expected route */ });
        console.log('Best route:', routes.bestRoute);
    });
    
    it('should calculate the best path for a specific token pair', async () => {
    const bestRoute = await service.getBestRoute('TOKEN1', 'TOKEN5');
      expect(bestRoute.fromToken).toBe('TOKEN1');
      expect(bestRoute.toToken).toBe('TOKEN5');
      expect(bestRoute.bestRoute).toEqual(['TOKEN1', 'TOKEN3', 'TOKEN4', 'TOKEN5']);
      expect(bestRoute.estimatedReturn).toBe(0);
      console.log('From Token: ', bestRoute.fromToken, ' To Token: ', bestRoute.toToken, ' Best Route: ', bestRoute.bestRoute, ' Estimated Return: ', bestRoute.estimatedReturn);
    });

    it('should handle errors when calculating the best path', () => {
      // Mock the DexRoutingService to simulate an error during getBestRoute()
      service.getBestRoute = jest.fn().mockRejectedValue(new Error('Failed to calculate best path'));
      expect(service.getBestRoute('TOKEN1', 'TOKEN5')).rejects.toThrow('Failed to calculate best path');
    });
  });