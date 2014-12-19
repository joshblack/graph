const assert = require('assert');
const AdjacencyList = require('../lib/AdjacencyList');

describe('AdjacencyList', function () {
    describe('#neighbors', function() {
        it('should take in a vertex and return its edges', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2, 3], [1, 3], [1, 2]]
            });

            assert.deepEqual(l.neighbors(1), new Set([2, 3]));
            assert.deepEqual(l.neighbors(2), new Set([1, 3]));
            assert.deepEqual(l.neighbors(3), new Set([1, 2]));
        })
    });

    describe('#add', function() {
        it('should add an edge to a vertex', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2], [1, 3], [1, 2]]
            });

            l.add(1, 3);

            assert.deepEqual(l.neighbors(1), new Set([2, 3]));
        })

        it('should add edges to a vertex', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[], [], [1, 2]]
            });

            l.add(1, 2, 3);
            l.add(2, [1, 3]);

            assert.deepEqual(l.neighbors(1), new Set([2, 3]));
            assert.deepEqual(l.neighbors(2), new Set([1, 3]));
        })
    });

    describe('#vertices', function() {
        it('should return a list of all the vertices in the list', function (){
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2, 3], [1, 3], [1, 2]]
            });

            assert.deepEqual(l.vertices(), [1, 2, 3]);
        });
    });

    describe('#remove', function() {
        it('should remove a vertex from the AdjacencyList', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2, 3], [1, 3], [1, 2]]
            });

            l.remove(1);

            assert.deepEqual(l.vertices(), [2, 3]);

            let neighbors = [];
            for (let neighbor of l.neighbors(2)) {
                neighbors.push(neighbor);
            }

            assert.deepEqual(neighbors, [3]);
        });

        it('should remove an edge from a vertex', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2, 3], [1, 3], [1, 2]]
            });

            l.remove(1, 2);

            let neighbors = [];
            for (let neighbor of l.neighbors(1)) {
                neighbors.push(neighbor);
            }

            assert.deepEqual(neighbors, [3]); 
        });

        it('should remove edges from a vertex', function() {
            const l = AdjacencyList({
                V: [1, 2, 3],
                E: [[2, 3], [1, 3], [1, 2]]
            });

            l.remove (1, [2, 3]);

            let neighbors = [];
            for (let neighbor of l.neighbors(1)) {
                neighbors.push(neighbor);
            }

            assert.deepEqual(neighbors, []);
        });
    });
});