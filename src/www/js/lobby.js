function getTablesVoleny() {
    fetch('stolyVoleny', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })      
    .then(response => response.json())
    .then(data => {
        // data je teď velký list plný všech her co máš v databázi
        console.log(data);
    });
}

function getTablesLizany() {
    fetch('stolyLizany')
        .then()
        .then()
}