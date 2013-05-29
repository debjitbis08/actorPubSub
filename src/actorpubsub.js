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
    var eventRegistry = {};

    PubSub.subscribe = function(eventName, listener) {
        var observer = new Observer(listener);

        if(eventRegistry[eventName]) {
            eventRegistry[eventName].send({
                name: 'attach',
                data: {
                    observer: observer
                }
            });
        } else {
            eventRegistry[eventName] = new SubjectBeh(observer, EmptySubjectBeh);
        }
    };

    PubSub.unsubscribe = function(eventName, listener) {
        var observer = new Observer(listener);

        eventRegistry[eventName].send({
            name: 'detach',
            data: {
                observer: observer
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

    var SubjectBeh = function(observer, next) {
        var self = this;

        self.observer = observer;
        self.next = next;

        this.listener = function(msg) {
            var newNext,
                newSelf,
                self = this;

            switch(msg.name) {
            case 'attach':
                newNext = new SubjectBeh(self.observer, self.next);
                newSelf = new SubjectBeh(msg.data.observer, newNext);
                self.observer = newSelf.observer;
                self.next = newSelf.next;
                self.listener = newSelf.listener;
                break;
            case 'notify':
                self.observer.send(msg.event.name, msg.event.data);
                self.next.send(msg);
                break;
            case 'detach':
                if (self.observer.equals(msg.data.observer)) {
                    self = new BecomeBeh(self.next, self.next);
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
                        auth: self,
                        beh: self //new SubjectBeh(observer, next)
                    }
                });
                break;
            default:
                self.next.send(msg);
            }
        };
    };

    SubjectBeh.prototype = Observer.prototype;

    var EmptySubjectBeh = new Observer(function(msg) {
        var self = this,
            newNext;

        switch(msg.name) {
        case 'attach':
            newNext = self; //new SubjectBeh(observer, next)
            self = new SubjectBeh(msg.data.observer, newNext);
            break;
        case 'prune':
            msg.data.prev.send({
                name: 'become',
                data: {
                    auth: self,
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

    BecomeBeh.prototype = Observer.prototype;

    return PubSub;
}));