import { EventEmitter } from 'events';

export const OBJECT_ADDED = Symbol('OBJECT_ADDED');
export const OBJECT_REMOVED = Symbol('OBJECT_REMOVED');

export class EventMultiplexer extends EventEmitter {
    _listening_on = new Map();
    _listener_map = new Map();
    _pass_objs = true;

    constructor(pass_objs = true) {
        super();

        this._pass_objs = pass_objs;

        this.on('removeListener', (ev_name, listener) => {
            const listener_set = this._listening_on.get(ev_name);
            listener_set.delete(listener);

            if (listener_set.size === 0) {
                for (const obj of this._listener_map.keys()) {
                    obj.off(ev_name, this._listener_map.get(obj).get(ev_name));
                    this._listener_map.get(obj).delete(ev_name);
                }

                this._listening_on.delete(ev_name);
            }
        });

        this.on('newListener', (ev_name, listener) => {
            if (ev_name === 'removeListener' || ev_name === 'newListener') {
                return;
            }

            if (!this._listening_on.has(ev_name)) {
                this._listening_on.set(ev_name, new Set());

                for (const obj of this._listener_map.keys()) {
                    let listener = null;

                    if (this._pass_objs) {
                        listener = (...args) => {
                            this.emit(ev_name, obj, ...args);
                        };
                    } else {
                        listener = (...args) => {
                            this.emit(ev_name, obj, ...args);
                        };
                    }

                    obj.on(ev_name, listener);
                    this._listener_map.get(obj).set(ev_name, listener);
                }
            }

            this._listening_on.get(ev_name).add(listener);
        });
    }

    add(...objs) {
        objs.forEach(obj => {
            if (!this._listener_map.has(obj)) {
                const ev_map = new Map();
                this._listener_map.set(obj, ev_map);

                for (const ev_name of this._listening_on.keys()) {
                    const listener = (...args) => {
                        this.emit(ev_name, obj, ...args);
                    };

                    obj.on(ev_name, listener);
                    ev_map.set(ev_name, listener);
                }

                this.emit(OBJECT_ADDED, obj);
            }
        });
    }

    remove(...objs) {
        objs.forEach(obj => {
            if (!this._listener_map.has(obj)) {
                return;
            }

            const ev_map = this._listener_map.get(obj);

            for (const ev_name of ev_map.keys()) {
                obj.off(ev_name, ev_map.get(ev_name));
            }

            this._listener_map.delete(obj);
            this.emit(OBJECT_REMOVED, obj);
        });
    }
}
