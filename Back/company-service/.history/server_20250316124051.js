require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Company Service en écoute sur le port ${PORT}`));
