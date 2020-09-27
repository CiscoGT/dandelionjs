const express = require("express");
const http = require("http");
const Socket = require("./classes/Socket");
const Renderer = require("./controllers/render");

class Application {
    constructor() {
        this.app = express();
        this.server = http.Server(this.app);
        this.socket = new Socket(this.server);
        this.importsList = {};

        this.app.use((req, res, next) => {
            req.socket = this.socket;
            next();
        })
    }

    configure (settings) {
        let { components, views, template, target, env } = settings;
        let staticDir = settings["static"];

        this.renderer = new Renderer(views, components, template, target);
        this.renderer.injection(this.app);

        process.env.NODE_ENV = env || "development";

        this.app.set("views", views);
        this.app.set("view engine", "lion");
        this.app.use(express.static(staticDir));
    }

    imports (importsLibs) {
        this.importsList = importsLibs;
    }

    get (...args) {
        this.app.get(...args);
    }

    castJSON (channel, content) {
        this.app.socket.json(channel, content);
    }

    castText (channel, content) {
        this.app.socket.send(channel, content);
    }

    listen (port, callback) {
        this.renderer.init(this.socket);
        this.server.listen(port, callback);
    }

    post (...args) {
        this.app.post(...args);
    }

    use (...args) {
        this.app.use(...args);
    }

    view (pattern, viewName, options = {}) {
        this.app.all(pattern, (req, res) => {
            options.req = req;
            options.res = res;
            options.imports = this.importsList;

            res.render(viewName, options);
        })
    }
}

module.exports = () => {
    return new Application();
}