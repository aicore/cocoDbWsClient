import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:9001/ws/', {
    perMessageDeflate: false
});

ws.on('open', function open() {
    ws.send('something');
});

ws.on('message', function message(data) {
    console.log('received: %s', data);
});
