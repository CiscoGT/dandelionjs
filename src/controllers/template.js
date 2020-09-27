const fs = require("fs");
const { parse } = require("node-html-parser");
const Evaluation = require("../utils/evaluation.js");

class Template {
    constructor (filePath, target) {
        this.filePath = filePath;
        this.target = target;
        this.template = "";
    }

    init () {
        return new Promise ((resolve, reject) => {
            fs.readFile(this.filePath, "UTF-8", (err, data) => {
                if (err) {
                    throw Error(err);
                }

                console.log(this.filePath);
                console.log(data);
                this.template = data;
                resolve();
            })
        })
    }

    render (content) {
        let vdom = parse(this.template);
        let target = vdom.querySelector(this.target);
        if (target != null) {
            target.set_content(content);
        }

        return vdom.outerHTML || "";
    }

    async title (options) {
        let evalued = await Evaluation(this.template, options);
        let dom = parse(evalued);
        let titleObj = dom.querySelector("title");

        if (titleObj != null) {
            return titleObj.innerHTML;
        } else {
            return null;
        }
    }
}

module.exports = Template;