const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user'); // Modelo de usuario

const JWT_SECRET = process.env.JWT_SECRET || '123456';

// POST - Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    //imprimir los datos recibidos
    console.log("Datos recibidos para registro:", {username, email, password});
    
    // Verificación de los campos requeridos
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe por su correo electrónico
        const existingUser = await User.findOne({email: email});

        if (existingUser) {
        return res.status(400).json({ message: 'Ya existe un usuario con el mismo email' });
        }

        // Crear un nuevo usuario 
        const newUser = new User({
        username,
        email,
        password, 
        });

        // Guardar el nuevo usuario en la base de datos
        const savedUser = await newUser.save();
        //Crear Token JWT
        const token = jwt.sign({userId:savedUser._id, email:savedUser.email}, JWT_SECRET, {expiresIn:'1h'});

        res.status(201).json({ message: 'Usuario registrado con exito',token });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar usuario', error: err });
    }
    });

    // POST - Ruta para el inicio de sesión
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        // Verificación de los campos requeridos
        if (!email || !password) {
            return res.status(400).json({ message: 'Ingrese email y contraseña' });
        }

        try {
            // Buscar al usuario por su correo electrónico
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Email o contraseña incorrectos' });
            }

            // Comparar la contraseña ingresada con la almacenada (en texto plano)
            if (user.password !== password) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Si la contraseña coincide, generar token JWT
            const token = jwt.sign({userId:user._id, email:user.email}, JWT_SECRET, {expiresIn:'1h'});

            res.status(201).json({ message: 'Ingreso con exito',token });
        
    } catch (err) {
        res.status(500).json({ message: 'Error al logear', error: err });
    }
    });


module.exports = router;