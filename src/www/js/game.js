// Klientský kód
let socket;
let user = "";
let vyberPrvniho = false;

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
        if(workdata.type == "voleny")
        {
            fazeHry(data, ".forhont-info");
        } else {
            
        }
    } else {
        if(workdata.type == "voleny")
        {
            fazeHry(data, ".defense-info");
        } else {

        }
    }
    zobrazeniKaret(data);
}

function zobrazeniKaret(data) {
    let workdata = JSON.parse(data);
    let kartyDiv = document.getElementById("karty");
    let karty = "";
    let index = 0;
    for (i in workdata.playersPacks)
    {
        karty = workdata.playersPacks[i];
        index++;
        console.log(karty + index);

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

function fazeHry(data, classRoleHrace) {
    // načtení dat
    let workdata = JSON.parse(data);
    let dif = document.getElementById("info");
    // schování divu pro obránce, nebo forhonta
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none";}

    //fáze hry
    if (workdata.phase == "waiting"){
        dif.innerHTML = "Čekáme na hráče";
    } else if (workdata.phase == "choosing-trumf"){
        dif.innerHTML = "";
        document.getElementById('first-choose').style.display = 'block';

    } else if (workdata.phase == "choosing-talon"){
        document.getElementById('first-choose').style.display = 'none';
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "choosing-game"){
        document.getElementById('second-choose').style.display = 'none';
        document.getElementById('third-choose').style.display = 'block';
    } else if (workdata.phase == "betting"){
        document.getElementById('first-choose').style.display = 'none';
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "playing"){

    }
}

function sendData(data){
    socket.send(data);
}