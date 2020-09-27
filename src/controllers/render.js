const fs = require("fs");
const path = require("path");
const Components = require("./components");
const Template = require("./template");
const Tools = require("./tools");
const Watcher = require("./watcher");
const Evaluation = require("../utils/evaluation.js");

class Render {
    constructor (viewsPath, componentsPath, templatePath, target) {
        this.componentsPath = componentsPath;
        this.components = new Components(componentsPath);
        this.template = new Template(templatePath, target);
        this.watcher = new Watcher(viewsPath, templatePath, componentsPath);
        this.tools = new Tools(path.join(__dirname, "../tools/dandelion.tool.js"), path.join(__dirname, "../tools/dandelion.tool.css"), {
            target
        });
    }

    injection (app) {
        app.engine("lion", (filePath, options, callback) => {
            fs.readFile(filePath, "UTF-8", async (err, data) => {
                if (err) {
                    return callback(err);
                }

                let xhr = options.req.xhr;
                let virtualDom = data;
                let title = null;

                if (!xhr) {
                    virtualDom = this.template.render(virtualDom);
                } else {
                    title = await this.template.title(options);
                }

                virtualDom = this.components.renderHTML(virtualDom);

                virtualDom = await Evaluation(virtualDom, options);
                
                if (xhr) {
                    virtualDom = title + "\n" + virtualDom;
                }

                callback(err, virtualDom);
            });
        });

        app.get("/_bundle/app.js", (req, res) => {
            res.type(".js");
            res.end(this.tools.bindJS(this.components.buildScripts()));
        });

        app.get("/_bundle/app.css", (req, res) => {
            res.type(".css");
            res.end(this.tools.bindCSS(this.components.buildStyles()));
        });
    }

    
    async reloadComponents () {
        await this.components.loadComponents();
        this.reloadView();
    }

    async reloadTemplate () {
        await this.template.init();
        this.reloadView();
    }

    async reloadView () {
        this.socket.send("command", "refresh");
    }
    
    init (socket) {
        this.socket = socket;

        if (process.env.NODE_ENV == "development") {
            this.watcher.runWatch();
            this.watcher.on("components", () => {
                this.reloadComponents();
            });

            this.watcher.on("view", () => {
                this.reloadView();
            })

            this.watcher.on("template", () => {
                this.reloadTemplate();
            })
        }

        this.template.init();
        this.components.loadComponents();
    }
}

module.exports = Render;