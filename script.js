// Configuration
const ELEVENLABS_API_KEY = 'sk_2b2dbd52afe8b1cdeb535bfa988ea9949d0938fbf1e70e87'; // Remplacez par votre clé API
const PROXY_URL = 'http://localhost:3000/tts'; // Ou votre URL Heroku/Render
const MAX_TEXT_LENGTH = 5000;

// Éléments DOM
const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('languageSelect');
const voiceSelect = document.getElementById('voiceSelect');
const playButton = document.getElementById('playButton');
const downloadButton = document.getElementById('downloadButton');
const status = document.getElementById('status');
const progress = document.getElementById('progress');

// Liste des voix (5 par langue, IDs réels d'ElevenLabs)
const voicesByLanguage = {
    fr: [
        { name: 'Rachel (Solennelle)', id: '21m00Tcm4TlvDq8ikWAM' },
        { name: 'Antoni (Clair)', id: 'ErXwobaYiN019PkySvjV' },
        { name: 'Bella (Douce)', id: 'EXAVITQu4vr4xnSDxMaL' },
        { name: 'Josh (Chaleureux)', id: 'TxGEqnHWrfWFTfGW9XjX' },
        { name: 'Sophie (Élégante)', id: 'pNInz6obpgDQGcFmaJg2' }
    ],
    en: [
        { name: 'Adam (Profond)', id: 'pNInz6obpgDQGcFmaJg2' },
        { name: 'Charlie (Calme)', id: 'IKne3meq5aSn9XLyUdCD' },
        { name: 'Dorothy (Sereine)', id: 'ThT5KcBeYPX3keUQqHPh' },
        { name: 'George (Autoritaire)', id: 'JBFqnCBsd6RMkjVDRZzb' },
        { name: 'Lily (Chaleureuse)', id: 'pFZP5JQG7iQjIQuC4Bku' }
    ],
    ar: [
        { name: 'Hassan (Respectueux)', id: 'pNInz6obpgDQGcFmaJg2' }, // Remplacer par IDs réels si disponibles
        { name: 'Amina (Clair)', id: 'ErXwobaYiN019PkySvjV' },
        { name: 'Omar (Solennel)', id: 'EXAVITQu4vr4xnSDxMaL' },
        { name: 'Fatima (Douce)', id: 'TxGEqnHWrfWFTfGW9XjX' },
        { name: 'Khalid (Profond)', id: '21m00Tcm4TlvDq8ikWAM' }
    ]
};

// Mettre à jour les voix
function updateVoices() {
    const lang = languageSelect.value;
    voiceSelect.innerHTML = '';
    voicesByLanguage[lang].forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.id;
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
}

languageSelect.addEventListener('change', updateVoices);
updateVoices();

// Diviser le texte
function splitText(text, maxLength) {
    const segments = [];
    let currentSegment = '';
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
        if ((currentSegment + sentence).length <= maxLength) {
            currentSegment += sentence + '. ';
        } else {
            if (currentSegment) segments.push(currentSegment.trim());
            currentSegment = sentence + '. ';
        }
    }
    if (currentSegment) segments.push(currentSegment.trim());
    return segments;
}

// Mettre à jour la progression
function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    progress.style.width = `${percentage}%`;
    progress.classList.remove('hidden');
}

// Lire le texte
playButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY') {
        status.textContent = 'Erreur : Clé API ElevenLabs manquante.';
        return;
    }

    const voiceId = voiceSelect.value;
    const segments = splitText(text, MAX_TEXT_LENGTH);

    status.textContent = 'Préparation de la lecture...';
    playButton.disabled = true;
    progress.classList.remove('hidden');

    try {
        for (let i = 0; i < segments.length; i++) {
            updateProgress(i, segments.length);
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: segments[i],
                    voiceId,
                    apiKey: ELEVENLABS_API_KEY
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur API : ${errorData.error || response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            await new Promise((resolve, reject) => {
                audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
                audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Erreur de lecture audio.')); };
                audio.play();
            });
        }

        status.textContent = 'Lecture terminée.';
    } catch (error) {
        status.textContent = `Erreur : ${error.message}`;
    } finally {
        playButton.disabled = false;
        progress.classList.add('hidden');
    }
});

// Télécharger en MP3
downloadButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY') {
        status.textContent = 'Erreur : Clé API ElevenLabs manquante.';
        return;
    }

    const voiceId = voiceSelect.value;
    const segments = splitText(text, MAX_TEXT_LENGTH);

    status.textContent = 'Génération du MP3...';
    downloadButton.disabled = true;
    progress.classList.remove('hidden');

    try {
        const blobs = [];
        for (let i = 0; i < segments.length; i++) {
            updateProgress(i, segments.length);
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: segments[i],
                    voiceId,
                    apiKey: ELEVENLABS_API_KEY
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur API : ${errorData.error || response.statusText}`);
            }

            blobs.push(await response.blob());
        }

        const combinedBlob = new Blob(blobs, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(combinedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'livre_saint.mp3';
        a.click();
        URL.revokeObjectURL(url);

        status.textContent = 'Téléchargement terminé !';
    } catch (error) {
        status.textContent = `Erreur : ${error.message}`;
    } finally {
        downloadButton.disabled = false;
        progress.classList.add('hidden');
    }
});
