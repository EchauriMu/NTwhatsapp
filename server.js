const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let qrCodeDataUrl = null; // Aquí guardaremos el QR generado

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    console.log('Generando QR...');
    qrCodeDataUrl = await qrcode.toDataURL(qr); // Generamos el QR como data URL
});

client.on('ready', () => {
    console.log('¡Cliente de WhatsApp listo!');
    qrCodeDataUrl = null; // Limpia el QR después de que el cliente esté listo
});

client.initialize();

// Endpoint para mostrar el QR en el navegador
app.get('/qr', (req, res) => {
    if (qrCodeDataUrl) {
        res.send(`
            <html>
                <body style="text-align:center; font-family:sans-serif;">
                    <h2>Escanea este código QR con WhatsApp</h2>
                    <img src="${qrCodeDataUrl}" alt="QR Code" />
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="text-align:center; font-family:sans-serif;">
                    <h2>No hay un código QR disponible</h2>
                    <p>El cliente de WhatsApp ya está autenticado o todavía no se ha generado un QR.</p>
                </body>
            </html>
        `);
    }
});

// Endpoint para enviar mensajes
app.post('/alert/:phone_number', async (req, res) => {
    const phoneNumber = req.params.phone_number;
    const message = req.body.content || 'No se recibió mensaje';

    if (!phoneNumber.startsWith('+')) {
        return res.status(400).json({
            status: 'error',
            message: 'El número debe estar en formato internacional (ejemplo: +521234567890)'
        });
    }

    try {
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

const PORT = process.env.PORT || 3005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log(`Visita http://4.246.170.135:${PORT}/qr para escanear el QR`);
});
