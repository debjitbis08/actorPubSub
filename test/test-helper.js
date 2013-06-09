/*global
exports,
module,
assert,
define,
window
*/
(function(root, factory) {
    'use strict';

    // CommonJS
    if (typeof exports === 'object') {
        module.exports = factory();

        // AMD
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
        // Browser
    } else {
        root.TestHelper = factory();
    }
}((typeof window === 'object' && window) || this, function() {

    'use strict';

    var TestHelper = {};

    // helps us make sure that the order of the tests have no impact on their success

    function getUniqueString() {
        if (getUniqueString.uid === undefined) {
            getUniqueString.uid = 0;
        }
        getUniqueString.uid++;

        return 'my unique String number ' + getUniqueString.uid.toString();
    }

    // makes sure that all tokens in the passed array are different

    function assertAllTokensDifferent(tokens) {
        var length = tokens.length,
            j, k;

        expect(tokens).to.have.length.above(0);

        // compare all tokens
        for (j = 0; j < length; j++) {
            for (k = j + 1; k < length; k++) {
                expect(tokens[j]).to.not.equal(tokens[k]);
            }
        }

        // make sure we actually tested something
        expect(j).to.equal(length);
        expect(k).to.equal(length);
    }

    TestHelper.getUniqueString = getUniqueString;
    TestHelper.assertAllTokensDifferent = assertAllTokensDifferent;

    return TestHelper;
}));