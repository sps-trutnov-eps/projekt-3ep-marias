const dotenv = require('dotenv');

dotenv.config();

exports.port = process.env.PORT;
exports.secret = process.env.SECRET;