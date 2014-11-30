# Graph

Currently in development, writing up desired API in here and implementing it as fast as I can.

Supported features:
- [ ] Graph Representations
    - [ ] Adjacency List
    - [ ] Adjacency Matrix
- [ ] Graph Operations
    - [ ] Constructor
        - [ ] vertices
        - [ ] isEdge
        - [ ] directed
        - [ ] undirected
        - [ ] weighted
    - [ ] `adjacent`
    - [ ] `neighbors`
    - [ ] `add`
    - [ ] `set`
    - [ ] `remove`

## Introduction

In computer science, a graph is an abstract data type that is meant to implement the graph and directed graph concepts from mathematics.

A graph data structure consists of a finite (and possibly mutable) set of nodes or vertices, together with a set of ordered pairs of these nodes (or, in some cases, a set of unordered pairs). These pairs are known as edges or arcs. As in mathematics, an edge (x,y) is said to point or go from x to y. The nodes may be part of the graph structure, or may be external entities represented by integer indices or references.

A graph data structure may also associate to each edge some edge value, such as a symbolic label or a numeric attribute (cost, capacity, length, etc.).

Different data structures for the representation of graphs are used in practice:

- Adjacency list
    - Vertices are stored as records or objects, and every vertex stores a list of adjacent vertices. This data structure allows the storage of additional data on the vertices. Additional data can be stored if edges are also stored as objects, in which case each vertex stores its incident edges and each edge stores its incident vertices.
- Adjacency matrix 
    - A two-dimensional matrix, in which the rows represent source vertices and columns represent destination vertices. Data on edges and vertices must be stored externally. Only the cost for one edge can be stored between each pair of vertices.

Performance of the two representations:

|                   | Adjacency List   | Adjacency Matrix         |
|-------------------|------------------|--------------------------|
| Storage           | O(\|V\| + \|E\|) | O(\|V\|<sup>2</sup>)     |
| Add vertex        | O(1)             | O(\|V\|<sup>2</sup>)     |
| Add edge          | O(1)             | O(1)                     |
| Remove vertex     | O(\|E\|)         | O(\|V\|<sup>2</sup>)     |
| Remove edge       | O(\|E\|)         | O(1)                     |
| `(u,v)` adjacent? | O(\|V\|)         | O(1)                     |

Adjacency lists are generally preferred because they efficiently represent sparse graphs. An adjacency matrix is preferred if the graph is dense or if one must be able to quickly look up if there is an edge connecting two vertices.

### Sparse vs. Dense Graphs

> A sparse graph is a graph G = (V, E) in which |E| = O(|V|).

> A dense graph is a graph G = (V, E) in which |E| = O(|V|<sup>2</sup>).

## Algorithms

Algorithms

The core algorithm patterns are:

- Breadth First Search
- Depth First Search
- Uniform Cost Search

By themselves, the algorithm patterns do not compute any meaningful quantities over graphs; they are merely building blocks for constructing graph algorithms. The graph algorithms in the BGL currently include

- Dijkstra's Shortest Paths
- Bellman-Ford Shortest Paths
- Johnson's All-Pairs Shortest Paths
- Kruskal's Minimum Spanning Tree
- Prim's Minimum Spanning Tree
- Connected Components
- Strongly Connected Components
- Dynamic Connected Components (using Disjoint Sets)
- Topological Sort
- Transpose
- Reverse Cuthill Mckee Ordering
- Smallest Last Vertex Ordering
- Sequential Vertex Coloring

# Usage

## Graph Construction

```javascript
// Initialize a Graph with a specification object, or with nothing
let g = Graph();
let g = Graph(spec);

// This specification object can have the following keys:
let spec = {
    // You can let the Graph deal with constructing your graph for you
    vertices: ['a', 'b', 'c', 'd'],

    // Just provide a function that determines whether there is an edge
    // between two vertices
    isEdge: function () { /* ... */ },

    // Build a Directed Graph by passing in an array of arrays with 
    // length of 2
    directed: [['a', 'b'], ['b', 'c'], ['c', 'a']],

    // Build an Undirected Graph by passing in an array of arrays of any size
    undirected: [['a', 'b', 'c'], ['b', 'd']],

    // Pass in a number to the end of directed or undirected Graphs
    weighted: [['a', '-b', 3], ['b', '-c', 1]]
}
```

## Methods

The basic operations provided include:

```javascript
let spec = {
    undirected: [['a', 'b', 'c'], ['b', 'd']]
};

let g = new Graph(spec);

// tests whether there is an edge from node x to node y.
g.adjacent('a', 'b'); //=> true
g.adjacent('a', 'd'); //=> false

// lists all nodes y such that there is an edge from x to y.
g.neighbors('a'); //=> ['b', 'c']
g.neighbors('b'); //=> ['d']

// adds the edge from x to y, if it is not there.
g.add('a', 'd', /* weight */);

// adds the edge from x to y, if it is not there.
g.delete('a', 'c');

// returns the value associated with the node a.
g.get('a');

// set the value associated with the node a.
g.set('a');

// returns the value associated to the edge (a, b).
g.get('a', 'b');

// sets the value associated to the edge (a, b) to value.
g.set('a', 'b', value);

```

# Tests

To run the tests, use an ES6 compiler for mocha

`mocha --compilers js:mocha-traceur test/*.js`

# Guidelines this project uses to try out what Crockford does in **JavaScript: The Better Parts** talks

- Don't use new
- Don't use Object.create
- Don't use this
- Don't use null
- Don't use falsy values
- Class-free OOP