const Component = require("../classes/Component");
const { parse } = require("node-html-parser");
const fs = require("fs");
const path = require("path");

class Components {
    constructor (fileDir) {
        this.fileDir = fileDir;
        this.components = new Map();
    }

    loadComponents () {
        this.components.clear();
        return new Promise ( (resolve, reject) => {
            fs.readdir(this.fileDir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let index = 0;

                files.forEach((file) => {
                    if (file.endsWith(".lion") || file.endsWith(".html")) {
                        fs.readFile(path.join(this.fileDir, file), "UTF-8", (err, data) => {
                            index++;

                            if (err) {
                                return reject(err);
                            }

                            let component = new Component(data);
                            let name = file.split(".")[0].replace(file[0], file[0].toUpperCase());
                            this.components.set(name, component);

                            if (index == files.length) {
                                resolve();
                            }
                        });
                    }
                })
            });
        });
    }

    buildScripts () {
        let scripts = [];
        this.components.forEach((component) => {
            scripts.push(component.script || "");
        })

        return scripts.join(" ");
    }

    buildStyles () {
        let styles = [];
        this.components.forEach((component) => {
            styles.push(component.style || "");
        })

        return styles.join(" ");
    }

    getComponents () {
        let result = [];

        for (let key of this.components.keys()) {
            result.push({
                name: key,
                content: this.components.get(key).getHTML()
            })
        }

        return result;
    }

    renderHTML (stringDom) {
        let virtualDom = parse(stringDom);
        let list = this.getComponents();
        
        for (let component of list) {
            let objects = virtualDom.querySelectorAll(component.name);
            for (let object of objects) {
                object.set_content(component.content);
            }
        }

        return virtualDom.outerHTML;
    }
}

module.exports = Components;