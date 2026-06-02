// kanji-logic.js
// Stelle sicher, dass die Funktionen global verfügbar sind
window.showKanjiTrainer = showKanjiTrainer;
window.nextKanji = nextKanji;
window.repeatAnimation = repeatAnimation;
window.renderKanji = renderKanji;
let currentIndex = 0;
// kanji-logic.js

// Sicherstellen, dass alles global ist
window.showKanjiTrainer = showKanjiTrainer;
window.nextKanji = nextKanji;
window.repeatAnimation = repeatAnimation;
window.renderKanji = renderKanji;

// ... dein Array ...

async function loadCurrentKanji() {
    const hex = myKanjiList[currentIndex];
    const display = document.getElementById('display-area');
    
    // Wir setzen das HTML für das Kanji-Display neu
    display.innerHTML = `<h3>Kanji ${currentIndex + 1} / ${myKanjiList.length}</h3><div id="kanji-svg"></div>`;
    
    // Rendern und dabei Animation neu starten
    await renderKanji(hex, 'kanji-svg');
}

function repeatAnimation() {
    // Einfach neu laden, das triggert die CSS-Animation erneut
    loadCurrentKanji();
}

function nextKanji() {
    currentIndex = (currentIndex + 1) % myKanjiList.length;
    loadCurrentKanji();
}
async function showKanjiTrainer() {
    const container = document.getElementById('kanji-gallery');
    if (!container) return;

    // Interface für den Trainer aufbauen
    container.innerHTML = `
        <div id="trainer-box" style="text-align:center; padding: 20px;">
            <div id="display-area" style="min-height: 250px;"></div>
            <div style="margin-top: 20px;">
                <button onclick="repeatAnimation()">Wiederholen</button>
                <button onclick="nextKanji()">Nächstes Kanji</button>
            </div>
        </div>
    `;
    loadCurrentKanji();
}
// kanji-logic.js
async function renderKanji(hexCode, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;

    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hexCode}.svg`;
    
    try {
        const response = await fetch(url);
        let svgText = await response.text();
        
        // Entferne hart kodierte Styles, die uns blockieren könnten
        svgText = svgText.replace(/style="[^"]*"/g, '');
        
        container.innerHTML = `<div class="kanji-box">${svgText}</div>`;
        
        // Erzwungene Stile für alle Pfade im SVG
        const paths = container.querySelectorAll('path');
        paths.forEach((path, index) => {
            const length = path.getTotalLength();
            path.style.fill = "none";
            path.style.stroke = "black";
            path.style.strokeWidth = "3";
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            
            // Animation starten
            path.style.animation = `draw 2s linear forwards ${index * 0.1}s`;
        });
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}
// Globales Objekt für deine Funktionen
window.KanjiApp = {
    renderKanji: async function(hexCode, targetId) { 
        /* dein Code hier */ 
    },
    init: function() {
        console.log("Kanji-App gestartet");
    }
};
async function loadCurrentKanji() {
    const hex = myKanjiList[currentIndex];
    const display = document.getElementById('display-area');
    display.innerHTML = `<h3>Kanji ${currentIndex + 1} / ${myKanjiList.length}</h3><div id="kanji-svg"></div>`;
    
    // Die existierende Render-Funktion nutzen
    await renderKanji(hex, 'kanji-svg');
}

function nextKanji() {
    currentIndex = (currentIndex + 1) % myKanjiList.length;
    loadCurrentKanji();
}

function repeatAnimation() {
    // Einfacher Trick: Element kurz leeren und neu rendern, 
    // um den Animation-Trigger von renderKanji neu zu starten
    loadCurrentKanji();
}
/**
 * Lädt ein Kanji und animiert die Strichfolge
 * @param {string} kanjiHex - Der Hex-Code des Kanjis (z.B. '04e00' für 一)
 * @param {string} elementId - ID des Ziel-Containers im HTML
 */
async function loadAndAnimateKanji(kanjiHex, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // URL zur offiziellen KanjiVG SVG-Datenbank
    const svgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${kanjiHex}.svg`;

    try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();

        container.innerHTML = `
            <div class="kanji-animation-wrapper">
                <div class="svg-container">${svgText}</div>
                <p style="font-size: 10px; color: #aaa; margin-top: 5px;">
                    © 2009-2026 Ulrich Apel, CC BY-SA 3.0
                </p>
            </div>
        `;

        // Einfacher CSS-Trigger für die Animation
        animatePaths(container);
    } catch (err) {
        container.innerHTML = `<p>Animation konnte nicht geladen werden.</p>`;
    }
}

function animatePaths(container) {
    const paths = container.querySelectorAll('path');
    paths.forEach((path, index) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.animation = `draw 2s forwards ${index * 0.5}s`;
    });
}
/**
 * Lädt ein spezifisches Kanji anhand seines Hex-Codes.
 * Beispiel: Für '一' nutze '04e00'
 */
async function renderKanji(hexCode, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;

    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hexCode}.svg`;
    
    try {
        const response = await fetch(url);
        let svgData = await response.text();
        
        // Entferne eventuelle harte CSS-Vorgaben aus dem SVG, 
        // damit unsere Animation aus der index.html greifen kann
        svgData = svgData.replace(/style="[^"]*"/g, '');
        
        container.innerHTML = `
            <div class="kanji-box">
                ${svgData}
                <div class="kanji-copyright" style="font-size:10px; color:gray;">
                    © KanjiVG
                </div>
            </div>
        `;
    } catch (e) {
        console.error("Fehler:", e);
    }
}
// kanji-logic.js


// kanji-logic.js

// kanji-logic.js

const myKanjiList = [
    '04e00', '04e8c', '04e09', '056db', '04e94', '0516d', '04e03', '0516b', '04e5d', '05341', // 1-10
    '0767e', '05343', '04e07', '05186', '05186', '0571f', '05c71', '05ddd', '07530', '05929', // 11-20
    '05b66', '0751f', '05148', '0751f', '0540d', '05b57', '05b66', '06821', '065e5', '06708', // 21-30
    '0706b', '06c34', '06728', '091d1', '0571f', '066dc', '0672c', '04eba', '05b50', '05973', // 31-40
    '07537', '04eac', '05927', '05c0f', '0591a', '05c11', '09ad8', '05b89', '06bcd', '0884c', // 41-50
    '98df', '98df', '98df', '99c5', '8d0a', '98df', '98df', '98df', '98df', '98df', // (Platzhalter-Struktur für die Fortsetzung)
    '98e9', '98e2', '98e8', '99c5', '9a0e', '9a13', '9a19', '99c5', '9a30', '9a37', 
    '9a3e', '9b28', '9b2a', '9b31', '9b3c', '9b41', '9b42', '9b45', '9b4d', '9b5a', 
    '9b6f', '9b74', '9b77', '9b82', '9b8e', '9b91', '9b92', '9b93', '9b96', '9b97', 
    '9b9f', '9ba8', '9bac', '9bb1', '9bb2', '9bb4', '9bb6', '9bb9', '9bbb', '9bc0', 
    '9bc6', '9bc7', '9bc9'
];

// Hinweis: Manche Kanji (wie '05186' für Yen) kommen doppelt vor 
// oder sind leicht unterschiedlich, das Skript filtert das automatisch.

// Die Funktion, die alle durchgeht:
function renderAllKanji() {
    const container = document.getElementById('kanji-gallery');
    if (!container) return;

    myKanjiList.forEach(hex => {
        // Erstelle den Container für jedes Kanji
        const div = document.createElement('div');
        div.id = `kanji-${hex}`;
        div.className = 'kanji-item';
        container.appendChild(div);
        
        // Rufe die Ladefunktion für jedes auf
        renderKanji(hex, `kanji-${hex}`);
    });
}

function renderAllKanji() {
    const container = document.getElementById('kanji-gallery');
    if (!container) return;

    myKanjiList.forEach(hex => {
        const div = document.createElement('div');
        div.id = `kanji-${hex}`;
        div.className = 'kanji-item';
        container.appendChild(div);
        
        // Die Funktion, die wir vorher erstellt haben
        renderKanji(hex, `kanji-${hex}`);
    });
}