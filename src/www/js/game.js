// Klientský kód
let socket;
let user = "";

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
            if (user === ""){
                user = JSON.parse(event.data);
            } else accept(event.data);
        socket = ws;
    }
}

function accept(data) {
    let workdata = JSON.parse(data);
    console.log("Přijatá data: " + workdata);
    if(user == workdata.players[workdata.forhont]) {
        let dif = document.getElementById("info");
        for (let el of document.querySelectorAll('.forhont-info')) el.style.visibility = 'visible';
        for (let el of document.querySelectorAll('.defense-info')) el.style.visibility = 'hidden';
    } else {
        let dif = document.getElementById("info");
        dif.innerHTML = "Nejsi forhont";
        for (let el of document.querySelectorAll('.defense-info')) el.style.visibility = 'visible';
        for (let el of document.querySelectorAll('.forhont-info')) el.style.visibility = 'hidden';
    }
    //changeButtonStates(workdata);
}