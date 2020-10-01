import { EventEmitter } from 'events';

export const OBJECT_ADDED   = Symbol('OBJECT_ADDED');
export const OBJECT_REMOVED = Symbol('OBJECT_REMOVED');

function handleRemoveListener(ev) {
    if (ev === "removeListener" || ev === "newListener") return;
    if (this.listenerCount(ev) == 0) {
        const l = this._listeners.get(ev);
        for (let obj of this._objects) obj.off(ev, l);
        this._listeners.delete(ev)
    }
}

function onNewListener(ev) { 
    if (ev === "removeListener"||ev === "newListener") return;
    if (this.listenerCount(ev) == 0) {
        const l = createListener(this, ev)
        for (let obj of this._objects) obj.on(ev, l);
        this._listeners.set(ev, l)
    }
}

function createListener(mpx, event) {
    return function listener(...args) {
        mpx.emit(event, this, ...args)
    }
}

export class EventMultiplexer extends EventEmitter {

    _objects = new Set();
    _listeners = new Map();

    constructor() {
        super();
        this.on('removeListener', handleRemoveListener);
        this.on('newListener',    onNewListener);
    }

    has(obj) {
        return this._objects.has(obj)
    }

    values() {
        return this._objects.values()
    }

    add(obj) {
        if (this.has(obj)) return;
        this._objects.add(obj);
        this._listeners.forEach((fn, ev) => obj.on(ev, fn))
        this.emit(OBJECT_ADDED, obj);
    }
    
    remove(obj) {
        if (!this.has(obj)) return;
        this._objects.delete(obj);
        this._listeners.forEach((fn, ev) => obj.off(ev, fn))
        this.emit(OBJECT_REMOVED, obj);
    }

    addMany   (...objs) { objs.map(this.add.bind(this))    }
    removeMany(...objs) { objs.map(this.remove.bind(this)) }
}
