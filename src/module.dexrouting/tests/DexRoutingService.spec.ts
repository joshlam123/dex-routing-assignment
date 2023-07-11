import { DexRoutingService } from '../DexRoutingService';
import { DexService } from '../DexService';


describe('DexRoutingService', () => {
    let service: DexRoutingService;
    let dexService: DexService;
  
    beforeEach(async () => {
      dexService = new DexService();
      service = new DexRoutingService(dexService);
    });
  
    // Test that DexRoutingService.listAllRoutes() returns all routes:
    it('should return all routes', async () => {
        const routes = await service.listAllRoutes('DOGE', 'BTC');
        expect(routes).toEqual({ /* expected routes */ });
      });
    
    // Test that DexRoutingService.listAllRoutes() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
    const routes = await service.listAllRoutes('UNKNOWN', 'BTC');
    expect(routes.routes).toEqual([]);
    });

    // Test that DexRoutingService.getBestRoute() returns the best route:
    it('should return the best route', async () => {
        const route = await service.getBestRoute('DOGE', 'BTC');
        expect(route).toEqual({ /* expected route */ });
      });
    
    // Test that DexRoutingService.getBestRoute() returns an empty array for an unknown token:
    it('should return an empty array for an unknown token', async () => {
        const route = await service.getBestRoute('UNKNOWN', 'BTC');
        expect(route.bestRoute).toEqual([]);
      });

    it('should calculate the best path for a specific token pair', () => {
    const bestRoute = service.getBestRoute('TOKEN1', 'TOKEN5');
    expect(bestRoute.fromToken).toBe('TOKEN1');
    expect(bestRoute.toToken).toBe('TOKEN5');
    expect(bestRoute.bestRoute).toEqual(['TOKEN1', 'TOKEN3', 'TOKEN4', 'TOKEN5']);
    expect(bestRoute.estimatedReturn).toBe(0);
    });

    it('should handle errors when calculating the best path', () => {
    // Mock the DexRoutingService to simulate an error during getBestRoute()
    service.getBestRoute = jest.fn().mockRejectedValue(new Error('Failed to calculate best path'));

    expect(service.getBestRoute('TOKEN1', 'TOKEN5')).rejects.toThrow('Failed to calculate best path');
    });
  });