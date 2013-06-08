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
    send: function(msg) {
        var self = this,
            args = Array.prototype.slice(arguments, 0),
            throwException = function(ex) {
                return function reThrowException() {
                    throw ex;
                };
            };

        setTimeout(function() {
            try {
                self.listener.apply(null, args);
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
    respond: function(stimulus) {
        self.responses[stimulus].apply(this, Array.prototype.slice(arguments, 1));
    }
};

var SubjectBeh = new Beh({
    'attach': funtion() {
        newNext = new SubjectBeh(self.observer, self.token, self.next);
        newSelf = new SubjectBeh(msg.data.observer, msg.data.token, newNext);
        self.observer = newSelf.observer;
        self.next = newSelf.next;
        self.listener = newSelf.listener;
        break;
    }
});

var Actor = function(responses) {
    var act = this;

    act._beh = new Beh(responses);
    act.addr = new Observer(function(msg) {
        act._beh.respond.apply(act, Array.prototype.slice(arguments, 0));
    });
};

var createActor = function(beh) {
    var act = new Actor(beh);
    return act.addr;
}

var SubjectAct = function(observer, token) {
    var self = this;

    self.observer = observer;
    self.next = next;
    self.token = token;

    super({
        'attach': funtion(observer, token) {
            var self = this,
                nextAct,
                newNeh;

            nextAct = createActor(self._beh);
            newBeh = new SubjectBeh(observer, token);
            self._beh = newBeh;
            break;
        }
    });
};
SubjectAct.prototype = Object.create(Actor.prototype);