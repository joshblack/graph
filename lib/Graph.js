var AdjacencyMatrix = require('./AdjacencyMatrix');

/**
 * Constructs a new graph
 * Should construct both representations and choose the best one for you
 *
 * Input formats accepted:
 * given an input array, give a call back that will return true or false and will
 * construct the graph for you
 */
function Graph(nodes, isEdge) {
    this._matrix = new AdjacencyMatrix(nodes, findEdges);
}

var nodes = [1, 2, 3, 4, 5, 6];
var findEdges = function (n1, n2) {
    return n2 / n1 === 2 || n1 / n2 === 2;
}

var am = new AdjacencyMatrix(nodes, findEdges);
am.addNode(7);
am.addNode(8);
am.removeNode(3);
am.addEdge(1, 2);
am.addEdge(1, 4);
am.removeEdge(1, 2);

console.log(am);