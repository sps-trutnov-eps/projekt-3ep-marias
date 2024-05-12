let loadedTablesVoleny = [];
let loadedTablesLizany = [];

function getTablesVoleny() {
    fetch('stolyVoleny', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })      
    .then(response => response.json())
    .then(data => {        
        console.log(data);
        const newTables = data.filter(table => !loadedTablesVoleny.some(loadedTable => loadedTable.name === table.name));

        loadedTablesVoleny.push(...newTables);

        const tableList = document.querySelector('#tableDivVoleny ul');

        newTables.forEach(table => {
            const { name, password, id } = table;

            const tableButton = document.createElement('button');
            tableButton.textContent = 'Připojit do hry';
            tableButton.classList.add('btn', 'btn-success', 'mx-3');
            const listItem = document.createElement('li');
        
            const nameElement = document.createElement('span');
            nameElement.textContent = name;
            nameElement.classList.add('px-5', 'fw-bold');
        
            const passwordElement = document.createElement('span');
            passwordElement.textContent = `Heslo: `;
        
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = password.length > 0;
            checkbox.disabled = true;
            checkbox.classList.add('checkbox-custom');
        
            passwordElement.appendChild(checkbox);
        
            listItem.appendChild(nameElement);
            listItem.appendChild(passwordElement);
            listItem.appendChild(tableButton); 
            listItem.classList.add('mb-2');
        
            tableButton.addEventListener('click', () => {
                if (password.length > 0) {
                    $('#passwordModalVoleny').modal('show');
                    document.getElementById('confirmPasswordBtn').onclick = () => {
                        const passwordInput = document.getElementById('passwordInput').value;
                        if (passwordInput === password) {
                            console.log(`Heslo pro stůl ${table.name}, ${table.id} bylo správné.`);
                            $('#passwordModalVoleny').modal('hide');
                            window.location.href = "/lobby/pripoj/" + id;
                        } else {
                            console.log(`Zadali jste nesprávné heslo pro stůl ${table.name}.`);
                        }
                    };
                } else {
                    console.log(`Připojuji se k hře na stolu ${table.name}.`);
                    window.location.href = "/lobby/pripoj/" + id;
                }
            });
        
            tableList.appendChild(listItem);
        });

    });
}

setInterval(getTablesVoleny, 3000);

// function getTablesLizany() {
//     fetch('stolyLizany', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })      
//     .then(response => response.json)
//     .then(data => {
//         console.log(JSON.parse(data));
//         const newTables = data.filter(table => !loadedTablesLizany.some(loadedTable => loadedTable.name === table.name));

//         loadedTablesLizany.push(...newTables);

//         const tableList = document.querySelector('#tableDivLizany ul');

//         newTables.forEach(table => {
//             const tableButton = document.createElement('button');
//             tableButton.textContent = 'Připojit do hry';
//             tableButton.classList.add('btn', 'btn-success', 'mx-3');
//             const listItem = document.createElement('li');

//             const { name, password } = table;

//             const nameElement = document.createElement('span');
//             nameElement.textContent = name;
//             nameElement.classList.add('px-5', 'fw-bold');

//             const passwordElement = document.createElement('span');
//             passwordElement.textContent = `Heslo: `;

//             const checkbox = document.createElement('input');
//             checkbox.type = 'checkbox';
//             checkbox.checked = password.length > 0;
//             checkbox.disabled = true;
//             checkbox.classList.add('checkbox-custom');

//             passwordElement.appendChild(checkbox);

//             listItem.appendChild(nameElement);
//             listItem.appendChild(passwordElement);
//             listItem.appendChild(tableButton); 
//             listItem.classList.add('mb-2');

                // tableButton.addEventListener('click', () => {
                //     if (password.length > 0) {
                //         $('#passwordModalLizany').modal('show');
                //         document.getElementById('confirmPasswordBtn').onclick = () => {
                //             const passwordInput = document.getElementById('passwordInput').value;
                //             if (passwordInput === password) {
                //                 console.log(`Heslo pro stůl ${table.name} bylo správné.`);
                //                 $('#passwordModalLizany').modal('hide');
                //             } else {
                //                 console.log(`Zadali jste nesprávné heslo pro stůl ${table.name}.`);
                //             }
                //         };
                //     } else {
                //         console.log(`Připojuji se k hře na stolu ${table.name}.`);
                //     }
                // });

//             tableList.appendChild(listItem);
//         });

//      });
//  }

//  setInterval(getTablesLizany, 3000);