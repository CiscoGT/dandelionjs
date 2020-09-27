/* ENV */
const env = {
    target: "{{{target}}}",
    mode: "normal"
}

/* TEMP */
const temp = {
    routers: []
};

/* APP */
const app = {
    events: new Map()
};
app.emit = (eventName, eventObject) => {
    let listeners = app.events.get(eventName) || [];
    for (let callback of listeners) {
        callback(eventObject);
    }
}
app.on = (eventName, listener) => {
    let listeners = app.events.get(eventName) || [];
    listeners.push(listener);
    app.events.set(eventName, listeners);
}
window.addEventListener("load", () => {
    app.emit("load");
});

/* Utilities */
const utils = {};
utils.GET = (url, invisible = false) => {
    return new Promise ( (resolve, reject) => {
        let req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                resolve({
                    response: this.response,
                    status: this.status
                })
            }
        }
        
        req.open("GET", url);
        if (!invisible)
            req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.send();
    });
}
utils.getInner = (query) => {
    let obj = document.querySelector(query);
    if (obj != null) {
        return obj.innerHTML;
    } else {
        return null;
    }
}
utils.hide = (query) => {
    let obj = document.querySelector(query);
    if (obj != null) {
        obj.style.display = "none";
    }
}
utils.setInner = (query, value) => {
    let obj = document.querySelector(query);
    if (obj != null) {
        return obj.innerHTML = value;
    } else {
        return null;
    }
}
utils.show = (query) => {
    let obj = document.querySelector(query);
    if (obj != null) {
        obj.style.display = "inherit";
    }  
}
utils.value = (query) => {
    let obj = document.querySelector(query);
    if (obj != null) {
        return obj.value;
    } else {
        return null;
    }
}

/* Router */
const router = {};
router.back = () => {
    window.history.back();
}
router.nav = async (url, updatePath = true) => {
    if (window.location.pathname == url) {
        return;
    }
    let req = await utils.GET(url);
    let res = req.response;
    let lines = res.split("\n");
    let [title, ...content] = lines;
    document.title = title;
    document.querySelector(env.target).innerHTML = content.join("\n");
    app.emit("navigation", { oldLocation: window.location.pathname, newLocation: url });
    if (updatePath) {
        router.setPath(url);
    }
}
router.refesh = async () => {
    let req = await utils.GET(window.location.href, true);
    let res = req.response;
    document.body.innerHTML = res;
    app.emit("refresh");
}
router.reload = async () => {
    let req = await utils.GET(window.location.href);
    let res = req.response;
    document.querySelector(env.target).innerHTML = res;
    app.emit("reload");
}
router.setPath = (path) => {
    if (path == null || path == "index.html" || path == "/"  || path == " ")
        window.history.pushState("/", "", "/");
    else
        window.history.pushState(path, "", path);
}

window.addEventListener("click", (e) => {
    let href = e.target.getAttribute("href");
    if (href == null) {
        return;
    }

    let isLocal = ( href.startsWith("http://") ||  href.startsWith("https://") ? href.startsWith(window.location.protocol + "//" + window.location.hostname) : true);

    if (e.target.hasAttribute("router") || env.mode == "ajax") {
        if (isLocal) {
            let lastParam = href.split("/")[href.split("/").length - 1];
            if (!lastParam.startsWith("#")) {
                e.preventDefault();
                temp.routers.push(href);
                router.nav(href);
            }
        }
    }
});

app.on("load", () => {
    if (document.body.hasAttribute("app-mode")) {
        env.mode = document.body.getAttribute("app-mode");
    
        if (env.mode == "ajax" || temp.routers.includes(e.state)) {
            window.addEventListener("popstate", (e) => {
                if (e.state != null)
                    router.nav(e.state, false);
            });
        }             
    }
})

/* SOCKET */
const socket = io.connect(window.location.protocol + "//" + window.location.hostname + ":" + window.location.port, {
    'forceNew': true
});

/* COMMANDS */
socket.on("command", (cmd) => {
    console.log("e");
    if (cmd == "refresh") {
        router.refesh();
    }
});