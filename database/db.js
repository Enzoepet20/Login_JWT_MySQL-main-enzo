require("dotenv").config();
var sequelize = require("sequelize");

var db = new sequelize(
    'registro_sequelize', // Reemplaza con el nombre de tu base de datos
    'pma', // Reemplaza con tu usuario de base de datos
    '1234', // Reemplaza con tu contraseña
    {
        dialect: "mysql",
        host: 'localhost', // Reemplaza con el host de tu base de datos
        port: 3307, // Reemplaza con el puerto de tu base de datos si es diferente al predeterminado
    }
);
module.exports = db;
