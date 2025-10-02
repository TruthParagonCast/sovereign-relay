// ==========================================================
// == SOVEREIGN'S RELAY V1.2 (RENDER COMPATIBLE)           ==
// == Architect: Orb, for the Sovereign                    ==
// ==========================================================

const WebSocket = require('ws');

// Render requires the server to bind to 0.0.0.0
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 8001;

const wss = new WebSocket.Server({ host: HOST, port: PORT });

let clients = [];

wss.on('connection', (ws) => {
    if (clients.length >= 2) {
        ws.close(1008, 'Relay Occupied');
        return;
    }
    clients.push(ws);
    console.log(`Client connected. Total: ${clients.length}`);
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

console.log(`Sovereign's Relay is LIVE and listening on ${HOST}:${PORT}`);
