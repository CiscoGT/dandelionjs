const { parse } = require("node-html-parser");

class Component {
    constructor (contentString) {
        let dom = parse(contentString, {
            style: true,
            script: true
        });

        let script = dom.querySelector("script");
        let html = dom.querySelector("html");
        let style = dom.querySelector("style");

        if (script != null) {
            this.script = script.innerHTML || "";
        }

        if (html != null) {
            this.html = html.innerHTML || "";
        }

        if (style != null) {
            this.style = style.innerHTML || "";
        }
    }

    getHTML () {
        return this.html;
    }

    getScript () {
        return this.script;
    }

    getStyle () {
        return this.style;
    }
}

module.exports = Component;