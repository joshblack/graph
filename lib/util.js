require('es6-shim');

/**
 * Union two Sets
 * @param  {Set} s1 First Set
 * @param  {Set} s2 Second Set
 * @return {Set}    Union of the two sets
 */
function union(s1, s2) {
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

/**
 * Find the complement of two Sets
 * @param  {Set} s1 The first Set
 * @param  {Set} s2 The second Set
 * @return {Set}    The complement of the two Sets
 */
function comp(s1, s2) {
    let s = new Set();

    s1.forEach(function (e) {
        if (!s2.has(e)) {
            s.add(e);
        } else {
            s2.delete(e);
        }
    });

    s2.forEach(function (e) {
        if (!s1.has(e)) {
            s.add(e);
        }
    });

    return s;
}

function values(s) {
    let values = [];

    for (let v of s) { 
        values.push(v) 
    };

    return values;
}

exports.union = union;
exports.comp = comp;
exports.values = values;