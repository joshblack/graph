const _ = require('lodash');

function AdjacencyMatrix(nodes, isEdge) {
    if (!nodes) {
        throw new Error('No input nodes given');
    }

    if (!isEdge) {
        throw new Error('No relationship function given');
    }

    this._nodes = nodes;
    this._isEdge = isEdge;
    this._matrix = this.initialize(nodes, isEdge);
}

AdjacencyMatrix.prototype.initialize = function initialize(nodes, isEdge) {
    var matrix = [],
        length = nodes.length,
        i,
        j;

    for (i = 0; i < length; i++) {
        matrix[i] = [];

        for (j = 0; j < length; j++) {
            isEdge(nodes[i], nodes[j]) 
                ? matrix[i].push(1) 
                : matrix[i].push(0);
        }
    }

    return matrix;
}

AdjacencyMatrix.prototype.addNode = function addNode(node) {
    this._nodes.push(node);

    var length = this._nodes.length,
        row,
        i;

    this._matrix.push([]);

    // populate row
    for (i = 0; i < length - 1; i++) {
        if (this._isEdge(this._nodes[i], node)) {
            this._matrix[this._matrix.length - 1].push(1)
        } else {
            this._matrix[this._matrix.length - 1].push(0)
        }
    }

    // add entry onto each exiting row
    for (i = 0; i < length; i++) {
        if (this._isEdge(this._nodes[i], node)) {
            this._matrix[i].push(1);
        } else {
            this._matrix[i].push(0);
        }
    }
}

AdjacencyMatrix.prototype.removeNode = function removeNode(node) {
    var index = this._nodes.indexOf(node);
    this._nodes = _.without(this._nodes, this._nodes[index]);
    this._matrix = _.without(this._matrix, this._matrix[index]);

    this._matrix.map(function (n) {
        n.pop();
        return n;
    });
}

AdjacencyMatrix.prototype.addEdge = function addEdge(n1, n2) {
    var index1 = this._nodes.indexOf(n1),
        index2 = this._nodes.indexOf(n2);

    this._matrix[index1][index2] = 1;
    this._matrix[index2][index1] = 1;
}

AdjacencyMatrix.prototype.removeEdge = function removeEdge(n1, n2) {
    var index1 = this._nodes.indexOf(n1),
        index2 = this._nodes.indexOf(n2);

    this._matrix[index1][index2] = 0;
    this._matrix[index2][index1] = 0;
}

AdjacencyMatrix.prototype.findEdge = function findEdge(n1, n2) {
    const first = this._nodes.indexOf(n1),
          second = this._nodes.indexOf(n2);

    return {
        first: this._matrix[first][second],
        second: this._matrix[second][first]
    }
}

module.exports = AdjacencyMatrix;