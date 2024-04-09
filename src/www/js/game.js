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
    zobrazeniKaret(data);
}

function zobrazeniKaret(data) {
    let workdata = JSON.parse(data);
    let kartyDiv = document.getElementById("karty");
    let karty = "";
    for (i in workdata.playersPacks)
    {
        karty = workdata.playersPacks[i];
        console.log(karty);

        if (workdata.playersPacks[i].colour == "č"){
            let img = document.createElement('img');
            img.src = '/karty/Bohemian/Cerv_';
            if (workdata.playersPacks[i].value == 14){
                img.src += "4.jpg";
            } else if (workdata.playersPacks[i].value == 15){
                img.src += "8.jpg";
            } else {
                img.src += String(workdata.playersPacks[i].value - 6) + ".jpg";
            }
            kartyDiv.appendChild(img);
        }

        if (workdata.playersPacks[i].colour == "z"){
            let img = document.createElement('img');
            img.src = '/karty/Bohemian/Listy_';
            if (workdata.playersPacks[i].value == 14){
                img.src += "4.jpg";
            } else if (workdata.playersPacks[i].value == 15){
                img.src += "8.jpg";
            } else {
                img.src += String(workdata.playersPacks[i].value - 6) + ".jpg";
            }
            kartyDiv.appendChild(img);
            
        }

        if (workdata.playersPacks[i].colour == "k"){
            let img = document.createElement('img');
            img.src = '/karty/Bohemian/Kule_';
            if (workdata.playersPacks[i].value == 14){
                img.src += "4.jpg";
            } else if (workdata.playersPacks[i].value == 15){
                img.src += "8.jpg";
            } else {
                img.src += String(workdata.playersPacks[i].value - 6) + ".jpg";
            }
            kartyDiv.appendChild(img);
            
        }

        if (workdata.playersPacks[i].colour == "ž"){
            let img = document.createElement('img');
            img.src = '/karty/Bohemian/Zaludy_';
            if (workdata.playersPacks[i].value == 14){
                img.src += "4.jpg";
            } else if (workdata.playersPacks[i].value == 15){
                img.src += "8.jpg";
            } else {
                img.src += String(workdata.playersPacks[i].value - 6) + ".jpg";
            }
            kartyDiv.appendChild(img);
        }
    }
}
