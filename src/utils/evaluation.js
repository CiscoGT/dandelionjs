const os = require("os");

module.exports = async (content, locals) => {
    let blocks = [];
    let evalBlocks = [];
    let codeBlocks = [];

    for (let part of content.split("{{")) {
        if (part.includes("}}")) {
            blocks.push(part.split("}}")[0]);
        }
    }

    for (let block of blocks) {
        if (block.includes("\n")) {
            codeBlocks.push(block);
        } else {
            evalBlocks.push(block);
        }
    }

    for (let block of evalBlocks) {
        let evaluate = await asyncEvaluation(block, locals);
        content = content.replace("{{" + block + "}}", evaluate.prints.join("") + evaluate.result);
        locals = evaluate.locals;
    }

    for (let block of codeBlocks) {
        let evaluate = await asyncEvaluation(block, locals);
        content = content.replace("{{" + block + "}}", evaluate.prints.join(""))
        locals = evaluate.locals;
    }

    return content;
}

async function asyncEvaluation (string, locals) {
    let { req, res, imports } = locals;
    let prints = [];

    // Useful functions for frontend
    const print = function (string) {
        prints.push(string);
    }

    let result = await eval(string);
    return { locals, result, prints };
}