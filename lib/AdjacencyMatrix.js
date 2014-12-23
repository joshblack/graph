/**
 * Build an Adjacency Matrix with a given specification object.
 * 
 * This specification object can contain:
 * @param {Array} V The Vertices of the Graph
 * @param {Array} E The Edges of the Graph
 * @param {Function} isEdge A function detailing whether two vertices are an edge
 *
 * @return {Object} Adjacency Matrix Methods
 */
function AdjacencyMatrix(spec) {
    let { V } = spec;
    let M = initialize(spec);

    return Object.freeze({
        vertices: V,
        neighbors: neighbors(V, M)
    });
}

/**
 * Initialize an Adjacency Matrix with either an array of Edges or
 * a relationship function
 * @param  {Object} spec Specification Object
 * @return {Object}      Adjacency Matrix Representation
 */
function initialize(spec) {
    const { V, E, isEdge } = spec;

    return E ? fillEdges(V, E) : findEdges(V, isEdge);
}

/**
 * Construct an Adjacency Matrix from a set of Vertices and Edges
 * @param  {Array} V Vertices
 * @param  {Array} E Edges
 * @return {Array}   Adjacency Matrix Representation
 */
function fillEdges(V, E) {
    const s = V.length;

    // Initialize an n x n matrix and fill with 0's
    let M = Array(s);

    for (let i = 0; i < s; i++) {
        let row = Array(s);

        for (let col = 0; col < s; col++) {
            row[col] = 0;
        }

        M[i] = row;
    }

    return M.map(function (row, i) {
        const edges = E[i];

        edges.forEach(e => row[V.indexOf(e)] = 1);

        return row;
    });
}

/**
 * Construct an Adjacency Matrix from a set of Vertices and a
 * relationshp function
 * @param  {Array}    V      Vertices
 * @param  {Function} isEdge Determines whether two vertices have an edge
 * @return {Array}           Adjacency Matrix Representation
 */
function findEdges(V, isEdge) {
    const s = V.length;

    return V.map(function (v1) {
        let row = [];

        V.forEach(function (v2, col) {
            return isEdge(v1, v2) ? row[col] = 1 : row[col] = 0;
        });

        return row;
    });
}

/**
 * Return the neighbors of a given Vertex
 * @param  {Array}  V Vertices
 * @param  {Array}  M Adjacency Matrix
 * @param  {Vertex} v Vertex
 * @return {Array}    Neighbors of the vertex in the Adjacency Matrix
 */
function neighbors(V, M) {
    return function (v) {
        let row = M[V.indexOf(v)],
            neighbors = [];

        row.forEach(function (e, i) {
            if (e === 1) neighbors.push(i);
        });

        return neighbors.map(e => V[e]);
    }
}

module.exports = AdjacencyMatrix;