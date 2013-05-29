(function() {
    "use strict";

    var PubSub = function() {};
    var eventRegistry = {};

    PubSub.prototype = {
        subscribe: function(eventName, listener) {
            var observer = new Observer(listener);

            if(eventRegistry[eventName]) {
                eventRegistry[eventName].send({
                    name: "attach",
                    data: {
                        observer: observer
                    }
                });
            } else {
                eventRegistry[eventName] = new SubjectBeh(observer, EmptySubjectBeh);
            }
        },
        unsubscribe: function(eventName, listener) {
            /*
             * TODO: This will not work because we are creating a different
             * observer object than the one used during "on".
             */
            var observer = new Observer(listener);

            eventRegistry[eventName].send({
                name: "detach",
                data: {
                    observer: observer
                }
            });
        },
        publish: function(eventName) {
            eventRegistry[eventName].send({
                name: "notify",
                data: {
                    event: eventName
                }
            });
        }
    };

    var Observer = function(listener) {
        this.listener = listener;
    };

    Observer.prototype = {
        send: function(msg) {
            setTimeout(function() {
                this.listener(msg);
            }, 0);
        }
    };

    var SubjectBeh = function(observer, next) {
        var self = this;

        self.observer = observer;
        self.next = next;

        this.listener = function(msg) {
            switch(msg.name) {
            case "attach":
                newNext = self; //new SubjectBeh(observer, next)
                self = new SubjectBeh(msg.data.observer, newNext);
                break;
            case "notify":
                observer.send(msg.data.event);
                next.send(msg);
                break;
            case "detach":
                if (observer === msg.data.observer) {
                    var next = self.next;
                    self = new BecomeBeh(self.next, self.next);
                    next.send({
                        name: "prune",
                        data: {
                            prev: self
                        }
                    });
                }
                break;
            case "prune":
                msg.data.prev.send({
                    name: "become",
                    data: {
                        auth: self,
                        beh: self //new SubjectBeh(observer, next)
                    }
                });
                break;
            default:
                next.send(msg);
            }
        };
    };

    SubjectBeh.prototype = Observer.prototype;

    var EmptySubjectBeh = new Observer(function(msg) {
        var self = this;

        switch(msg.name) {
        case "attach":
            newNext = self; //new SubjectBeh(observer, next)
            self = new SubjectBeh(msg.data.observer, newNext);
            break;
        case "prune":
            msg.data.prev.send({
                name: "become",
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
            case "become":
                if (msg.data.auth === auth) {
                    self = msg.data.beh;
                }
                break;
            default:
                delegate.send(msg);
            }
        };
    };

    BecomeBeh.prototype = Observer.prototype;

})();