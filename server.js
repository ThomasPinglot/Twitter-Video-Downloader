const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/video-info/:tweetId', async (req, res) => {
    try {
        const { tweetId } = req.params;
        console.log(`Récupération de la vidéo pour le tweet: ${tweetId}`);
        
        try {
            console.log('Tentative avec SaveTweet API...');
            const response = await axios.get(`https://api.savetweet.net/api/json?url=https://twitter.com/i/status/${tweetId}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.data && response.data.data.urls) {
                const urls = response.data.data.urls;
                const variants = [];
                
                if (urls.video_hd) variants.push({ url: urls.video_hd, quality: 'HD 1080p', bitrate: 2000000 });
                if (urls.video_sd) variants.push({ url: urls.video_sd, quality: 'SD 480p', bitrate: 500000 });
                if (urls.video) variants.push({ url: urls.video, quality: 'Standard', bitrate: 1000000 });
                
                if (variants.length > 0) {
                    console.log('Vidéo trouvée avec SaveTweet!');
                    return res.json({
                        success: true,
                        variants,
                        thumbnail: urls.thumbnail
                    });
                }
            }
        } catch (e) {
            console.log('SaveTweet API failed:', e.message);
        }
        
        try {
            console.log('Tentative avec TwDown API...');
            const response = await axios.post('https://twdown.net/download.php', 
                `URL=https://twitter.com/i/status/${tweetId}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                }
            );
            
            const html = response.data;
            const videoRegex = /href="([^"]+\.mp4[^"]*)"/g;
            const matches = [...html.matchAll(videoRegex)];
            
            if (matches.length > 0) {
                const variants = matches
                    .map((match, index) => ({
                        url: match[1],
                        quality: index === 0 ? 'HD' : index === 1 ? 'SD' : 'Basse qualité',
                        bitrate: (3 - index) * 800000
                    }))
                    .filter(v => v.url.startsWith('http'));
                
                if (variants.length > 0) {
                    console.log('Vidéo trouvée avec TwDown!');
                    return res.json({
                        success: true,
                        variants
                    });
                }
            }
        } catch (e) {
            console.log('TwDown API failed:', e.message);
        }
        
        console.log('Toutes les APIs ont échoué, utilisation du fallback');
        return res.json({
            success: true,
            fallback: true,
            redirectUrl: `https://ssstwitter.com/en`,
            variants: [{
                url: `https://ssstwitter.com/en`,
                quality: 'Ouvrir dans SSSTwitter',
                bitrate: 0,
                external: true
            }]
        });
        
    } catch (error) {
        console.error('Erreur générale:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la vidéo'
        });
    }
});

app.get('/api/download', async (req, res) => {
    try {
        const { url, filename } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL manquante' });
        }
        
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename || 'twitter_video.mp4'}"`);
        
        response.data.pipe(res);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: 'Erreur lors du téléchargement'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});