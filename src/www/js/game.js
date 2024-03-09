// Klientský kód
socket = connect();

function connect() {
    let ws = new WebSocket('ws://localhost:8000/game/main');
    ws.onmessage = (event) => {
        accept(JSON.parse(event.JSON));
    };
    return ws;
}

function accept() {
    // Tady bude prijmani dat
}