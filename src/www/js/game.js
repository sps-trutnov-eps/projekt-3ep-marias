// Klientský kód
let socket;
let user = "";
let workdata;
let game = 0;
let talon = "";
let counterGame = 0;
let counterChallange = 0;
let flekHra = "konec";
let flekChallange = "konec";

let talonB = document.getElementById("talon");
let barvaB = document.getElementById("barva");
let dobraB = document.getElementById("dobra");
let spatnaB = document.getElementById("spatna");
let flekB = document.getElementById("flek");
let koncimB = document.getElementById("koncim");
let buttons = [talonB, barvaB, dobraB, spatnaB, flekB, koncimB];
let gamePhase = ["waiting", "picking-trumf", "choosing-talon", "choosing-game", "ack", "ack", "choosing-challange", "betting", "betting", "betting", "betting", "betting", "betting", "playing"];
let flekovani = ["Flek", "Reflek", "Tuty", "Boty", "Kalhoty", "Kaiser"];
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
    workdata = JSON.parse(data);
    console.log("Přijatá data: " + workdata);
    if(!workdata.altForhont) {
        if(user == workdata.players[workdata.forhont]) {
            if(workdata.type == "voleny")
            {
                fazeVoleneHry(".forhont-info");
            } else {
                
            }
        } else {
            if(workdata.type == "voleny")
            {
                fazeVoleneHry(".defense-info");
            } else {

            }
        }
    }
    else{
        if(user == workdata.players[workdata.altForhont]) {
            fazeVoleneHryaltForhonta(".forhont-info");
        } else {
            fazeVoleneHryaltForhonta(".defense-info");
        }
    }
    zobrazeniKaret();
}

function zobrazeniKaret() {
    let kartyDiv = document.getElementById("karty");
    kartyDiv.innerHTML = "";
    for (let i in workdata.playersPacks) {
        let karta = workdata.playersPacks[i];
        let img = document.createElement('img');
        let src = "";
        
        switch (karta.colour) {
            case "č":
                src = '/karty/Bohemian/Cerv_';
                break;
            case "z":
                src = '/karty/Bohemian/Listy_';
                break;
            case "k":
                src = '/karty/Bohemian/Kule_';
                break;
            case "ž":
                src = '/karty/Bohemian/Zaludy_';
                break;
            default:
                break;
        }
        
        if (karta.value == 14) {
            src += "4.jpg";
        } else if (karta.value == 15) {
            src += "8.jpg";
        } else {
            src += String(karta.value - 6) + ".jpg";
        }
        img.src = src;
        
        img.onclick = function() {
            sendData("karty", i);
        };
        
        kartyDiv.appendChild(img);
    }
}


function fazeVoleneHry(classRoleHrace) {
    // načtení dat
    let dif = document.getElementById("info");
    
    // schování divu pro obránce, nebo forhonta
    for (let el of document.querySelectorAll(".step")) el.style.display = "none";
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".defense-info")) el.style.display = "block";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "block";}

    //fáze hry
    if (workdata.phase == "waiting") {
        dif.innerHTML = "Čekáme na hráče";
    } else if (workdata.phase == "picking-trumf") {
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
            document.getElementById('flekHry').innerHTML = flekovani[counterGame] + "hry";
            if (workdata.challange == "sedma") {
                document.getElementById('flekChallange').innerHTML = flekovani[counterChallange] + "sedmy";
                document.getElementById('koncim').innerHTML = 'Další';
            } else if (workdata.challange == "stovka") {
                document.getElementById('flekChallange').innerHTML = flekovani[counterChallange] + "stovky";
                document.getElementById('koncim').innerHTML = 'Další';
            } else {
                document.getElementById('flekChallange').style.display = 'none';
                document.getElementById('koncim').innerHTML = 'Končím';
            }
            
        }
    } else if (workdata.phase == "playing") {
        counterGame = 0;
        counterChallange = 0;
    }
}

function fazeVoleneHryaltForhonta(classRoleHrace) {
    // načtení dat
    let dif = document.getElementById("info");
    
    // schování divu pro obránce, nebo forhonta
    for (let el of document.querySelectorAll(".step")) el.style.display = "none";
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".defense-info")) el.style.display = "block";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "block";}

    //fáze hry
    if (workdata.phase == "choosing-talon") {
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "choosing-game"){
        document.getElementById('hra').style.display = 'none';
        if(workdata.game == "b"){
            socket.send(game + ";" + "game;" + "d");
        } else {
            document.getElementById('third-choose').style.display = 'block';
        }
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
            document.getElementById('koncim').innerHTML = 'Končím';
            document.getElementById('last-choose').style.display = 'block';
            document.getElementById('flekHry').innerHTML = flekovani[counterGame] + "hry";
            document.getElementById('flekChallange').style.display = 'none';
        }
    } else if (workdata.phase == "playing") {
        counterGame = 0;
        counterChallange = 0;
    }
}

function sendData(akce, data){
    // if(phaseI < 13) {phaseI += 1;}
    // else {phaseI = 0;}    
    // socket.send(game + ";" + "skipTo;" + gamePhase[phaseI]);
    if (user == workdata.players[workdata.turn])
    {
        if (akce == "karty"){
            if (workdata.phase == "picking-trumf"){
                socket.send(game + ";" + "trumf;" + data);
            } else if (workdata.phase == "choosing-talon"){
                if (!workdata.altForhont) {
                    if(talon != "" && talon != data && workdata.playersPacks[data].value != 15 && workdata.playersPacks[data].value != 14){
                        socket.send(game + ";" + "talon;" + talon + ";" + data);
                        talon = "";
                    } else if (workdata.playersPacks[data].value != 15 && workdata.playersPacks[data].value != 14) {
                        talon = data;
                    }
                } else {
                    if(talon != "" && talon != data){
                        socket.send(game + ";" + "talon;" + talon + ";" + data);
                        talon = "";
                    } else {
                        talon = data;
                    }
                }
            } else if (workdata.phase == "playing"){
                socket.send(game + ";" + "skipTo;" + gamePhase[phaseI]);
            } 
        }
        else if (akce == "tlacitko"){
            if (workdata.phase == "choosing-game"){
                socket.send(game + ";" + "game;" + data);
            } else if (workdata.phase == "ack"){
                socket.send(game + ";" + data);
            } else if (workdata.phase == "choosing-challange"){
                socket.send(game + ";" + "challange;" + data);
            } else if (workdata.phase == "betting"){
                if (document.getElementById('koncim').innerHTML == 'Končím')
                {
                    if (data == "flekHry"){
                        socket.send(game = ";" + "bet;" + "flek" + ";" + "konec");
                    } else if (data == "konec") {
                        socket.send(game = ";" + "bet;" + "konec" + ";" + "konec");
                    }
                } else {
                    if (data == "flekHry" && document.getElementById('flekHry').style.color != "green") {
                        document.getElementById('flekHry').style.color = 'green';
                        flekHra = "flek";
                    } else if (data == "flekHry" && document.getElementById('flekHry').style.color == "green") {
                        document.getElementById('flekHry').style.color = 'none';
                        flekHra = "konec";
                    }

                    if (data == "flekChallange" && document.getElementById('flekChallange').style.color != "green") {
                        document.getElementById('flekChallange').style.color = 'green';
                        flekChallange = "flek";
                    } else if (data == "flekChallange" && document.getElementById('flekChallange').style.color == "green") {
                        document.getElementById('flekChallange').style.color = 'none';
                        flekChallange = "konec";
                    }

                    if (data == "konec"){
                        socket.send(game = ";" + "bet;" + flekHra + ";" + flekChallange);
                        if (flekHra = "flek") {
                            counterGame += 1;
                        }
                        if (flekChallange = "flek") {
                            counterChallange += 1;
                        }
                    }
                }
                    

                
            }
        }
        else if (akce == "posun"){
            if (phaseI < 12+data) {phaseI += data;}
            else {phaseI = 0;} 
            socket.send(game + ";" + "skipTo;" + gamePhase[phaseI]);
        }
        
    }
 
} 