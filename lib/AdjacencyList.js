const union = require('./util').union;
const comp = require('./util').comp;
const values = require('./util').values;

require('es6-shim');

function AdjacencyList(spec) {
    let { V, E } = spec,
        m = new Map();

    V.forEach(function (v, i) {
        m.set(v, new Set(E[i]));
    });

    return Object.freeze({
        neighbors: neighbors(m),
        add: add(m),
        remove: remove(m),
        vertices: vertices(m)
    });
}

/**
 * Return the neighbors of a vertex
 * @param  {Map} m The map that we are retrieving information from
 * @return {Set}   A Set representing the neighbors of the given vertex
 */
function neighbors(m) {
    return function (v) {
        return m.get(v);
    }
}

/**
 * Add an edge to the vertex of a given Adjacency List
 * @param {Map} m The map that we are using to represent the Adjacency List
 * @return {AdjacencyList} Return the modified Adjacency List
 */
function add(m) {
    return function (v, ...edges) {
        let s = m.get(v),
            e = Array.isArray(edges[0]) ? new Set(edges[0]) : new Set(edges);

        m.set(v, union(s, e));
    }
}

/**
 * Remove an edge or a vertex from the Adjacency List
 * @param  {Map} m The map that we are using to represent the Adjancey List
 * @return {AdjacencyList}   Return the modified Adjacency List
 */
function remove(m) {
    return function (v, ...edges) {
        let s = m.get(v);

        if (!edges.length) {
            m = removeVertex(m, v);
        } else if (Array.isArray(edges[0])) {
            let e = new Set(edges[0]);
            m.set(v, comp(s, e));
        } else {
            s.delete(edges[0]);
            m.set(v, s);
        }
    }
}

function removeVertex(m, v) {
    m.delete(v);

    for (let edges of m.values()) {
        if (edges.has(v)) {
            edges.delete(v);
        }
    }

    return m;
}

function vertices(m) {
    return function () {
        return values(m.keys());
    }
}

module.exports = AdjacencyList;