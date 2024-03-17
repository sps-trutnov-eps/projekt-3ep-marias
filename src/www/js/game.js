// Klientský kód
let socket;

function connect() {
    let ws = new WebSocket("ws://" + location.host + "/game/test");
    ws.onmessage = (event) => {
        accept(JSON.parse(event.JSON));
    };
    socket = ws;
}

function accept(data) {
    console.log(data);
}

function sendTest() {
    socket.send("Ahoj");
}