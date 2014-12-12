require('es6-collections');

function AdjacencyList(spec) {
    let { V, E } = spec,
        m = new Map();

    V.forEach(function (v, i) {
        m.set(v, new Set(E[i]));
    });

    return Object.freeze({
        neighbors: neighbors(m),
        add: add(m),
        remove: remove(m)
    });
}

/**
 * Return the neighbors of a vertex in a given Map
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
            e = new Set(edges);

        m.set(v, merge(s, e));

        return this;
    }
}

/**
 * Remove an edge or a vertice from the Adjacency List
 * @param  {Map} m The map that we are using to represent the Adjancey List
 * @return {AdjacencyList}   Return the modified Adjacency List
 */
function remove(m) {
    return function (...args) {
        let v = args.shift(),
            s = m.get(v);

        if (!args.length) {
            // Remove the vertex from the map and every set that it exists in
            m.delete(v);

            m.forEach(function (e) {
                if (e.has(v)) e.delete(v);
            });
        }

        args.filter(function (e) { return !s.delete(e) });

        return this;
    }
}

/**
 * Merge two Sets
 * @param  {Set} s1 First Set
 * @param  {Set} s2 Second Set
 * @return {Set}    Merge of the two sets
 */
function merge(s1, s2) {
    let s = new Set();

    s1.forEach(function (e) {
        if (s2.has(e)) { 
            s2.delete(e);
        }

        s.add(e) 
    });

    s2.forEach(function (e) { s.add(e) });

    return s;
}

const al = AdjacencyList({
    V: [1, 2, 3],
    E: [[2, 3], [1, 3], [1, 2]]
});

// al.neighbors(1).values();

// console.log(al.neighbors(1).values());
// al.add(1, 3);
// al.add(1, 4, 5, 6, 7);
// console.log(al.neighbors(1).values());

// al.remove(1);
// al.remove(1, 2);
// al.remove(1, 2, 3);
// console.log(al.neighbors(1).values());


module.exports = AdjacencyList;