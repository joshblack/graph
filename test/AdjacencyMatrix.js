const assert = require('assert');
const AdjacencyMatrix = require('../lib/AdjacencyMatrix');

describe('AdjacencyMatrix', function () {
    describe('#vertices', function() {
        it('should return the vertices of the matrix', function() {
            const M = AdjacencyMatrix({
                V: [1, 2, 3],
                E: [[2], [1, 3], [2]]
            });

            assert.deepEqual(M.vertices, [1, 2, 3]);
        });
    });

    describe('#neighbors', function() {
        it('should return the neighbors of a given vertex', function() {
            const M = AdjacencyMatrix({
                V: [1, 2, 3],
                E: [[2], [1, 3], [2]]
            });

            assert.deepEqual(M.neighbors(2), [1, 3]);
        })
    })
});

// let am = new AdjacencyMatrix({
//     V: [1, 2, 3],
//     E: [[2], [1, 3], [2]],
//     isEdge: function (start, end) {
//         if (start === 1 && end === 2) {
//             return true;
//         } else if (start === 2) {
//             if (end === 1) return true;
//             if (end === 3) return true;
//         } else if (start === 3 && end === 2) {
//             return true;
//         }

//         return false;
//     }
// });