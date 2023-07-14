<h1> Writeup </h1>
<p>
This repository is structured in such a way that:
- The DexRoutingService.ts file contains the core logic for finding all possible routes and the best route between two tokens. It uses the DexService to get the list of pool pairs and then uses various helper functions to find the routes.
- Additional tests are created for dexservice and dexroutingcontroller in src/dexrouting.module/tests
- Additional tests for unknown tokens / other token pairs are written directly into DexRoutingService.ts

<p>
<b> Summary of Approach </b>
To find routes through an arbitrary number of intermediate tokens, I used a depth-first search (DFS) algorithm. This algorithm will start from the fromToken and explore all possible paths through the graph of pool pairs until it reaches the toToken.

In this modified version of the function, the dfs function is defined to perform a depth-first search from the fromToken to the toToken. It keeps track of the current path and adds it to the list of routes when it reaches the toToken. It also keeps track of the tokens it has visited to avoid cycles. After defining the dfs function, it is called with the fromToken and an empty path to start the search.

<p>
<b> Improvements </b>
Please note that this is a recursive solution and could potentially be quite slow if there are a lot of tokens and pool pairs.

<b> Observations </b>
