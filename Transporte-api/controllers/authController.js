import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// 1. REGISTRO
export const register = async (req, res, next) => {
    try {
        const { nombre, apellido, correo, contrasena, id_rol, telefono } = req.body;

        // Validar manualmente por si Express no los leyó bien
        if (!nombre || !apellido || !correo || !contrasena || !id_rol) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios (nombre, apellido, correo, contrasena, id_rol)" 
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Guardar en Supabase
        const { data, error } = await supabase
            .from('usuario')
            .insert([{ 
                nombre, 
                apellido, 
                correo, 
                contrasena: hashedPassword, 
                id_rol, 
                telefono: telefono || null 
            }]);

        if (error) throw error;

        return res.status(201).json({ 
            success: true, 
            message: "Usuario registrado con éxito en la base de datos." 
        });
    } catch (error) {
        next(error);
    }
};

// 2. LOGIN
export const login = async (req, res, next) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
        }

        const { data: usuario, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('correo', correo)
            .single();

        if (error || !usuario) {
            return res.status(400).json({ error: "El correo o la contraseña son incorrectos." });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: "El correo o la contraseña son incorrectos." });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, correo: usuario.correo, id_rol: usuario.id_rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            message: "¡Login exitoso!",
            token,
            user: { correo: usuario.correo, id_rol: usuario.id_rol }
        });
    } catch (error) {
        next(error);
    }
};