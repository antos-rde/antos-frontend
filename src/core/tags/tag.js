/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Ant.OS.GUI.tag = {};
Ant.OS.GUI.zindex = 10;
Ant.OS.GUI.BaseTag = class BaseTag {
    constructor(root,  observable) {
        this.root = root;
        this.observable = observable;
        this.opts = {};
        if (!this.observable) { this.observable = new Ant.OS.API.Announcer(); }
        // export to rootnode
        this.root.observable = this.observable;
        this.root.set = (k, v) => this.set(k, v);
        this.root.get = k => this.get(k);
        this.root.aid = () => this.aid();
        this.root.calibrate = () => this.calibrate();
        this.root.sync = d => this.sync(d);
        this.mounted = false;
        this.root.setup = () => this.setup();
        this.refs = {};
        this.setopt("data-id", (Math.floor(Math.random() * 100000) + 1).toString());
        this.setopt("tooltip", undefined);
        //$(@root).attr "data-id", @get("data-id")
        this.children = $(this.root).children();

        for (let obj of Array.from(this.layout())) {
            const dom = this.mkui(obj);
            if (dom) {
                $(dom).appendTo(this.root);
            }
        }
        if (this.refs.yield) {
            for (let v of Array.from(this.children)) { $(v).detach().appendTo(this.refs.yield); }
        } else {
            this.children = [];
        }
        $(this.root).children().each((i, e) => e.mkui(this.observable));
    }

    __(k, v) {
            if (v) { this.set(k, v); }
            return this.get(k);
        }

    __tooltip__(v) {
        if (!v) { return; }
        return $(this.root).attr("tooltip", v);
    }

    setopt(name, val) {
        let value = val;
        if ($(this.root).attr(name)) {
            const v = $(this.root).attr(name);
            try {
                value = JSON.parse(v);
            } catch (e) {
                value = v;
            }
        }
        return this.set(name, value);
    }
    
    set(opt, value, flag) {
        if (opt === "*") {
            for (let k in value) { const v = value[k]; this.set(k, v); }
        } else {
            if (this[`__${opt}`] && !flag) { this[`__${opt}`](value); }
            this.opts[opt] = value;
            if (this[`__${opt}__`] && !flag) { this[`__${opt}__`](value); }
        }
        return this;
    }
    
    aid() {
        return this.get("data-id");
    }
    
    calibrate() {}

    update() {}
    
    get(opt) {
        if (opt === "*") { return this.opts; }
        return this.opts[opt];
    }

    sync(d) {
        this.update(d);
        $(this.root).children().each(function() { return this.update(d); });
        return this.root;
    }

    setup() {
        if (this.mounted) { return; }
        this.mounted = true;
        this.mount();
        $(this.root).children().each(function() { return this.mount(); });
        return this.root;
    }

    mount() {}

    layout() {
        return [];
    }
        // should be defined by subclasses

    mkui(tag) {
        if (!tag) { return undefined; }
        const dom = $(`<${tag.el}>`);
        if (tag.class) { $(dom).addClass(tag.class); }
        if (tag.id) { $(dom).attr("data-id", tag.id); }
        if (tag.height) { $(dom).attr("data-height", tag.height); }
        if (tag.width) { $(dom).attr("data-width", tag.width); }
        if (tag.tooltip) { $(dom).attr("tooltip", tag.tooltip); }
        if (tag.children) {
            for (let v of Array.from(tag.children)) { $(this.mkui(v)).appendTo(dom); }
        }
        if (tag.ref) {
            this.refs[tag.ref] = dom[0];
        }
        // dom.mount @observable
        return dom[0]; //.uify(@observable)
    }
};

Element.prototype.mkui = function(observable) {
    const tag = this.tagName.toLowerCase();
    if (RegExp("afx-*", "i" ).test(tag) && Ant.OS.GUI.tag[tag]) {
        const o = new (Ant.OS.GUI.tag[tag])(this, observable);
        return o.root;
    } else {
        $(this).children().each(function() {
            return this.mkui(observable);
        });
    }
    return this;
};


Element.prototype.mount = function() {
    if (this.setup) { return this.setup(); }
    $(this).children().each(function() { return this.mount(); });
    return this;
};

Element.prototype.update = function(d) {
    if (this.sync) { return this.sync(d); }
    $(this).children().each(function() { return this.update(d); });
    return this;
};

Element.prototype.uify = function(observable) {
    this.mkui(observable);
    return this.mount();
};

Ant.OS.GUI.define = (name, cls) => Ant.OS.GUI.tag[name] = cls;

