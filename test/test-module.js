/*global
    describe,
    expect,
    it
*/
(function(global) {
    'use strict';

    var PubSub = global.PubSub || require('../src/actorpubsub'),
        EXPECTED_VERSION = '0.0.1';

    describe('PubSub module', function() {
        it('should report version correctly', function() {
            expect(PubSub.version).to.equal(EXPECTED_VERSION);
        });
    });
}(this));