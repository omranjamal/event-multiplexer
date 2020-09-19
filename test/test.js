const assert = require('assert');
const decoration = require('../dist');

const EventEmitter = require('events').EventEmitter;
const EM = require("../dist").EventMultiplexer;

class Emitter extends EventEmitter {
    name = null;

    constructor(name) {
        super();
        this.name = name;
    }
}


describe("EventMultiplexer: Multiplexes events.", () => {
    it("Should listen on all added objects past and present.", () => {
        const em = new EM();
        const a = new Emitter('a');
        const b = new Emitter('b');
        const c = new Emitter('c');

        em.add(a);

        let checking = null;
        let checking_na = '';
        let checking_nb = '';
        let called = 0;

        em.on('EVENT', (obj) => {
            assert.strictEqual(checking, obj);
            called++;
        });

        em.on('EVENT', (obj, na) => {
            assert.strictEqual(checking_na, na);
            called++;
        });

        em.on('EVENT', (obj, na, nb) => {
            assert.strictEqual(checking_nb, nb);
            called++;
        });

        em.addMany(b, c);

        checking = a;
        checking_na = 'X';
        checking_nb = 'Y';
        a.emit('EVENT', 'X', 'Y');
        assert.strictEqual(called, 3);


        checking = b;
        checking_na = 'XF';
        checking_nb = 'YF';
        b.emit('EVENT', 'XF', 'YF');
        assert.strictEqual(called, 6);


        checking = c;
        checking_na = 'XFI';
        checking_nb = 'YFI';
        c.emit('EVENT', 'XFI', 'YFI');
        assert.strictEqual(called, 9);
    });

    it("should not trigger after removal", () => {
        const em = new EM();
        const a = new Emitter('a');
        const b = new Emitter('b');
        const c = new Emitter('c');

        em.addMany(a);
        let called = 0;

        em.on('EVENT', (obj) => {
            called++;
        });

        em.on('EVENT', (obj, na) => {
            called++;
        });

        em.on('EVENT', (obj, na, nb) => {
            called++;
        });

        em.addMany(b, c);

        a.emit('EVENT', 'X', 'Y');
        assert.strictEqual(called, 3);

        em.remove(c);

        c.emit('EVENT', 'XF', 'YF');
        assert.strictEqual(called, 3);

        b.emit('EVENT', 'XF', 'YF');
        assert.strictEqual(called, 6);

        em.remove(b);
        b.emit('EVENT');
        assert.strictEqual(called, 6);

    });

    it("Should add a single listen irrespective of multiple listeners on mux", () => {
        const em = new EM();
        const a = new Emitter('a');
        const b = new Emitter('b');

        let x = null;

        em.addMany(a, b);
        assert.strictEqual(a.listenerCount('EVENT') + b.listenerCount('EVENT'), 0);

        em.on('EVENT', () => { x=true; });
        assert.strictEqual(a.listenerCount('EVENT') + b.listenerCount('EVENT'), 2);

        em.on('EVENT', () => { x=false; });
        assert.strictEqual(a.listenerCount('EVENT') + b.listenerCount('EVENT'), 2);
    });

    it("Should remove mux listeners after removal.", () => {
        const em = new EM();
        const a = new Emitter('a');
        const b = new Emitter('b');

        let x = null;

        em.addMany(a,b);

        em.on('EVENT', () => { x=true; });
        assert.strictEqual(a.listenerCount('EVENT') + b.listenerCount('EVENT'), 2);

        em.remove(b);
        assert.strictEqual(a.listenerCount('EVENT') + b.listenerCount('EVENT'), 1);
    });

    it("Should remove listener from all after all listener removed", () => {
        const em = new EM();
        const a = new Emitter('a');
        const b = new Emitter('b');

        let x = null;

        const han = () => {x=false};
        const ham = () => {x=true};

        em.add(a);

        em.on('EVENT_A', ham);
        em.on('EVENT_B', han);
        em.on('EVENT_B', ham);

        em.add(b);

        assert.strictEqual(a.listenerCount('EVENT_A') + b.listenerCount('EVENT_A'), 2);
        assert.strictEqual(a.listenerCount('EVENT_B') + b.listenerCount('EVENT_B'), 2);

        em.off('EVENT_B', ham);
        assert.strictEqual(a.listenerCount('EVENT_B') + b.listenerCount('EVENT_B'), 2);

        em.off('EVENT_B', han);
        // assert.strictEqual(a.listenerCount('EVENT_B') + b.listenerCount('EVENT_B'), 0);
    });
});
