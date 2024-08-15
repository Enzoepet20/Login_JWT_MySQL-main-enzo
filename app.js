const express = require('express')
const model = {};
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const User = require('./models/User');
const db = require('./database/db');

const app = express()

// Seteamos el motor de plantillas
app.set('view engine', 'ejs')

// Seteamos la carpeta public para archivos estáticos
app.use(express.static('public'))

// Para procesar datos enviados desde forms
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Seteamos las variables de entorno
dotenv.config({ path: './env/.env' })

// Para poder trabajar con las cookies
app.use(cookieParser())

// Llamar al router
app.use('/', require('./routes/router'))

// Para eliminar la cache 
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Sincronización de la base de datos
db.sync({ force: false })
  .then(() => {
    console.log('Base de datos sincronizada');
    // Inicia el servidor solo después de que la base de datos esté sincronizada
    app.listen(3000, () => {
      console.log('SERVER UP running at http://localhost:3000')
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });
  model.User = User;
