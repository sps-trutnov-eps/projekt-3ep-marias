// Klientský kód
let socket;
let user = "";
let game = 0;
let vyberPrvniho = false;

let talonB = document.getElementById("talon");
let barvaB = document.getElementById("barva");
let dobraB = document.getElementById("dobra");
let spatnaB = document.getElementById("spatna");
let flekB = document.getElementById("flek");
let koncimB = document.getElementById("koncim");
let buttons = [talonB, barvaB, dobraB, spatnaB, flekB, koncimB];
let gamePhase = ["waiting", "choosing-trumf", "choosing-talon", "choosing-game", "ack", "ack", "choosing-challange", "betting", "betting", "betting", "betting", "betting", "betting", "playing"];
let flekovani = ["Flek", "Reflek", "Tuty", "Boty", "Kalhoty", "Kaiser"];
let counter = 0;
let phaseI = 0;

connect();

function connect() {
        let ws = new WebSocket("ws://" + location.host + "/game/test");
        ws.onmessage = (event) => {
            console.log("Event: " + event.data);
            if (user === ""){
                console.log("Parse: " + JSON.parse(event.data));
                user = (JSON.parse(event.data)).split(";")[0];
                game = (JSON.parse(event.data)).split(";")[1];
            } else accept(event.data);
        socket = ws;
    }
}

function accept(data) {
    let workdata = JSON.parse(data);
    console.log("Přijatá data: " + workdata);
    if(!workdata.altForhont) {
        if(user == workdata.players[workdata.forhont]) {
            if(workdata.type == "voleny")
            {
                fazeVoleneHry(data, ".forhont-info");
            } else {
                
            }
        } else {
            if(workdata.type == "voleny")
            {
                fazeVoleneHry(data, ".defense-info");
            } else {

            }
        }
    }
    else{
        if(user == workdata.players[workdata.altForhont]) {
            fazeVoleneHryaltForhonta(data, ".forhont-info");
        } else {
            fazeVoleneHryaltForhonta(data, ".defense-info");
        }
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

function fazeVoleneHry(data, classRoleHrace) {
    // načtení dat
    let workdata = JSON.parse(data);
    let dif = document.getElementById("info");
    
    // schování divu pro obránce, nebo forhonta
    for (let el of document.querySelectorAll(".step")) el.style.display = "none";
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none";}

    //fáze hry
    if (workdata.phase == "waiting") {
        dif.innerHTML = "Čekáme na hráče";
    } else if (workdata.phase == "choosing-trumf") {
        dif.innerHTML = "";
        document.getElementById('first-choose').style.display = 'block';

    } else if (workdata.phase == "choosing-talon") {
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "choosing-game") {
        document.getElementById('third-choose').style.display = 'block';
    } else if (workdata.phase == "ack") {
        document.getElementById('barva').style.display = 'none';
        document.getElementById('barva-info').style.display = 'block';
        document.getElementById('fourth-choose').style.display = 'block';
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('barva-info').style.display = 'none';
            document.getElementById('barva').style.display = 'block';
        }
    } else if (workdata.phase == "choosing-challange") {
        document.getElementById('fifth-choose').style.display = 'block';
    } else if (workdata.phase == "betting") {
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('last-choose').style.display = 'block';
            for (let el of document.querySelectorAll(".flek")) el.innerHTML = flekovani[counter];
            counter += 1;
        }
    } else if (workdata.phase == "playing") {
        counter = 0;
    }
    dif.innerHTML = workdata.phase;
}

function fazeVoleneHryaltForhonta(data, classRoleHrace) {
    // načtení dat
    let workdata = JSON.parse(data);
    let dif = document.getElementById("info");
    
    // schování divu pro obránce, nebo forhonta
    for (let el of document.querySelectorAll(".step")) el.style.display = "none";
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none";}

    //fáze hry
    if (workdata.phase == "choosing-talon") {
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "choosing-game"){
        document.getElementById('hra').style.display = 'none';
        document.getElementById('third-choose').style.display = 'block';
    } else if (workdata.phase == "ack") {
        document.getElementById('barva').style.display = 'none';
        document.getElementById('barva-info').style.display = 'block';
        document.getElementById('fourth-choose').style.display = 'block';
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('barva-info').style.display = 'none';
            document.getElementById('barva').style.display = 'block';
        }
    } else if (workdata.phase == "betting") {
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('last-choose').style.display = 'block';
            for (let el of document.querySelectorAll(".flek")) el.innerHTML = flekovani[counter];
            counter += 1;
        }
    } else if (workdata.phase == "playing") {
        counter = 0;
    }
    dif.innerHTML = workdata.phase;
}

function sendData(akce, data){
    if(phaseI < 13) {phaseI += 1;}
    else {phaseI = 0;}
    socket.send(game + ";" + "skipTo;" + gamePhase[phaseI]);
}