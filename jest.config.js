module.exports = {
  preset: 'ts-jest',
  testRegex: '(e2e|spec).ts$',
  verbose: true,
  clearMocks: true,
  testTimeout: 1000,
  testPathIgnorePatterns: ['src/module.dexrouting/tests/BellmanFord.spec.ts', '/src/module.dexrouting/tests/BellmanFord.spec.ts', '/src/module.dexrouting/tests/Dijkstra.spec.ts', '/src/module.dexrouting/tests/ConvertPoolPairsToEdgeList.spec.ts', '/src/module.dexrouting/tests/ConvertPoolPairsToAdjacencyMatrix.spec'],
}
