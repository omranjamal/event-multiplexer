
# Event Multiplexer


If you ever had to register or de-register listeners in bulk and resorted to using arrays, sets, maps and dictionaries to achieve it; This library will take that responsibility off your shoulders.

This is useful for example in a game or user generated graphics application (which was the original motivation behind this library).

![Artwork](https://i.imgur.com/gpP5l00.png)

Features:

- Listen on multiple event emitters
- Automatic listening to existing listeners after adding to multiplexer
- Automatic listener removal after removal from multiplexer
- Multiplexer events

  
  

## Installation
If you're here, you already know.

```
npm install --save event-multiplexer
```

or

```
yarn add event-multiplexer
```

## Usage

The `EventMultiplexer` is also itself an implementation of `EventEmitter`
hence any calls to `on`, `off`, `addListener`, `removeListener`

  

The new additions are `add(...objects)` and `remove(...objects)` for adding and removing emitters from the multiplexer.

  
### Initialize
First create the multiplexer.

```js
// Import the `EventMultiplexer` class
import { EventMultiplexer } from  'event-multiplexer';

// Initialize a multiplexer instance.
const  mux  =  new EventMultiplexer();
```

Let's make a few test emitters.

```js
// This is for demo purposes, any emitter or
// child implementation will work.
import { EventEmitter } from 'events';

// Our Test objects.
const  obj_a = new EventEmitter();
obj_a.name = "Apple";

const  obj_b = new EventEmitter();
obj_b.name = "Bose";

const  obj_c  =  new EventEmitter();
obj_c.name = "Cisco";

const  obj_d  =  new EventEmitter();
obj_d.name  =  "Dell";
```

  

### `add(...objects)` to the MUX
Complexity:

- `O(n*m)` where `n = |objects|` and `m = |distinct events being listened to|`

Add the objects to the mux

```js
// You can add objects before you add listeners
mux.add(obj_a);

// This is a listener (lol duh)
// More on this later.
mux.on('EVENT', () => {
	console.log("I like trains.");
});

// ... and add objects after you add listeners.
mux.add(obj_b);

// ... or add multiple wherever
mux.add(obj_b, obj_c, obj_d);
```

  

Don't worry about repeating add operations, it will only listen on the object once.

#### Listen on the MUX
Add listeners on the mux and wait!

```js
mux.on('HELLO', (object, greeting, ...args) => {
	// The first argument to a handler is always the object
	// producing the event.
	console.log(`${object.name} says: ${greeting}`);
});

// We have added the objects to the mux before.
obj_d.emit('HELLO', 'Bonjour');
obj_a.emit('HELLO', 'Salam');
obj_c.emit('HELLO', 'Namaste');
```

The above will produce the output

```
Dell says: Bonjour
Apple says: Salam
Cisco says: Namaste
```


### `remove(...objects)` from the MUX

Complexity:

- `O(n*m)` where `n = |objects|` and `m = |distinct events being listened to|`

  

```js
const  handler  = () => {}
mux.on('EVENT', handler);

// Remove.
mux.off('EVENT', handler);
```

### MUX without the object being passed.
```js
const mux = new EventMultiplexer(false);
mux.on('EVENT', (...args) => {});
```

The first argument to the constructor configures it to pass (on default `true`)
or alternatively not pass (on `false`) the object producing the event to the
event handlers.
  
## Events
The library also exports `OBJECT_ADDED` and `OBJECT_REMOVED` symbols. These can be used to listen for object changes on the multiplexer.

```js
import {
	OBJECT_ADDED,
	OBJECT_REMOVE,
	EventMultiplexer
} from `event-multiplexer`;

const obj_a = {name: "A"};
const obj_b = {name: "B"};

const mux = new EventMultiplexer();

mux.on(OBJECT_ADDED, (object) => {
	console.log(`${object.name} added.`);
});

mux.on(OBJECT_REMOVED, (object) => {
	console.log(`${object.name} removed.`);
});

mux.add(obj_a, obj_b);
mux.remove(obj_a);
```

will produce

```
A added.
B added.
A removed.
```

## Requirements
Any event emitter implementation that had the `on(name, listener)` and `off(name, listener)` methods that work similar to node's implementation should work.

Internally it uses the `EventEmitter` export from the environment provided `events` module. That means you will need so setup your packager to provide that module.

_Webpack provides this by default._


## License
MIT