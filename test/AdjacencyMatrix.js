const assert = require('assert');
const AdjacencyMatrix = require('../lib/AdjacencyMatrix');

describe('AdjacencyMatrix', function () {
    describe('#initialize', function () {
        it('should throw an error when no nodes are provided', function () {
            assert.throws(
                function () {
                    return new AdjacencyMatrix();
                },
                Error,
                'No nodes provided'
            );
        });
    });
});