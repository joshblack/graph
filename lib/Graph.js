const AdjacencyMatrix = require('./AdjacencyMatrix');
const AdjacencyList = require('./AdjacencyList');

// vertices
// isEdge
// directed
// undirected
// weighted

function Graph(spec) {
    let { vertices } = getVertices(spec),
        { edges } = getEdges(spec),
        { graph } = initialize(vertices, edges);

    return Object.freeze({
        adjacent: g.adjacent,
        neighbors: g.neighbors,
        add: g.add,
        set: g.set,
        remove: g.remove
    });
}

// G = (V, E)
// E = { (u, v), (u, v), (u, v) }
function getVertices(spec) {
    let { vertices, directed, undirected, weighted } = spec;

    if (directed) {
        vertices = parseDirected(directed);
    } else if (undirected) {
        vertices = parseUndirected(undirected);
    } else if (weighted) {
        vertices = parseWeighted(weighted);
    }

    // User wants to create an empty Graph
    vertices = vertices || [];

    return Object.freeze({
        vertices
    });
}

function getEdges() {

}

function parseDirected() {

}

function parseUndirected() {

}

function parseWeighted() {

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