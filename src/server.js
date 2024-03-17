const app = require("./app");

const port = require("./conf").port;

app.listen(port, () => {
    console.log("Pánové, server jede na portu: http://localhost:" + String(port));
});
