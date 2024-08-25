const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');

// Configurar Multer para almacenar las imágenes en una carpeta 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const imageFileExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// Validación de los campos del formulario
exports.validateFields = [
    body('name', 'Ingrese un nombre y apellido completo')
        .exists()
        .isLength({ min: 5 }),
    body('correo', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    body('pass', 'Ingrese un valor numérico')
        .exists()
        .isNumeric(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', {
                validaciones: errors.array(),
                valores: req.body
            });
        }
        next();
    }
];

// Cargar la imagen de perfil
exports.uploadProfileImage = upload.single('profileImage');

// Validación personalizada para la imagen de perfil
exports.validateProfileImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).render('register', { 
            validaciones: [{ msg: 'No se ha subido ninguna imagen' }], 
            valores: req.body 
        });
    }

    const fileExtension = req.file.mimetype.split('/')[1].toLowerCase();
    if (!imageFileExtensions.includes(fileExtension)) {
        return res.status(400).render('register', { 
            validaciones: [{ msg: 'Ingrese un formato de imagen válido (jpg, jpeg, png, gif)' }], 
            valores: req.body 
        });
    }

    next();
};

// Exportar el método de registro para que se ejecute después de las validaciones
exports.register = authController.register;
