/*global
    describe,
    expect,
    it,
    TestHelper
*/
(function(global) {
    'use strict';

    var PubSub = global.PubSub || require('../src/actorpubsub'),
        EXPECTED_VERSION = '0.0.1';

    describe('ActorPubSub', function() {
        it('should report version correctly', function() {
            expect(PubSub.version).to.equal(EXPECTED_VERSION);
        });

        it('should have a method publish', function() {
            expect(PubSub.publish).to.be.a('function');
        });

        describe('#publish()', function() {
            it('should return false if there are no subscribers', function() {
                var message = TestHelper.getUniqueString();
                expect(PubSub.publish(message)).to.equal(false);
            });

            it('should return true if there are subscribers to a message', function() {
                var message = TestHelper.getUniqueString(),
                    func = function() {};

                PubSub.subscribe(message, func);
                expect(PubSub.publish(message)).to.equal(true);
            });

            it('should call all subscribers for a message exactly once', function(done) {
                var message = TestHelper.getUniqueString(),
                    counter1 = 0,
                    counter2 = 0,
                    spy1 = function() {
                        counter1 += 1;
                    },
                    spy2 = function() {
                        counter2 += 1;
                    };

                PubSub.subscribe(message, spy1);
                PubSub.subscribe(message, spy2);

                PubSub.publish(message);

                //TODO: Is there a better method?
                setTimeout(function() {
                    expect(counter1).to.equal(1);
                    expect(counter2).to.equal(1);
                    done();
                }, 1000);
            });

            it('publish method should call ONLY subscribers of the published message', function(done) {
                var message1 = TestHelper.getUniqueString(),
                    message2 = TestHelper.getUniqueString(),
                    counter1 = 0,
                    counter2 = 0,
                    spy1 = function() {
                        counter1 += 1;
                    },
                    spy2 = function() {
                        counter2 += 1;
                    };

                PubSub.subscribe(message2, spy2);
                PubSub.subscribe(message1, spy1);

                PubSub.publish(message1);

                setTimeout(function() {
                    expect(counter1).to.equal(1);
                    expect(counter2).to.equal(0);
                    done();
                }, 1500);
            });

            it('publish method should call subscribers with message as first argument', function(done) {
                var message = TestHelper.getUniqueString(),
                    spy = function(msg) {
                        expect(msg).to.equal(message);
                        done();
                    };

                PubSub.subscribe(message, spy);
                PubSub.publish(message);
            });

            it('publish method should call subscribers with data as second argument', function(done) {
                var message = TestHelper.getUniqueString(),
                    data = TestHelper.getUniqueString(),
                    spy = function(msg, payload) {
                        expect(msg).to.equal(message);
                        expect(payload).to.equal(data);
                        done();
                    };

                PubSub.subscribe(message, spy);
                PubSub.publish(message, data);
            });

            it('publish method should call all subscribers, even if there are exceptions', function(done) {
                var message = TestHelper.getUniqueString(),
                    counter1 = 0,
                    counter2 = 0,
                    func1 = function() {
                        throw new Error('some error');
                    },
                    spy1 = function() {
                        counter1 += 1;
                    },
                    spy2 = function() {
                        counter2 += 1;
                    };

                PubSub.subscribe(message, spy1);
                PubSub.subscribe(message, func1);
                PubSub.subscribe(message, spy2);

                PubSub.publish(message);

                global.onerror = function(e) {
                    setTimeout(function() {
                        expect(e).to.equal('Error: some error');
                        expect(counter1).to.equal(1);
                        expect(counter2).to.equal(1);
                        global.onerror = null;
                        done();
                    }, 100);
                };
            });
        });

        it('should have a method subscribe', function() {
            expect(PubSub.subscribe).to.be.a('function');
        });

        describe('#subscribe()', function() {
            it('should return token as a String', function(){
                var func = function(){},
                    message = TestHelper.getUniqueString(),
                    token = PubSub.subscribe( message , func );

                expect(token).to.be.a('string');
            });

            it('should return new token for several subscriptions with same function', function() {
                var func = function() {},
                    tokens = [],
                    iterations = 10,
                    message = TestHelper.getUniqueString(),
                    i;

                // build an array of tokens
                for (i = 0; i < iterations; i++) {
                    tokens.push(PubSub.subscribe(message, func));
                }
                // make sure all tokens are different
                TestHelper.assertAllTokensDifferent(tokens);
            });

            it('should return unique token for unique functions', function() {
                var tokens = [],
                    iterations = 10,
                    message = TestHelper.getUniqueString(),
                    i;

                function bakeFunc(value) {
                    return function() {
                        return value;
                    };
                }

                // build an array of tokens, passing in a different function for each subscription
                for (i = 0; i < iterations; i++) {
                    tokens.push(PubSub.subscribe(message, bakeFunc(i)));
                }

                // make sure all tokens are different
                TestHelper.assertAllTokensDifferent(tokens);
            });
        });

        it('should have a method unsubscribe', function() {
            expect(PubSub.unsubscribe).to.be.a('function');
        });

        describe('#unsubscribe()', function() {
            /*
            it('should return token when succesful', function() {
                var func = function() {},
                    message = TestHelper.getUniqueString(),
                    token = PubSub.subscribe(message, func),
                    result = PubSub.unsubscribe(token);

                expect(result).to.equal(token);
            });

            it('should return false when unsuccesful', function() {
                var unknownToken = 'my unknown token',
                    result = PubSub.unsubscribe(unknownToken),
                    func = function() {},
                    message = TestHelper.getUniqueString(),
                    token = PubSub.subscribe(message, func);

                // first, let's try a completely unknown token
                expect(result).to.equal(false);

                // now let's try unsubscribing the same method twice
                PubSub.unsubscribe(token);
                expect(PubSub.unsubscribe(token)).to.equal(false);
            });
            */

            it('should unsubscribe a function previously subscribed', function(done) {
                var message = TestHelper.getUniqueString(),
                    counter1 = 0,
                    counter2 = 0,
                    token1,
                    token2,
                    spy1 = function() {
                        counter1 += 1;
                    },
                    spy2 = function() {
                        counter2 += 1;
                    };

                token1 = PubSub.subscribe(message, spy1);
                token2 = PubSub.subscribe(message, spy2);

                PubSub.unsubscribe(message, token1);

                PubSub.publish(message);

                //TODO: Is there a better method?
                setTimeout(function() {
                    expect(counter1).to.equal(0);
                    expect(counter2).to.equal(1);
                    done();
                }, 1000);
            });
        });

        it('should not allow subscribers to change the data passed to them with the events', function(done) {
            var message = TestHelper.getUniqueString(),
                data = {
                    id: 1,
                    name: 'Data String'
                },
                spy = function(msg, payload) {
                    payload.id = 2;
                };

            PubSub.subscribe(message, spy);
            PubSub.publish(message, data);

            setTimeout(function() {
                expect(data.id).to.equal(1);
                expect(data.name).to.equal('Data String');
                done();
            }, 1000)
        });
    });
}(this));