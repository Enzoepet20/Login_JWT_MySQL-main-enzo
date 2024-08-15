const express = require('express')
const router = express.Router()
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const {body, validationResult} = require('express-validator')
// Configurar Multer para almacenar las imágenes en una carpeta 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Extensiones de imagen permitidas
const imageFileExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// Validación personalizada para la imagen de perfil
const validateProfileImage = body('profileImage')
    .custom((value, { req }) => {
        if (!req.file) {
            throw new Error('No se ha subido ninguna imagen');
        }
        
        // Obtener la extensión del archivo
        const fileExtension = req.file.mimetype.split('/')[1].toLowerCase();

        // Verificar si la extensión está permitida
        if (!imageFileExtensions.includes(fileExtension)) {
            throw new Error('Ingrese un formato de imagen válido (jpg, jpeg, png, gif)');
        }

        return true;
    });

//router para las vistas
router.get('/', authController.isAuthenticated, async (req, res) => {
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
});

router.get('/register', (req, res)=>{
    res.render('register',  { validaciones: [] })
})

router.get('/login', (req, res)=>{
    res.render('login', {alert:false})
})


//router para los métodos del controller

// Ruta para registrar usuarios con carga de imagen de perfil
router.post('/register', upload.single('profileImage'), [
    body('name', 'Ingrese un nombre y apellido completo')
        .exists()
        .isLength({ min: 5 }),
    body('correo', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    body('pass', 'Ingrese un valor numérico')
        .exists()
        .isNumeric(),
    validateProfileImage
], (req, res) => {
    // Validación propia
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body);
        const valores = req.body;
        const validaciones = errors.array();
        res.render('register', { validaciones: validaciones, valores: valores });
    } else {
        authController.register(req, res);  // Llama al controlador solo si la validación fue exitosa
    }
});
router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router