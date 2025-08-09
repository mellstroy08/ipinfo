const express = require('express');
const axios = require('axios'); // Artık 'fetch' yerine 'axios' kullanıyoruz
const path = require('path');

const app = express();
const PORT = 3000;

// SENİN API TOKEN'IN
const IPINFO_TOKEN = "6f33b6ebd15b03";

app.use(express.static('public'));

app.get('/api/ipinfo', async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        if (req.query.ip) {
            ip = req.query.ip;
        }

        const apiUrl = `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`;
        console.log(`İstek atılan URL: ${apiUrl}`);

        // fetch yerine axios.get kullanıyoruz. Syntax biraz farklı.
        const response = await axios.get(apiUrl);

        // axios'ta veriler direkt 'response.data' içinde gelir.
        const data = response.data;
        
        res.json(data);

    } catch (error) {
        // axios'tan gelen hatalar daha detaylı olabilir, onları yakalayalım.
        if (error.response) {
            console.error("API'den gelen HATA:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("SUNUCUDAKİ ANA HATA:", error.message);
            res.status(500).json({ 
                error: 'Sunucu tarafında bir hata oluştu.', 
                details: error.message 
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde başarıyla çalışıyor`);
});
