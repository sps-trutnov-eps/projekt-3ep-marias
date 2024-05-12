let socket;
let user = "";
let workdata;
let game = 0;
let talon = ""; 
let flekHra = "konec";
let flekChallange = "konec";
let povoleno = false;
let hracVpravo = undefined;
let hracVlevo = undefined;

let talonB = document.getElementById("talon");
let barvaB = document.getElementById("barva");
let dobraB = document.getElementById("dobra");
let spatnaB = document.getElementById("spatna");
let flekB = document.getElementById("flek");
let koncimB = document.getElementById("koncim");
let logDiv = document.getElementById("log-messages");
let buttons = [talonB, barvaB, dobraB, spatnaB, flekB, koncimB];
let gamePhase = ["waiting", "picking-trumf", "choosing-talon", "choosing-game", "ack", "ack", "choosing-challange", "betting", "betting", "betting", "betting", "betting", "betting", "playing"];
let flekovani = ["Flek", "Reflek", "Tuty", "Boty", "Kalhoty", "Kaiser"];
let korekce = ["Takovou hru si nemůžeš dovolit", "Ještě máš barvu, nedělej, že nemáš", "Ještě máš trumfa, nedělej, že nemáš"];
let phaseI = 0;
// zakázání f12 a reloadu, s preview
// function handleForm(event) { event.preventDefault(); }
// document.onkeydown=function(e){if(!e.target.matches("input")&&!e.target.matches("textarea"))return!1};

connect();

function connect() {
        socket = new WebSocket("ws://" + location.host + "/game/test");
        socket.onmessage = (event) => {
            console.log("Event: " + event.data);
            if (user === ""){
                console.log("Parse: " + JSON.parse(event.data));
                user = (JSON.parse(event.data)).split(";")[0];
                game = (JSON.parse(event.data)).split(";")[1];
                socket.send(game + ";" + "repeat");
            } else accept(event.data);
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
    zobrazeniHracu();
    zobrazeniHracichKaret();
    zobrazeniZahranychKaret();
    zobrazeniTrumfa();
    zobrazeniHlasek(); 
    logMessage();
}

function logMessage(){
    let logContent = document.querySelector('#log-messages .log-content');
    let newListItem = document.createElement('li');
    if (workdata.phase == "waiting"){
        logContent.innerHTML="<li>čeká se na hráče</li>";
    }
    else if (korekce.includes(workdata.result))
    {
        if (user == workdata.players[workdata.turn] && workdata.result != "")
        {
            newListItem.textContent = workdata.result;
            logContent.appendChild(newListItem);
        }
    } else if (workdata.result != "" && workdata.phase != "ack") {
        newListItem.textContent = workdata.result;
        logContent.appendChild(newListItem);
    }

    // Scroll to the bottom of the log content
    logContent.scrollTop = logContent.scrollHeight;
}

function zobrazeniHracu() {
    const numPlayers = workdata.players.length;
    const currentPlayerIndex = workdata.players.findIndex(player => player === user);

    if (currentPlayerIndex !== -1) {
        document.getElementById("jmeno3").innerHTML = workdata.nicknames[currentPlayerIndex];
        document.getElementById("points3").innerHTML = workdata.playersPoints[currentPlayerIndex];
        
        hracVlevo = undefined;
        hracVpravo = undefined;
        let nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
        let prevPlayerIndex = (currentPlayerIndex + numPlayers - 1) % numPlayers;

        if (numPlayers === 3) {
            hracVpravo = workdata.players[prevPlayerIndex];
            document.getElementById("jmeno2").innerHTML = workdata.nicknames[prevPlayerIndex];
            document.getElementById("points2").innerHTML = workdata.playersPoints[prevPlayerIndex];
            hracVlevo = workdata.players[nextPlayerIndex];
            document.getElementById("jmeno1").innerHTML = workdata.nicknames[nextPlayerIndex];
            document.getElementById("points1").innerHTML = workdata.playersPoints[nextPlayerIndex];
        } else if (numPlayers === 2 && currentPlayerIndex !== 1) {
            document.getElementById("jmeno2").innerHTML = "Jmeno obránce";
            document.getElementById("points2").innerHTML = "0";
            hracVlevo = workdata.players[nextPlayerIndex];
            document.getElementById("jmeno1").innerHTML = workdata.nicknames[nextPlayerIndex];
            document.getElementById("points1").innerHTML = workdata.playersPoints[nextPlayerIndex];
        } else if (numPlayers === 2 && currentPlayerIndex === 1) {
            document.getElementById("jmeno1").innerHTML = "Jmeno obránce";
            document.getElementById("points1").innerHTML = "0";
            hracVpravo = workdata.players[nextPlayerIndex];
            document.getElementById("jmeno2").innerHTML = workdata.nicknames[nextPlayerIndex];
            document.getElementById("points2").innerHTML = workdata.playersPoints[nextPlayerIndex];
        } else {
            document.getElementById("jmeno2").innerHTML = "Jmeno obránce";
            document.getElementById("points2").innerHTML = "0";
            document.getElementById("jmeno1").innerHTML = "Jmeno obránce";
            document.getElementById("points1").innerHTML = "0";
        }
    }

}

function zobrazeniTrumfa() {
    let Div1 = document.getElementById("Trumf1");
    let Div2 = document.getElementById("Trumf2");
    let Div3 = document.getElementById("Trumf3");
    Div1.innerHTML = "";
    Div2.innerHTML = "";
    Div3.innerHTML = "";

    //if (workdata.trumf != '' && !workdata.altForhont && workdata.mode != 'b' && workdata.mode != 'd' && hracVlevo != undefined && hracVpravo != undefined) {
        //tvorba img
        let img = document.createElement('img');
        //
        img.src = '/karty/Types/leaf.png';
        // switch (workdata.trumf) {
        //     case "z":
        //         img.src = '/karty/Types/leaf.png';
        //         break;
        //     case "č":
        //         img.src = '/karty/Types/hearth.png';
        //         break;
        //     case "k":
        //         img.src = '/karty/Types/bell.png';
        //         break;
        //     case "ž":
        //         img.src = '/karty/Types/nut.png';
        //         break;
        //     default:
        //         break;
        // }

        img.style.height = '25px';
        Div3.appendChild(img);
        // switch (workdata.players[workdata.forhont]) {
        //     case hracVlevo:
        //         Div1.appendChild(img);
        //         break;
        //     case hracVpravo:
        //         Div2.appendChild(img);
        //         break;
        //     case user:
        //         Div3.appendChild(img);
        //         break;
        //     default:
        //         break;
        // }
    } 
//}

function zobrazeniHlasek() {
    // načtení a ničení
    let Hlaska1 = document.getElementById("odkladaci-misto-hlaska1");
    let Hlaska2 = document.getElementById("odkladaci-misto-hlaska2");
    let Hlaska3 = document.getElementById("odkladaci-misto-hlaska3");
    Hlaska1.innerHTML = "";
    Hlaska2.innerHTML = "";
    Hlaska3.innerHTML = "";

    for (let player in workdata.playersMariages) {
        for (let i in workdata.playersMariages[player]) {
            let img = document.createElement('img');
            img.style.height = '190px';
            
            switch (workdata.playersMariages[player][i]) {
                case "č":
                    img.src = '/karty/' + workdata.cardStyle + '/Cerv_6.jpg';
                    break;
                case "z":
                    img.src = '/karty/' + workdata.cardStyle + '/Listy_6.jpg';
                    break;
                case "k":
                    img.src = '/karty/' + workdata.cardStyle + '/Kule_6.jpg';
                    break;
                case "ž":
                    img.src = '/karty/' + workdata.cardStyle + '/Zaludy_6.jpg';
                    break;
                default:
                    break;
            }

            switch (workdata.players[player]) {
                case user:
                    Hlaska3.appendChild(img);
                    break;
                case hracVlevo:
                    Hlaska1.appendChild(img);
                    break;
                case hracVpravo:
                    Hlaska2.appendChild(img);
                    break;
                default:
                    break;
            }
        }
    }
}


function zobrazeniZahranychKaret() {
    let kartyDiv = document.getElementById("odkladaci-misto-karty");
    kartyDiv.innerHTML = "";
    for (let i in workdata.table) {
        let karta = workdata.table[i];
        let img = document.createElement('img');
        let src = "";
        
        switch (karta.colour) {
            case "č":
                src = '/karty/' + workdata.cardStyle + '/Cerv_';
                break;
            case "z":
                src = '/karty/' + workdata.cardStyle + '/Listy_';
                break;
            case "k":
                src = '/karty/' + workdata.cardStyle + '/Kule_';
                break;
            case "ž":
                src = '/karty/' + workdata.cardStyle + '/Zaludy_';
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

        switch (workdata.players[workdata.tableOrder[i]]) {
            case user:
                img.id = "Dole";
                img.style.height = '190px';
                img.classList.add("top-0", "start-50", "translate-middle-x");
                break;
            case hracVlevo:
                img.id = "Vlevo";
                img.style.height = '190px';
                img.classList.add("top-50", "start-0", "translate-middle-y");
                break;
            case hracVpravo:
                img.id = "Vpravo";
                img.style.height = '190px';
                img.classList.add("top-50", "end-0", "translate-middle-y");
                break;
            default:
                img.id = "Neoznaceno";
                break;
        }
        

        kartyDiv.appendChild(img);
    }
}


function zobrazeniHracichKaret() {
    let kartyDiv = document.getElementById("karty");
    kartyDiv.innerHTML = "";
    if(!workdata.altForhont && user == workdata.players[workdata.forhont] && (workdata.phase == "waiting" || workdata.phase == "picking-trumf")){
        for (let i in workdata.playersPacks) {
            let karta = workdata.playersPacks[i];
            let img = document.createElement('img');
            let src = "";
            if (i > 6){
                src = '/karty/backs/modre.jpg';
                img.style.height = '185px';
                img.style.margin = '2px';
            } else {
                switch (karta.colour) {
                    case "č":
                        src = '/karty/' + workdata.cardStyle + '/Cerv_';
                        break;
                    case "z":
                        src = '/karty/' + workdata.cardStyle + '/Listy_';
                        break;
                    case "k":
                        src = '/karty/' + workdata.cardStyle + '/Kule_';
                        break;
                    case "ž":
                        src = '/karty/' + workdata.cardStyle + '/Zaludy_';
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
            }
            
            img.src = src;
            img.onclick = function() {
                sendData("karty", i);
            };

            kartyDiv.appendChild(img);
        }
    } else {
        for (let i in workdata.playersPacks) {
            let karta = workdata.playersPacks[i];
            let img = document.createElement('img');
            let src = "";
            
            switch (karta.colour) {
                case "č":
                    src = '/karty/' + workdata.cardStyle + '/Cerv_';
                    break;
                case "z":
                    src = '/karty/' + workdata.cardStyle + '/Listy_';
                    break;
                case "k":
                    src = '/karty/' + workdata.cardStyle + '/Kule_';
                    break;
                case "ž":
                    src = '/karty/' + workdata.cardStyle + '/Zaludy_';
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
        workdata.trumf = '';
    } else if (workdata.phase == "picking-trumf") {
        dif.innerHTML = "";
        document.getElementById('first-choose').style.display = 'block';
        workdata.trumf = '';
    } else if (workdata.phase == "choosing-talon") {
        document.getElementById('second-choose').style.display = 'block';
        workdata.trumf = '';
    } else if (workdata.phase == "choosing-game") {
        if(povoleno){
            document.getElementById("hra").style.display = 'none';
        } else {
            document.getElementById("hra").style.display = 'inline';
        }
        document.getElementById('third-choose').style.display = 'block';
        workdata.trumf = '';
    } else if (workdata.phase == "ack") {
        povoleno = false;
        if (workdata.mode == "h") {
            document.getElementById('coSeHraje').innerHTML = "hraje se: Hra";
        } else if (workdata.mode == "b") {
            document.getElementById('coSeHraje').innerHTML = "hraje se: Betl";
        } else if (workdata.mode == "d") {
            document.getElementById('coSeHraje').innerHTML = "hraje se: Durch";
        } 
        document.getElementById('barva').style.display = 'none';
        document.getElementById('barva-info').style.display = 'block';
        document.getElementById('fourth-choose').style.display = 'block';
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('barva-info').style.display = 'none';
            document.getElementById('barva').style.display = 'block';
        }
        workdata.trumf = '';
    } else if (workdata.phase == "choosing-challange") {
        document.getElementById('fifth-choose').style.display = 'block';
        workdata.trumf = '';
    } else if (workdata.phase == "betting") {
        if(user == workdata.players[workdata.turn])
        {
            document.getElementById('last-choose').style.display = 'block';
            document.getElementById('flekHry').innerHTML = flekovani[Math.log2(workdata.bet)] + " na hru";
            if (workdata.challange == "7") {
                document.getElementById('flekChallange').innerHTML = flekovani[Math.log2(workdata.bet7)] + " na sedmu";
            } else if (workdata.challange == "100") {
                document.getElementById('flekHry').innerHTML = flekovani[Math.log2(workdata.bet)] + " na stovku";
                document.getElementById('flekChallange').style.display = 'none';
            } else if (workdata.challange == "107") {
                document.getElementById('flekHry').innerHTML = flekovani[Math.log2(workdata.bet)] + " na stovku";
                document.getElementById('flekChallange').innerHTML = flekovani[Math.log2(workdata.bet7)] + " na sedmu";
            } 
            else {
                document.getElementById('flekChallange').style.display = 'none';
            }
        }
    } else if (workdata.phase == "playing") {
        document.getElementById("karty").style.textAlign = "center";
        if (window.getComputedStyle(document.getElementById("karty")).getPropertyValue("margin-right") === "320px"){
            document.getElementById("karty").style.marginRight = "11px";
        }

        if (workdata.table.length == 3){
            setTimeout(() => {
                socket.send(game + ";" + "end");
              }, 3600);
        }
    }
}

function fazeVoleneHryaltForhonta(classRoleHrace) {
    // schování divu pro obránce, nebo forhonta
    for (let el of document.querySelectorAll(".step")) el.style.display = "none";
    if (classRoleHrace == ".defense-info") { for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".defense-info")) el.style.display = "block";}
    else {for (let el of document.querySelectorAll(".defense-info")) el.style.display = "none"; for (let el of document.querySelectorAll(".forhont-info")) el.style.display = "block";}

    //fáze hry
    if (workdata.phase == "choosing-talon") {
        document.getElementById('second-choose').style.display = 'block';
    } else if (workdata.phase == "choosing-game"){
        document.getElementById('hra').style.display = 'none';
        if(workdata.mode == "b"){
            socket.send(game + ";" + "game;" + "d");
        } else {
            document.getElementById('third-choose').style.display = 'block';
        }
    } else if (workdata.phase == "ack") {
        if (workdata.mode == "b") {
            document.getElementById('coSeHraje').innerHTML = "hraje se: Betl";
        } else if (workdata.mode == "d") {
            document.getElementById('coSeHraje').innerHTML = "hraje se: Durch";
        } 
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
            document.getElementById('flekHry').innerHTML = flekovani[Math.log2(workdata.bet)] + " na hru";
            document.getElementById('flekChallange').style.display = 'none';
        }
    } else if (workdata.phase == "playing") {
        document.getElementById("karty").style.textAlign = "center";
        if(window.getComputedStyle(document.getElementById("karty")).getPropertyValue("margin-right") === "320px"){
            document.getElementById("karty").style.marginRight = "11px";
        }

        if (workdata.table.length == 3){
            setTimeout(() => {
                socket.send(game + ";" + "end");
              }, 3600);
        }
    }
}

function sendData(akce, data){
    // if(phaseI < 13) {phaseI += 1;}
    // else {phaseI = 0;}    
    // socket.send(game + ";" + "skipTo;" + gamePhase[phaseI]);
    let dif = document.getElementById("info");
    if (user == workdata.players[workdata.turn] && workdata.table.length != 3)
    {
        if (akce == "karty"){
            if (workdata.phase == "picking-trumf"){
                socket.send(game + ";" + "trumf;" + data);
            } else if (workdata.phase == "choosing-talon"){
                if (!workdata.altForhont) {
                    if (!povoleno && (workdata.playersPacks[data].value == 15 || workdata.playersPacks[data].value == 14)) {
                        if(dif.innerHTML == "Hra bude Battle nebo Durch, kliknutím na bodovanou kartu potvrdíte"){
                            povoleno = true;
                        } else {
                            dif.innerHTML = "Hra bude Battle nebo Durch, kliknutím na bodovanou kartu potvrdíte";
                            dif.style.color = "red";
                        }
                    }
                    if(talon != "" && talon != data && (workdata.playersPacks[data].value != 15 && workdata.playersPacks[data].value != 14 || povoleno)){
                        socket.send(game + ";" + "talon;" + talon + ";" + data);
                        talon = "";
                        dif.style.color = "black";
                        dif.innerHTML = "";
                    } else if (workdata.playersPacks[data].value != 15 && workdata.playersPacks[data].value != 14 || povoleno) {
                        talon = data;
                        dif.style.color = "black";
                        dif.innerHTML = "";
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
                    socket.send(game + ";" + "play;" + workdata.players[workdata.turn] + ";" + data);
            } 
        }
        else if (akce == "tlacitko"){
            if (workdata.phase == "choosing-game" && (data == 'h' || data == 'b' || data == 'd' )){
               if(workdata.mode == ""){
                    socket.send(game + ";" + "game;" + data);
               } else if (workdata.mode == "h" && data != 'h') {
                    socket.send(game + ";" + "game;" + data);
               } else if ( workdata.mode == "b" && data == 'd') {
                    socket.send(game + ";" + "game;" + data);
               }
            } else if (workdata.phase == "ack" && (data == 'dobra' || data == 'spatna')){
                socket.send(game + ";" + data);
            } else if (workdata.phase == "choosing-challange" && (data == '100' || data == '7' || data == '107' || data == 'h')){
                socket.send(game + ";" + "challange;" + data);
            } else if (workdata.phase == "betting" && (workdata.bet <= 64 || workdata.bet7 <= 64)){
                if (data == "flekHry" && flekHra != "flek" && workdata.continueBet[0]) { 
                    document.getElementById('flekHry').style.background = 'green'; 
                    flekHra = "flek"; 
                } 
    
                if (data == "flekChallange" && flekChallange != "flek" && workdata.continueBet[1]) { 
                    document.getElementById('flekChallange').style.background = 'green'; 
                    flekChallange = "flek"; 
                } 
    
                if (data == "konec"){ 
                    socket.send(game + ";" + "bet;" + flekHra + ";" + flekChallange); 
                    // vrácení nazpátek
                    flekHra = "konec"; 
                    document.getElementById('flekHry').style.background = 'none'; 
                    flekChallange = "konec"; 
                    document.getElementById('flekChallange').style.background = 'none'; 
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