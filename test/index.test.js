const dandelion = require("../src");
const path = require("path");

const app = dandelion();

app.configure({
    views: path.join(__dirname, "views"),
    components: path.join(__dirname, "components"),
    template: path.join(__dirname, "template.html"),
    static: path.join(__dirname, "static"),
    target: "#root",
    env: "development"
});

app.imports({
    moment: require("moment")
})

app.view("/", "main", {
    title: "Main Page"
});

app.view("/info", "info", {
    title: "Information"
});

app.listen(5000, () => {
    console.log("app listening on port 5000");
})