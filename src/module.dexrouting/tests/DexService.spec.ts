import { DexService } from "../DexService";
import { Test } from "@nestjs/testing";
import { TestingModule } from "@nestjs/testing";


describe('DexService', () => {
    let service: DexService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [DexService],
      }).compile();
  
      service = module.get<DexService>(DexService);
    });

    it('should return all pool pairs', async () => {
      const pools = await service.listPools();
      expect(pools).toBeInstanceOf(Array);
      // Add more assertions based on the expected results
    });

    // Test that DexService.getPool() returns null for an unknown pool pair:
    it('should return null for an unknown pool pair', async () => {
        const pool = await service.getPool('UNKNOWN');
        expect(pool).toBeNull();
      });

    // 
    it('should fetch a list of pool pairs', async () => {
        const poolPairs = await service.listPools();
        expect(poolPairs).toHaveLength(10); // Assuming 10 pool pairs are fetched
        // Additional assertions for the retrieved pool pairs
        expect(poolPairs[0].symbol).toBe('POOL1');
        expect(poolPairs[0].tokenA).toBe('TOKEN1');
        expect(poolPairs[0].tokenB).toBe('TOKEN2');
        expect(poolPairs[0].priceRatio).toBe(0.5);
        // ... additional assertions for other pool pairs
      });
    
      it('should handle errors when fetching pool pairs', async () => {
        // Mock the DexService to simulate an error during fetchPools()
        DexService.fetchPools = jest.fn().mockRejectedValue(new Error('Failed to fetch pool pairs'));
        
        await expect(DexService.listPools()).rejects.toThrow('Failed to fetch pool pairs');
      });

    // Test that DexService.getPool() returns the correct pool pair:
    it('should return the correct pool pair', async () => {
        const pool = await service.getPool('DOGE-BTC');
        expect(pool).toEqual({ /* expected pool pair */ });
      });
  
  });
  