// Klientský kód
let socket;

connect();

function connect() {
    let ws = new WebSocket("ws://" + location.host + "/game/test");
    ws.onmessage = (event) => {
        accept(event.data);
    };
    socket = ws;
}

function accept(data) {
    console.log("Přijatá data: " + data);
    let dif = document.getElementById("info");
    dif.innerHTML = data;
}

function sendTest() {
    socket.send("Brikule");
}