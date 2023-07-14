<h1> Writeup </h1>
<p>
This repository is structured in such a way that:
- The DexRoutingService.ts file contains the core logic for finding all possible routes and the best route between two tokens. It uses the DexService to get the list of pool pairs and then uses various helper functions to find the routes.
- Additional tests are created for dexservice and dexroutingcontroller in src/dexrouting.module/tests
- Additional tests for unknown tokens / other token pairs are written directly into DexRoutingService.ts

<p>
<b> Summary of Approach </b>
Firstly, I added a normalizePriceRatio function in DexService.ts. The reason is because the price ratios were not in [1, X] format and it was causing a bit of problems when computing the expected Return.

To find routes through an arbitrary number of intermediate tokens, I used a depth-first search (DFS) algorithm. This algorithm will start from the fromToken and explore all possible paths through the graph of pool pairs until it reaches the toToken.

In this modified version of the function, the dfs function is defined to perform a depth-first search from the fromToken to the toToken. It keeps track of the current path and adds it to the list of routes when it reaches the toToken. It also keeps track of the tokens it has visited to avoid cycles. After defining the dfs function, it is called with the fromToken and an empty path to start the search.

In it's initial implementationm missing some routes. This was because it only considers direct trades between two tokens (i.e., trades where the fromToken is tokenA and the toToken is tokenB in a pool pair) and not inverted trades (i.e., trades where the fromToken is tokenB and the toToken is tokenA).

<p>
<b> Testing </b>
The file DexRoutingModule.e2e.ts contains end-to-end tests for the DexRoutingController in the DexRoutingModule. Here's a summary of the tests:

<ol>
<li> /routes/from/:fromToken/to/:toToken: This test checks if the listAllRoutes function in the DexRoutingController returns all possible routes from a given token to another. For example, it checks if all routes from DOGE to BTC are returned correctly. </li>
<li> /routes/best/from/:fromToken/to/:toToken: This test checks if the getBestRoute function in the DexRoutingController returns the best route from a given token to another. For example, it checks if the best route from DOGE to BTC is returned correctly. </li>

<li> getBestRoute: This is a suite of tests for the getBestRoute function. It includes tests for: 
    <ul>
    <li>Returning the best direct route (DOGE to ETH) </li>
    <li>Returning an empty best route for unknown tokens (UNKNOWN to BTC) </li>
    <li>Returning the best route (ETH to BTC) </li>
    <li>Returning an empty best route for same tokens (ETH to ETH) </li>
    <li>Returning an empty best route for tokens without pool pairs (LTC to XRP)</li>
 </li>

 <li>listAllRoutes: This is a suite of tests for the listAllRoutes function. It includes tests for:
    <ul>
    <li> Returning all routes from DOGE to ETH  </li>
    <li> Returning empty routes for unknown tokens (UNKNOWN to BTC) </li>
    <li> Returning empty routes for same tokens (ETH to ETH) </li>
    <li> Returning empty routes for tokens without pool pairs (LTC to XRP) </li>
</li>

Each test checks if the returned value from the function is as expected. For example, it checks if the returned routes are correct, if the fromToken and toToken are correct, and if the estimated return is correct. Some tests also check if the function handles edge cases correctly, such as when the fromToken and toToken are the same or when the tokens are unknown.

<p>
<b> Improvements </b>
Here are some improvements I feel can be made to the entire codebase.
<ol>
<li> The code can be modified to handle visited nodes: Modify the DFS algorithm to handle visited nodes to avoid infinite loops and unnecessary computations. Implement a visited node tracking mechanism to mark nodes that have already been visited during the traversal. This will prevent revisiting the same nodes and improve the efficiency of the algorithm. </li>

<li> Early Exit Strategy: Introduce an early exit strategy within the DFS algorithm to stop traversing paths that have a lower estimated return than the current best route. This optimization can be implemented by maintaining a variable to track the highest estimated return found so far. If the estimated return of a path becomes lower than this value, the algorithm can stop exploring that path, as it cannot yield a better result. </li>

<li> Depth Limit: Introduce a depth limit parameter to control the maximum depth of the DFS traversal. This limit can help prevent excessive computation and reduce processing time, especially in scenarios where the token network is large or contains cycles. By setting an appropriate depth limit, the algorithm can prioritize paths within a reasonable depth range and avoid exploring extremely long or cyclic paths that are unlikely to provide significant returns. </li>
</ol>

<b> Observations </b>
<ol>
<li> The Dex router uses a depth-first search (DFS) algorithm to explore all possible routes between tokens. This approach allows for flexibility in finding multiple routes but might result in longer processing times for large token networks.</li>
<li> The Dex router considers the price ratios between token pairs to determine the estimated returns for each route. It normalizes the price ratios to [1, X] format, making it easier to perform calculations and comparisons.</li>
<li> The Dex router supports intermediate token swaps, enabling routes that involve multiple tokens to reach the desired target token. This flexibility allows for efficient token swaps across different pairs and helps users find the most cost-effective routes.</li>
</ol>
