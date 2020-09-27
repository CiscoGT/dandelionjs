const chokidar = require("chokidar");

class Watcher {
    constructor (viewsDir, templateDir, componentsDir) {
        this.templateDir = templateDir;
        this.componentsDir = componentsDir;
        this.viewsDir = viewsDir;

        this.reloadingC = false;
        this.reloadingT = false;
        this.reloadingV = false;

        this.events = new Map();
    }

    emit (eventName) {
        let handlers = this.events.get(eventName) || [];
        setTimeout(() => {
            for (let handler of handlers) {
                handler();
            }
        }, 100);
    }

    on (eventName, callback) {
        let handlers = this.events.get(eventName) || [];
        handlers.push(callback);
        this.events.set(eventName, handlers);
    }


    runWatch () {
        let watcher = this;
        chokidar.watch(this.templateDir).on('all', () => {
            if (watcher.reloadingT) {
                return;
            }

            watcher.reloadingT = true;
            setTimeout(() => {
                watcher.reloadingT = false;
            }, 1000);
            watcher.emit("template");
        });

        chokidar.watch(this.componentsDir).on('all', () => {
            if (watcher.reloadingC) {
                return;
            }

            watcher.reloadingC = true;
            setTimeout(() => {
                watcher.reloadingC = false;
            }, 1000);
            watcher.emit("components")
        });

        chokidar.watch(this.viewsDir).on('all', () => {
            if (watcher.reloadingV) {
                return;
            }

            watcher.reloadingV = true;
            setTimeout(() => {
                watcher.reloadingV = false;
            }, 1000);
            watcher.emit("view")
        });
    }
}

module.exports = Watcher;