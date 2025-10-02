// ==========================================================
// == SOVEREIGN'S RELAY V1.3 (HEARTBEAT EDITION)           ==
// == Architect: Orb, for the Sovereign                    ==
// ==========================================================
const WebSocket = require('ws');
const PORT = process.env.PORT || 8001;
const wss = new WebSocket.Server({ port: PORT });

let clients = [];
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

wss.on('connection', (ws) => {
    if (clients.length >= 2) {
        ws.close(1008, 'Relay Occupied');
        return;
    }
    clients.push(ws);
    ws.isAlive = true;
    console.log(`Client connected. Total: ${clients.length}`);

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        const otherClient = clients.find(client => client !== ws && client.readyState === WebSocket.OPEN);
        if (otherClient) {
            otherClient.send(message);
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log(`Client disconnected. Total: ${clients.length}`);
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
});

const interval = setInterval(() => {
    clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('Terminating dead connection.');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
    });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
    clearInterval(interval);
});

console.log(`Sovereign's Relay with Heartbeat is LIVE on port ${PORT}`);
