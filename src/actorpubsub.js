/*global
    setTimeout,
    module,
    exports,
    define,
    window
*/

(function(root, factory){
    'use strict';

    // CommonJS
    if (typeof exports === 'object') {
        module.exports = factory();

    // AMD
    } else if (typeof define === 'function' && define.amd) {
        define(factory);

    // Browser
    } else {
        root.PubSub = factory();
    }
}((typeof window === 'object' && window) || this, function() {
    'use strict';

    var copy = function(parent, child) {
        var i,
            toStr = Object.prototype.toString,
            astr = '[object Array]';

        if (typeof parent === 'string' ||
            typeof parent === 'number' ||
            typeof parent === 'boolean') {
            return parent;
        }

        child = child || {};

        for(i in parent) {
            if(parent.hasOwnProperty(i)) {
                if(typeof parent[i] === 'object') {
                    child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
                    copy(parent[i], child[i]);
                } else {
                    child[i] = parent[i];
                }
            }
        }

        return child;
    };

    /*
     * The base class for all behaviors.
     * 
     * @class
     * @constructor
     * @private
     */
    var Observer = function(listener) {
        this.listener = listener;
    };

    Observer.prototype = {
        /*
         * Send a message to this observer.
         * 
         * @method
         * @param {Object} msg
         */
        send: function() {
            var self = this,
                args = Array.prototype.slice.call(arguments, 0),
                throwException = function(ex) {
                    return function reThrowException() {
                        throw ex;
                    };
                };

            setTimeout(function() {
                try {
                    self.listener.apply(self, args);
                } catch(ex) {
                    setTimeout(throwException(ex), 0);
                }
            }, 0);
        }
    };

    var Beh = function(responses) {
        var self = this;

        self.responses = responses;
    };
    Beh.prototype = {
        respond: function(act, stimulus) {
            var self = this;

            if (self.responses[stimulus]) {
                self.responses[stimulus].apply(act, Array.prototype.slice.call(arguments, 2));
            } else if (self.responses['*']) {
                self.responses['*'].apply(act, Array.prototype.slice.call(arguments, 2));
            }
        }
    };

    var SubjectBeh = function(observer, token, next) {
        var self = this;

        self.observer = observer;
        self.token = token;
        self.next = next;

        self.responses = {
            'attach': function(observer, token) {
                var act = this,
                    newSubjectActor;

                newSubjectActor = new Actor(self);
                act._beh = new SubjectBeh(observer, token, newSubjectActor);
            },
            'notify': function(event) {
                self.observer.send(event.name, copy(event.data));
                self.next.send('notify', event);
            },
            'detach': function(token) {
                var act = this;

                if (self.token === token) {
                    act._beh = new BecomeBeh(self.next, self.next);
                    self.next.send('prune', act);
                } else {
                    self.next.send('detach', token);
                }
            },
            'prune': function(prev) {
                var act = this;

                prev.send('become', act, self);
            },
            '*': function() {
                self.next.send.apply(self.next, Array.prototype.slice.call(arguments, 0));
            }
        };
    };
    SubjectBeh.prototype = Object.create(Beh.prototype);

    var BecomeBeh = function(auth, delegate) {
        var self = this;

        self.auth = auth;
        self.delegate = delegate;

        self.responses = {
            'become': function(auth, beh) {
                var act = this;

                if (self.auth === auth) {
                    act._beh = beh;
                } else {
                    delegate.send('become', auth, beh);
                }
            },
            '*': function() {
                delegate.send.apply(delegate, Array.prototype.slice.call(arguments, 0));
            }
        };
    };
    BecomeBeh.prototype = Object.create(Beh.prototype);

    var EmptySubjectBeh = function() {
        var self = this;

        self.token = -1;

        self.responses = {
            'attach': function(observer, token) {
                var act = this,
                    newSubjectActor;

                newSubjectActor = new Actor(self);
                act._beh = new SubjectBeh(observer, token, newSubjectActor);
            },
            'prune': function(prev) {
                var act = this;

                prev.send('become', act, self);
            },
            '*': function() {}
        };
    };
    EmptySubjectBeh.prototype = Object.create(Beh.prototype);


    var Actor = function(responses) {
        var act = this;

        if (responses instanceof Beh) {
            act._beh = responses;
        } else {
            act._beh = new Beh(responses);
        }
    };
    Actor.prototype = Object.create(Observer.prototype);

    Actor.prototype.listener = function() {
        var act = this,
            args = Array.prototype.slice.call(arguments, 0);

        args.unshift(act);

        act._beh.respond.apply(act._beh, args);
    };

    var SubjectActor = function(observer, token, next) {
        var act = this;

        act._beh = new SubjectBeh(observer, token, next);
    };
    SubjectActor.prototype = Object.create(Actor.prototype);



    var PubSub = {
        name: 'ActorPubSub',
        version: '0.1.21'
    };
    var eventRegistry = {},
        lastUid = -1;

    PubSub.subscribe = function(eventName, listener) {
        var observer = new Observer(listener),
            token = (++lastUid).toString();

        if(eventRegistry[eventName]) {
            eventRegistry[eventName].send('attach', observer, token);
        } else {
            eventRegistry[eventName] = new SubjectActor(
                observer, token,
                new Actor(new EmptySubjectBeh()));
        }

        return token;
    };

    PubSub.unsubscribe = function(eventName, token) {
        eventRegistry[eventName].send('detach', token);
    };

    PubSub.publish = function(eventName, data) {
        if (!eventRegistry[eventName]) {
            return false;
        }

        eventRegistry[eventName].send('notify',
            {
                name: eventName,
                data: data
            }
        );
        return true;
    };

    return PubSub;
}));