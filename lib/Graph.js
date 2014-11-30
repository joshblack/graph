const AdjacencyMatrix = require('./AdjacencyMatrix');
const AdjacencyList = require('./AdjacencyList');

function Graph(spec) {
    let { vertices } = getVertices(spec);
        // { edges } = getEdges(spec),
        // { graph } = initialize(vertices, edges);

        console.log(vertices);

    // return Object.freeze({
    //     adjacent: graph.adjacent,
    //     neighbors: graph.neighbors,
    //     add: graph.add,
    //     set: graph.set,
    //     remove: graph.remove
    // });
}

// G = (V, E)
// E = { (u, v), (u, v), (u, v) }
function getVertices(spec) {
    let { vertices, directed, undirected, weighted } = spec;

    if (directed) {
        vertices = parseInput(directed);
    } else if (undirected) {
        vertices = parseInput(undirected);
    } else if (weighted) {
        vertices = parseInput(weighted.map(function (e) { return e.slice(0, -1); }));
    }

    // User wants to create an empty Graph
    vertices = vertices || [];

    return Object.freeze({
        vertices
    });
}

function getEdges() {

}

function parseInput(input) {
    let vertices = [];

    input.forEach(function (edge) {
        edge.forEach(function (v) {
            if (vertices.indexOf(v) === -1) vertices.push(v);
        });
    });

    return vertices;
}

/**
 * Initialize a Graph with a given set of Vertices and Edges
 * @param  {Array} V Set of Vertices for the Graph
 * @param  {Array} E Set of Edges for the Graph
 * @return Returns an appropriate representation for G = (V, E)
 */
function initialize(V, E) {

}

module.exports = Graph;