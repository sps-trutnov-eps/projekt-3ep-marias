// Klientský kód
let socket;

function connect() {
    let ws = new WebSocket("ws://" + location.host + "/game/test");
    ws.onmessage = (event) => {
        accept(event.data);
    };
    socket = ws;
}

function accept(data) {
    console.log("Přijatá data: " + data);
}

function sendTest() {
    console.log("Odesílám data: Ahoj");
    socket.send("Ahoj");
}