const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/User'); // Importa tu modelo de Sequelize
const { promisify } = require('util');
const e = require('express');

// Valores reemplazados que estaban en el archivo .env
const JWT_SECRETO = 'super_secret';
const JWT_TIEMPO_EXPIRA = '7d';
const JWT_COOKIE_EXPIRES = 90; // En días

// Middleware para verificar si el usuario está autenticado
exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, JWT_SECRETO);

            const userRecord = await User.findByPk(decodificada.id);

            if (!userRecord) {
                return next();
            }

            req.user = userRecord;
            return next();
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        res.redirect('/login');
    }
};

// Metodo para mostrar la vista principal
exports.show = async (req, res, next) => {
    try {
        const { id, user, name, profile_image } = req.user;

        // Recuperar todos los usuarios desde la base de datos
        const users = await User.findAll({
            attributes: ['id', 'user', 'name', 'correo', 'profile_image']
        });

        res.render('index', {
            user: { id, user, name, profile_image },
            users: users
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar la página principal');
    }
};

// Metodo para mostrar la vista de edición
exports.getUserForEdit = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.render('edit', { user });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al cargar el usuario');
    }
};

// Procedimiento para registrarnos
exports.register = async (req, res) => {    
    try {
        const { name, user, pass, correo } = req.body;
        const passHash = await bcryptjs.hash(pass, 8);

        // Verifica si se ha subido una imagen y guarda la URL
        let profileImageUrl = '';
        if (req.file) {
            profileImageUrl = `/uploads/${req.file.filename}`;
        }

        // Crea un nuevo usuario en la base de datos
        await User.create({
            user,
            name,
            correo,
            pass: passHash,
            profile_image: profileImageUrl
        });

        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al registrar el usuario');
    }       
};

exports.login = async (req, res) => {
    try {
        const { user, pass } = req.body;

        if (!user || !pass) {
            return res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y password",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }

        // Busca el usuario en la base de datos
        const userRecord = await User.findOne({ where: { user } });

        if (!userRecord || !(await bcryptjs.compare(pass, userRecord.pass))) {
            return res.render('login', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Usuario y/o Password incorrectas",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }

        // Inicio de sesión OK
        const id = userRecord.id;
        const token = jwt.sign({ id }, JWT_SECRETO, {
            expiresIn: JWT_TIEMPO_EXPIRA
        });

        console.log("TOKEN: " + token + " para el USUARIO : " + user);

        const cookiesOptions = {
            expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        res.cookie('jwt', token, cookiesOptions);
        res.render('login', {
            alert: true,
            alertTitle: "Conexión exitosa",
            alertMessage: "¡LOGIN CORRECTO!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 800,
            ruta: ''
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el proceso de login');
    }
};



exports.logout = (req, res) => {
    res.clearCookie('jwt');
    return res.redirect('/');
};

exports.edit = async (req, res) => {
    try {
        const { name, correo } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        user.name = name || user.name;
        user.correo = correo || user.correo;
        if (req.file) {
            user.profile_image = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al editar el usuario');
    }
}
exports.delete = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        await user.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al borrar el usuario');
    }
}