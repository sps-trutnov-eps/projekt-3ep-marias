// Klientský kód
let socket;

let talonB = document.getElementById("talon");
let barvaB = document.getElementById("barva");
let dobraB = document.getElementById("dobra");
let spatnaB = document.getElementById("spatna");
let flekB = document.getElementById("flek");
let koncimB = document.getElementById("koncim");
let buttons = [talonB, barvaB, dobraB, spatnaB, flekB, koncimB];

connect();

function connect() {
    let ws = new WebSocket("ws://" + location.host + "/game/test");
    ws.onmessage = (event) => {
        console.log("Event: " + event.data);
        accept(event.data);
    };
    socket = ws;
}

function sendTest() {
    socket.send("Brikule");
}

function changeButtonStates(data) {
    if (data.type == "voleny") {
        if (data.players.length < 3){
            for (let i = 0; i < buttons.length; i++){
                buttons[i].style.visibility = "hidden";
            }
        } else if (data.playing) {
            for (let i = 0; i < buttons.length; i++){
                buttons[i].style.visibility = "visible";
            }
        }
    }
}