const assert = require('assert');
const Graph = require('../lib/Graph');

describe('Graph', function () {
    describe('#initialize', function () {
        it('should throw an error when no nodes are provided', function () {
            assert.throws(
                function () {
                    return new Graph();
                },
                Error,
                'No nodes provided'
            );
        });

        it('should use the appropriate data structure for the given data set', function () {

        });

        describe('#type', function () {
            it('should determine whether the Graph is dense or sparse', function () {

            });
        });
    });
});