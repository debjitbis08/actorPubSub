# ActorPubSub [![Build Status](https://travis-ci.org/debjitbis08/actorPubSub.png?branch=master)](https://travis-ci.org/debjitbis08/actorPubSub)

ActorPubSub is a dependency free publish/subscribe library for JavaScript based on the Actor Model. It takes a lot of 
inspiration from [PubSubJS](https://github.com/mroderick/PubSubJS) and uses the ideas from 
[Actors Make Better Observers](http://www.dalnefre.com/wp/2011/05/actors-make-better-observers/) to implement the 
required actors. It can be used as a normal pub/sub library as all the actor logic is hidden away.

## Features
* Dependency free
* Synchronization decoupling
* Attaching and detaching subscribers is also asynchronous
* Data passed to subscribers is a copy of the original data, thus, changes to it by the subscribers does not 
  affect other subscribers and the publisher.
