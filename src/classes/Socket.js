const socketio = require('socket.io')

class Socket {
    constructor (server) {
        this.io = socketio(server);
        this.events = new Map();
    }

    json (channel, content) {
        this.io.sockets.emit(channel, JSON.stringify(content));
    }

    send (channel, content) {
        this.io.sockets.emit(channel, content);
    }

    emit (eventName) {
        let handlers = this.events.get(eventName) || [];
        for (let handler of handlers) {
            handler();
        }
    }

    on (eventName, callback) {
        let handlers = this.events.get(eventName) || [];
        handlers.push(callback);
        this.events.set(eventName, handlers);
    }
}

module.exports = Socket;