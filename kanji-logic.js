// kanji-logic.js

// --- KANJI DATA BY LEVEL ---
const KANJI_DATA = {
    "N5": [
        // Block 1 & 2 (Basis-Zahlen & Natur)
        '04e00', '04e8c', '04e09', '056db', '04e94', '0516d', '04e03', '0516b', '04e5d', '05341',
        // Block 3 & 4 (Zeit & Elemente)
        '065e5', '06708', '0706b', '06c34', '06728', '091d1', '0571f', '05c71', '05ddd', '07530',
        // Block 5 & 6 (Größen & Richtungen)
        '05927', '04e2d', '05c0f', '04e0a', '04e0b', '05de6', '053f3', '04eba', '05165', '051fa'
    ],
    "N4": [
        // Block 1 & 2 (Gesellschaft & Handeln)
        '04f1a', '0540c', '04e8b', '081ea', '0793e', '0767a', '08005', '05730', '0696d', '065b9',
        // Block 3 & 4 (Zustand & Orte)
        '065b0', '05834', '054e1', '07acb', '0958b', '0624b', '0529b', '0554f', '04ee3', '0660e',
        // Block 5 & 6 (Bewegung)
        '052d5', '04eac', '076ee', '0901a', '08a00', '07406', '04f53', '07530', '04e3b', '0984c'
    ],
    "N3": [
        // Block 1 & 2
        '0653f', '08b70', '05bfe', '90e8', '5408', '5e02', '5185', '76f8', '5b9a', '56de',
        '06848', '073fe', '06700', '5316', '6c11', '6cd5', '5168', '8eab', '901a', '7d22'
    ],
    "N2": [
        // Block 1 & 2
        '0515a', '05354', '07dcf', '0533a', '09818', '06539', '05e9c', '0969b', '0969c', '07d1a',
        '07d42', '05224', '08af8', '05b88', '06a4b', '06295', '04e88', '067fb', '08056', '079c1'
    ],
    "N1": [
        // Block 1 & 2
        '04e59', '04e86', '053c8', '04e0e', '04e08', '051e1', '05203', '052fa', '05301', '05c6f',
        '04e18', '04e1e', '0518d', '05211', '05238', '0524c', '052b9', '05310', '05374', '053ac'
    ]
};

const KANJI_PER_BLOCK = 5;
const BLOCKS_PER_LESSON = 2; // Immer 2 Blöcke = 10 Kanji pro Lektion

let currentLesson = 0;
let currentIndexInLesson = 0;
let hintActive = false;
let lastLevel = null;

// Fortschritt aus Speicher laden
let kanjiMastery = JSON.parse(localStorage.getItem('kanjiMasteryProgress') || '{}');

// --- LESSON LOGIC ---

window.startKanjiLesson = startKanjiLesson; // Exponieren für HTML

function getKanjiForCurrentLesson() {
    const levelList = KANJI_DATA[state.level] || KANJI_DATA["N5"];
    const startIdx = currentLesson * (KANJI_PER_BLOCK * BLOCKS_PER_LESSON);
    const endIdx = startIdx + (KANJI_PER_BLOCK * BLOCKS_PER_LESSON);
    return levelList.slice(startIdx, endIdx);
}

async function loadCurrentKanji() {
    // Check if level has changed since last time
    if (lastLevel !== state.level) {
        currentLesson = 0;
        currentIndexInLesson = 0;
        lastLevel = state.level;
    }

    const lessonKanji = getKanjiForCurrentLesson();
    const hex = lessonKanji[currentIndexInLesson];
    
    if (!hex) {
        alert("Lektion beendet!");
        return;
    }

    // Wir nutzen das Container-System aus der index.html
    const display = document.getElementById('kanji-write-view');
    display.classList.remove('hidden');
    document.getElementById('kanji-blocks-container').classList.add('hidden');

    display.innerHTML = `
        <h3 style="text-align:center; margin-bottom:10px;">Lektion ${currentLesson + 1} - Kanji ${currentIndexInLesson + 1}/10</h3>
        <div class="kanji-canvas-container" style="position:relative; width:300px; height:300px; margin:20px auto; border:2px solid var(--primary-dark); border-radius:12px; background:white;">
            <div id="kanji-svg-wrapper" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity: 0; pointer-events: none; transition: opacity 0.3s; display:flex; align-items:center; justify-content:center;"></div>
            <canvas id="kanji-canvas" width="300" height="300" style="position:absolute; top:0; left:0; z-index:5; cursor:crosshair;"></canvas>
        </div>
        <div class="canvas-actions" style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
            <button class="btn-main btn-small" style="background:var(--primary-light)" onclick="toggleHint()">Tipp</button>
            <button class="btn-main btn-small" style="background:var(--text-light)" onclick="clearCanvas()">Löschen</button>
            <button class="btn-main btn-small" style="background:#10b981" onclick="nextKanji()">Fertig / Nächstes</button>
        </div>
    `;

    hintActive = false; // Reset hint
    await renderKanjiSVG(hex, 'kanji-svg-wrapper');
    initCanvas();
}

async function renderKanjiSVG(hexCode, targetId) {
    const container = document.getElementById(targetId);
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hexCode}.svg`;
    const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(url);

    try {
        const response = await fetch(proxyUrl);
        let svgText = await response.text();
        svgText = svgText.replace(/style="[^"]*"/g, ''); // Clean styles
        container.innerHTML = svgText;

        const paths = container.querySelectorAll('path');
        paths.forEach((path, index) => {
            const length = path.getTotalLength();
            path.style.fill = "none";
            path.style.stroke = "#ccc"; // Ghost color
            path.style.strokeWidth = "8";
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        });
    } catch (e) {
        console.error("Fehler beim Laden des SVGs", e);
    }
}

function toggleHint() {
    hintActive = !hintActive;
    const wrapper = document.getElementById('kanji-svg-wrapper');
    if (!wrapper) return;

    wrapper.style.opacity = hintActive ? "1" : "0";

    if (hintActive) {
        const paths = wrapper.querySelectorAll('path');
        paths.forEach((path, index) => {
            const length = path.getTotalLength();
            path.style.animation = `draw 2s linear forwards ${index * 0.2}s`;
        });
    } else {
        // Reset animation state
        const paths = wrapper.querySelectorAll('path');
        paths.forEach(path => path.style.animation = 'none');
    }
}

function nextKanji() {
    const levelList = KANJI_DATA[state.level] || KANJI_DATA["N5"];
    const lessonKanji = getKanjiForCurrentLesson();
    const currentHex = lessonKanji[currentIndexInLesson];

    // Fortschritt speichern (Mastery erhöhen)
    kanjiMastery[currentHex] = (kanjiMastery[currentHex] || 0) + 1;
    localStorage.setItem('kanjiMasteryProgress', JSON.stringify(kanjiMastery));

    markDayAsPracticed(); // Mark day as practiced when a Kanji lesson is finished
    currentIndexInLesson++;
    
    const levelList = KANJI_DATA[state.level] || KANJI_DATA["N5"];
    
    // Wenn 10 Kanji durch sind oder das Ende der Liste erreicht ist
    if (currentIndexInLesson >= (KANJI_PER_BLOCK * BLOCKS_PER_LESSON) || 
        (currentLesson * 10 + currentIndexInLesson) >= levelList.length) {
        
        // Prüfen, ob es noch weitere Kanjis im aktuellen Level gibt
        if ((currentLesson + 1) * 10 < levelList.length) {
            currentIndexInLesson = 0;
            currentLesson++;
            alert("Lektion abgeschlossen! Hervorragend. Die nächste Lektion wird geladen.");
        } else {
            alert("Wahnsinn! Du hast alle Kanji Lektionen für das Level " + state.level + " erfolgreich absolviert.");
            // Zurück zum Hauptmenü
            currentIndexInLesson = 0;
            currentLesson = 0;
            renderKanjiBlocks(); // Übersicht aktualisieren
            return;
        }
    }
    loadCurrentKanji();
}
// OOM Schutz: Sicherstellen, dass Event-Listener nicht mehrfach angehängt werden
// --- CANVAS DRAWING LOGIC ---

function initCanvas() {
    const canvas = document.getElementById('kanji-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        e.preventDefault();
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
}

function clearCanvas() {
    const canvas = document.getElementById('kanji-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- UI SETUP ---

function renderKanjiBlocks() {
    const container = document.getElementById('kanji-blocks-container');
    if (!container) return;

    const levelList = KANJI_DATA[state.level] || KANJI_DATA["N5"];
    const numLessons = Math.ceil(levelList.length / 10);
    
    let html = '';
    for (let i = 0; i < numLessons; i++) {
        const start = i * 10;
        const lessonKanjis = levelList.slice(start, start + 10);
        
        // Fortschrittsberechnung für die Ampel
        let totalMastery = 0;
        lessonKanjis.forEach(hex => {
            totalMastery += Math.min(kanjiMastery[hex] || 0, 3); // Max 3 Punkte pro Kanji
        });
        const avg = totalMastery / (lessonKanjis.length * 3); // 0 bis 1

        let color = '#ff4d4d'; // Rot (Neu)
        if (avg >= 0.8) color = '#58cc02'; // Grün (Perfekt)
        else if (avg > 0.1) color = '#ffa500'; // Gelb/Orange (In Arbeit)

        html += `
            <div class="option-card" style="border-left: 10px solid ${color}; display: flex; justify-content: space-between; align-items: center;" onclick="startKanjiLesson(${i})">
                <div>
                    <h3 style="margin:0;">Lektion ${i + 1}</h3>
                    <p style="margin:0; font-size:12px;">${lessonKanjis.length} Schriftzeichen</p>
                </div>
                <div style="font-weight: bold; color: ${color};">${Math.round(avg * 100)}%</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    container.classList.remove('hidden');
    document.getElementById('kanji-write-view').classList.add('hidden');
    document.getElementById('kanji-learning-area').classList.add('hidden');
}

function startKanjiLesson(index) {
    currentLesson = index;
    currentIndexInLesson = 0;
    loadCurrentKanji();
}

function showTab(tabName) {
    const schreibenTab = document.getElementById('kanji-schreiben-tab');
    const kanjiView = document.getElementById('view-kanji');
    
    if (tabName === 'kanji') {
        kanjiView.classList.remove('hidden');
        renderKanjiBlocks();
    } else {
        // Andere Tabs logik (falls nötig)
        // kanjiView.classList.add('hidden'); 
    }
}

// Globale Exponierung für HTML onclick
window.showTab = showTab;
window.nextKanji = nextKanji;
window.toggleHint = toggleHint;
window.clearCanvas = clearCanvas;
window.renderKanjiBlocks = renderKanjiBlocks;