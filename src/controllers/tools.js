const fs = require("fs");

class Tool {
    constructor (jsPath, cssPath, opts) {
        fs.readFile(jsPath, "UTF-8", (err, data) => {
            if (err) {
                throw err;
            }

            data = data.replace("{{{target}}}", opts.target);
            this.jsTool = data;
        });

        fs.readFile(cssPath, "UTF-8", (err, data) => {
            if (err) {
                throw err;
            }

            this.cssTool = data;
        })
    }

    bindCSS (content) {
        return this.cssTool + " " + content;
    }

    bindJS (content) {
        return this.jsTool + " " + content;
    }
}

module.exports = Tool;