function getTablesVoleny() {
    fetch('lobby/stolyVoleny', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })      
    .then(response => response.json)
    .then(data => {
        console.log(JSON.parse(data));
    });
}

// function getTablesLizany() {
//     fetch('lobby/stolyLizany', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })      
//     .then(response => response.json)
//     .then(data => {
//         console.log(JSON.parse(data));
//     });
// }