const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const playButton = document.getElementById('playButton');
const downloadButton = document.getElementById('downloadButton');
const status = document.getElementById('status');

let voices = [];

// Charger les voix disponibles
function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

speechSynthesis.onvoiceschanged = loadVoices;

// Lire le texte
playButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[voiceSelect.value];
    utterance.voice = selectedVoice;
    utterance.onend = () => {
        status.textContent = 'Lecture terminée.';
        downloadButton.disabled = false;
    };
    utterance.onerror = () => {
        status.textContent = 'Erreur lors de la lecture.';
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    status.textContent = 'Lecture en cours...';
});

// Télécharger en MP3 via une API (exemple avec gTTS via proxy)
downloadButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    status.textContent = 'Génération du MP3 en cours...';
    downloadButton.disabled = true;

    try {
        // Utiliser une API comme gTTS via un proxy (remplacez l'URL par votre propre proxy ou service)
        const response = await fetch('https://api.gtts.io/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                lang: voices[voiceSelect.value].lang.split('-')[0] || 'fr',
            }),
        });

        if (!response.ok) throw new Error('Erreur lors de la génération du MP3.');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texte_lu.mp3';
        a.click();
        URL.revokeObjectURL(url);

        status.textContent = 'Téléchargement terminé !';
    } catch (error) {
        status.textContent = `Erreur : ${error.message}`;
    } finally {
        downloadButton.disabled = false;
    }
});
