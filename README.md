# Twitter Video Downloader

Application web pour télécharger des vidéos Twitter directement sur votre appareil.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

## Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Démarrer le serveur**
```bash
npm start
```

Le serveur démarrera sur `http://localhost:3000`

## Utilisation

1. Ouvrez votre navigateur et allez sur `http://localhost:3000`
2. Copiez l'URL d'un tweet contenant une vidéo
3. Collez l'URL dans le champ de texte
4. Cliquez sur "Trouver la vidéo"
5. Sélectionnez la qualité désirée
6. Cliquez sur "Télécharger"

## API Backend

Le serveur expose deux endpoints :

### GET /api/video-info/:tweetId
Récupère les informations de la vidéo et les différentes qualités disponibles.

**Exemple de réponse:**
```json
{
  "success": true,
  "variants": [
    {
      "url": "https://...",
      "quality": "HD 1080p",
      "bitrate": 2000000
    }
  ],
  "thumbnail": "https://..."
}
```

### GET /api/download?url=...&filename=...
Télécharge la vidéo depuis l'URL fournie et la retourne au client.