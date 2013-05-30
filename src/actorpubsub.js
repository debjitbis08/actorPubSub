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

    var PubSub = {
        name: 'ActorPubSub',
        version: '0.0.1'
    };
    var eventRegistry = {},
        lastUid = -1;

    PubSub.subscribe = function(eventName, listener) {
        var observer = new Observer(listener),
            token = (++lastUid).toString();

        if(eventRegistry[eventName]) {
            eventRegistry[eventName].send({
                name: 'attach',
                data: {
                    observer: observer,
                    token: token
                }
            });
        } else {
            eventRegistry[eventName] = new SubjectBeh(observer, token, EmptySubjectBeh);
        }
    };

    PubSub.unsubscribe = function(eventName, token) {
        eventRegistry[eventName].send({
            name: 'detach',
            data: {
                token: token
            }
        });
    };

    PubSub.publish = function(eventName, data) {
        if (!eventRegistry[eventName]) {
            return false;
        }

        eventRegistry[eventName].send({
            name: 'notify',
            event: {
                name: eventName,
                data: data
            }
        });
        return true;
    };

    var Observer = function(listener) {
        this.listener = listener;
    };

    Observer.prototype = {
        send: function(msg, data) {
            var self = this,
                throwException = function(ex) {
                    return function reThrowException() {
                        throw ex;
                    };
                };

            setTimeout(function() {
                try {
                    self.listener(msg, data);
                } catch(ex) {
                    setTimeout(throwException(ex), 0);
                }
            }, 0);
        },
        equals: function(observer) {
            return observer.listener === this.listener;
        }
    };

    var SubjectBeh = function(observer, token, next) {
        var self = this;

        self.observer = observer;
        self.next = next;
        self.token = token;
    };

    SubjectBeh.prototype = Object.create(Observer.prototype);
    SubjectBeh.prototype.listener = function(msg) {
        var newNext,
            newSelf,
            self = this;

        switch(msg.name) {
        case 'attach':
            newNext = new SubjectBeh(self.observer, self.token, self.next);
            newSelf = new SubjectBeh(msg.data.observer, msg.data.token, newNext);
            self.observer = newSelf.observer;
            self.next = newSelf.next;
            self.listener = newSelf.listener;
            break;
        case 'notify':
            self.observer.send(msg.event.name, msg.event.data);
            self.next.send(msg);
            break;
        case 'detach':
            if (self.token === msg.data.token) {
                self = new BecomeBeh(self.next.token, self.next);
                self.next.send({
                    name: 'prune',
                    data: {
                        prev: self
                    }
                });
            } else {
                self.next.send(msg);
            }
            break;
        case 'prune':
            msg.data.prev.send({
                name: 'become',
                data: {
                    auth: self.token,
                    beh: self //new SubjectBeh(observer, next)
                }
            });
            break;
        default:
            self.next.send(msg);
        }
    };

    var EmptySubjectBeh = new Observer(function(msg) {
        var self = this,
            newNext;

        switch(msg.name) {
        case 'attach':
            newNext = self; //new SubjectBeh(observer, next)
            self = new SubjectBeh(msg.data.observer, msg.data.token, newNext);
            break;
        case 'prune':
            msg.data.prev.send({
                name: 'become',
                data: {
                    auth: self.token,
                    beh: self
                }
            });
        }
    });

    var BecomeBeh = function(auth, delegate) {
        var self = this;

        self.listener = function(msg) {
            switch(msg) {
            case 'become':
                if (auth.equals(msg.data.auth)) {
                    self = msg.data.beh;
                } else {
                    delegate.send(msg);
                }
                break;
            default:
                delegate.send(msg);
            }
        };
    };

    BecomeBeh.prototype = Object.create(Observer.prototype);

    return PubSub;
}));