# ActorPubSub [![Build Status](https://travis-ci.org/debjitbis08/actorPubSub.png?branch=master)](https://travis-ci.org/debjitbis08/actorPubSub)

ActorPubSub is a dependency free publish/subscribe library for JavaScript based on the Actor Model. It takes a lot of 
inspiration from [PubSubJS](https://github.com/mroderick/PubSubJS) and uses the ideas from 
[Actors Make Better Observers](http://www.dalnefre.com/wp/2011/05/actors-make-better-observers/) to implement the 
required actors. It can be used as a normal pub/sub library as all the actor logic is hidden away.

A major benefit of this implementation is that observer list updates do not block the notification process.

## Features
* Dependency free.
* Synchronization decoupling.
* Attaching and detaching subscribers is also asynchronous.
* Since observer list updates are asynchronous, notify operations are possible while updates are in progress.
* Data passed to subscribers is a copy of the original data, thus, changes to it by the subscribers does not 
  affect other subscribers and the publisher.

## Examples

### Basic Example

```javascript
var subscriberCb = function (msg, data) {
	console.log(msg, data);
};

var token = PubSub.subscribe('Topic', subscriberCb);

PubSub.publish('Topic', 'ahoy!');
```
### Cancel specific subscription

```javascript
// create a function to receive the topic
var mySubscriber = function( msg, data ){
    console.log( msg, data );
};

// add the function to the list of subscribers to a particular topic
// we're keeping the returned token, in order to be able to unsubscribe
// from the topic later on
var token = PubSub.subscribe( 'MY TOPIC', mySubscriber );

// unsubscribe this subscriber from this topic
PubSub.unsubscribe( token );
```

### Cancel all subscriptions for a function

```javascript
// create a function to receive the topic
var mySubscriber = function( msg, data ){
    console.log( msg, data );
};

// unsubscribe mySubscriber from ALL topics
PubSub.unsubscribe( mySubscriber );
```