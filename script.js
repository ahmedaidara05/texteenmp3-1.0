const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('languageSelect');
const voiceSelect = document.getElementById('voiceSelect');
const playButton = document.getElementById('playButton');
const downloadButton = document.getElementById('downloadButton');
const status = document.getElementById('status');

// Liste des voix par langue (basée sur ttsMP3.com)
const voicesByLanguage = {
    fr: [
        { name: 'Léa (Français)', value: 'fr-fr_1' },
        { name: 'Mathieu (Français)', value: 'fr-fr_2' }
    ],
    en: [
        { name: 'Joanna (Anglais US)', value: 'en-us_1' },
        { name: 'Matthew (Anglais US)', value: 'en-us_2' },
        { name: 'Emma (Anglais UK)', value: 'en-uk_1' }
    ],
    ar: [
        { name: 'Zeina (Arabe)', value: 'ar_1' },
        { name: 'Hala (Arabe)', value: 'ar_2' }
    ]
};

// Mettre à jour les voix en fonction de la langue
function updateVoices() {
    const lang = languageSelect.value;
    voiceSelect.innerHTML = '';
    voicesByLanguage[lang].forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.value;
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
}

// Initialiser les voix
languageSelect.addEventListener('change', updateVoices);
updateVoices();

// Lire le texte via ttsMP3.com
playButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    const lang = languageSelect.value;
    const voice = voiceSelect.value;

    status.textContent = 'Lecture en cours...';
    playButton.disabled = true;

    try {
        const response = await fetch(`https://ttsmp3.com/makemp3_new.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                msg: text,
                lang: voice,
                source: 'ttsmp3'
            })
        });

        const data = await response.json();
        if (data.Error !== 0) throw new Error('Erreur lors de la génération audio.');

        const audio = new Audio(data.URL);
        audio.play();
        audio.onended = () => {
            status.textContent = 'Lecture terminée.';
            playButton.disabled = false;
        };
        audio.onerror = () => {
            status.textContent = 'Erreur lors de la lecture.';
            playButton.disabled = false;
        };
    } catch (error) {
        status.textContent = `Erreur : ${error.message}`;
        playButton.disabled = false;
    }
});

// Télécharger en MP3
downloadButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Veuillez entrer du texte.';
        return;
    }

    const lang = languageSelect.value;
    const voice = voiceSelect.value;

    status.textContent = 'Génération du MP3 en cours...';
    downloadButton.disabled = true;

    try {
        const response = await fetch(`https://ttsmp3.com/makemp3_new.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                msg: text,
                lang: voice,
                source: 'ttsmp3'
            })
        });

        const data = await response.json();
        if (data.Error !== 0) throw new Error('Erreur lors de la génération du MP3.');

        const a = document.createElement('a');
        a.href = data.URL;
        a.download = 'livre_saint.mp3';
        a.click();

        status.textContent = 'Téléchargement terminé !';
    } catch (error) {
        status.textContent = `Erreur : ${error.message}`;
    } finally {
        downloadButton.disabled = false;
    }
});
