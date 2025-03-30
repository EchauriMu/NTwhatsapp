const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');

const app = express();

// Middleware para parsear el cuerpo de la solicitud
app.use(bodyParser.json());

// Crear una instancia del cliente de WhatsApp con LocalAuth para la persistencia de sesión
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Añadir estos argumentos
    }
});

// Generar QR en consola para la primera vez
client.on('qr', (qr) => {
    console.log('Escanea el siguiente código QR para iniciar sesión en WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Cuando el cliente esté listo
client.on('ready', () => {
    console.log('¡Cliente de WhatsApp listo!');
});

// Inicializamos el cliente
client.initialize();

// Endpoint para enviar mensajes
app.post('/alert/:phone_number', async (req, res) => {
    const phoneNumber = req.params.phone_number;
    const message = req.body.content || 'No se recibió mensaje';

    // Validar que el número esté en formato internacional
    if (!phoneNumber.startsWith('+')) {
        return res.status(400).json({
            status: 'error',
            message: 'El número debe estar en formato internacional (ejemplo: +521234567890)'
        });
    }

    try {
        // WhatsApp Web requiere que el número esté en formato "number@c.us"
        const chatId = `${phoneNumber.replace('+', '')}@c.us`;

        console.log(`Enviando mensaje a ${chatId}: ${message}`);
        await client.sendMessage(chatId, message);
        console.log('Mensaje enviado exitosamente.');

        res.status(200).json({
            status: 'success',
            message: `Mensaje enviado a ${phoneNumber}`
        });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Iniciar servidor Express en el puerto 3005
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
