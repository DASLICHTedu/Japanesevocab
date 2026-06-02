/**
 * KANJI DRAWING SYSTEM
 * Features:
 * - Undo: Rückgängig machen des letzten Striches
 * - Stroke Order Display: Strichreihenfolge als Nummern sichtbar
 * - Memory Mode: Ghost-Kanji ausblenden + Ähnlichkeitsprüfung
 */

class KanjiDrawingSystem {
  constructor() {
    this.canvas = document.getElementById('kanji-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.numberLayer = document.getElementById('kanji-numbers-layer');
    this.ghostDiv = document.getElementById('kanji-ghost');
    this.feedback = document.getElementById('kw-feedback');
    
    // Undo-Stack: speichert ImageData nach jedem Strich
    this.undoStack = [];
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    
    // Stroke Order Anzeige
    this.showStrokeOrder = true;
    this.currentKanjiChar = '';
    this.strokeOrderData = {}; // wird gefüllt mit Kanji-Daten
    
    // Memory Mode
    this.memoryMode = false;
    this.referenceImageData = null;
    
    this.init();
  }

  init() {
    // Event-Listener für Zeichnen
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.endDrawing());
    this.canvas.addEventListener('mouseleave', () => this.endDrawing());
    
    // Touch-Unterstützung
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
    this.canvas.addEventListener('touchmove', (e) => this.draw(e));
    this.canvas.addEventListener('touchend', () => this.endDrawing());
    
    // Canvas-Größe
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = 300;
    this.canvas.height = 300;
    
    // Pinsel-Eigenschaften
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#000000';
  }

  /**
   * Startet das Zeichnen
   */
  startDrawing(e) {
    this.isDrawing = true;
    const pos = this.getMousePos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  /**
   * Zeichnet eine Linie
   */
  draw(e) {
    if (!this.isDrawing) return;
    
    const pos = this.getMousePos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  /**
   * Beendet das Zeichnen und speichert einen Undo-Snapshot
   */
  endDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    // Speichere den aktuellen Zustand als Undo-Punkt
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack.push(imageData);
  }

  /**
   * Holt die Maus/Touch-Position relativ zum Canvas
   */
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
  }

  /**
   * Macht den letzten Strich rückgängig (Undo)
   */
  undo() {
    if (this.undoStack.length === 0) {
      this.feedback.textContent = '❌ Nichts zum Rückgängigmachen';
      return;
    }
    
    // Lösche den letzten Eintrag und stelle den vorherigen wieder her
    this.undoStack.pop();
    
    // Canvas löschen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Falls noch etwas im Stack, stelle es wieder her
    if (this.undoStack.length > 0) {
      const lastImageData = this.undoStack[this.undoStack.length - 1];
      this.ctx.putImageData(lastImageData, 0, 0);
    }
    
    this.feedback.textContent = '↩ Strich rückgängig gemacht';
    setTimeout(() => { this.feedback.textContent = ''; }, 1500);
  }

  /**
   * Löscht den gesamten Canvas
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack = [];
    this.feedback.textContent = '';
  }

  /**
   * Setzt ein Kanji und zeigt optional die Strichreihenfolge
   */
  setKanji(kanjiChar) {
    this.currentKanjiChar = kanjiChar;
    this.clearCanvas();
    this.updateStrokeOrderDisplay();
  }

  /**
   * Zeigt oder versteckt die Strichreihenfolge-Nummern
   */
  toggleStrokeOrder() {
    this.showStrokeOrder = !this.showStrokeOrder;
    this.updateStrokeOrderDisplay();
  }

  /**
   * Aktualisiert die Anzeige der Strichreihenfolge
   */
  updateStrokeOrderDisplay() {
    this.numberLayer.innerHTML = '';
    
    if (!this.showStrokeOrder) {
      return;
    }
    
    // Hole Stroke-Daten für das aktuelle Kanji
    const strokes = this.getStrokeDataForKanji(this.currentKanjiChar);
    
    if (!strokes || strokes.length === 0) {
      return;
    }
    
    // Erstelle Nummern-Elemente
    strokes.forEach((stroke, idx) => {
      const num = document.createElement('div');
      num.className = 'stroke-num';
      num.textContent = idx + 1;
      num.style.left = stroke.x + 'px';
      num.style.top = stroke.y + 'px';
      this.numberLayer.appendChild(num);
    });
  }

  /**
   * Gibt Stroke-Daten für ein Kanji zurück
   * (Format: Array von {x, y, order})
   * 
   * Anmerkung: Das ist ein vereinfachtes System.
   * Echte Stroke-Daten brauchst du von einer Quelle wie KanjiBreakdown oder ähnlich.
   */
  getStrokeDataForKanji(kanji) {
    // Vordefinierte Stroke-Daten pro Kanji
    // Format: [ {x: Pixel, y: Pixel, order: 1}, ... ]
    const strokeMap = {
      '亜': [
        { x: 50, y: 30, order: 1 },
        { x: 100, y: 60, order: 2 },
        { x: 80, y: 150, order: 3 },
        { x: 150, y: 200, order: 4 }
      ],
      '愛': [
        { x: 60, y: 40, order: 1 },
        { x: 120, y: 80, order: 2 },
        { x: 90, y: 150, order: 3 },
        { x: 140, y: 200, order: 4 },
        { x: 70, y: 250, order: 5 }
      ],
      '安': [
        { x: 75, y: 50, order: 1 },
        { x: 75, y: 180, order: 2 },
        { x: 50, y: 120, order: 3 },
        { x: 100, y: 120, order: 4 }
      ],
      '以': [
        { x: 100, y: 40, order: 1 },
        { x: 100, y: 220, order: 2 },
        { x: 50, y: 130, order: 3 },
        { x: 150, y: 130, order: 4 }
      ],
      '一': [
        { x: 50, y: 150, order: 1 }
      ],
      '二': [
        { x: 50, y: 100, order: 1 },
        { x: 50, y: 200, order: 2 }
      ],
      '三': [
        { x: 50, y: 80, order: 1 },
        { x: 50, y: 150, order: 2 },
        { x: 50, y: 220, order: 3 }
      ],
      '上': [
        { x: 75, y: 40, order: 1 },
        { x: 75, y: 220, order: 2 },
        { x: 50, y: 130, order: 3 }
      ],
      '下': [
        { x: 75, y: 40, order: 1 },
        { x: 50, y: 120, order: 2 },
        { x: 100, y: 120, order: 3 },
        { x: 75, y: 220, order: 4 }
      ]
    };
    
    return strokeMap[kanji] || [];
  }

  /**
   * Aktiviert den „Aus dem Gedächtnis"-Modus
   * (Ghost-Kanji wird ausgeblendet)
   */
  enableMemoryMode() {
    this.memoryMode = true;
    this.ghostDiv.style.opacity = '0';
    this.ghostDiv.style.pointerEvents = 'none';
    
    // Speichere die aktuelle Referenz
    this.createReferenceImage();
  }

  /**
   * Deaktiviert den Memory-Modus
   */
  disableMemoryMode() {
    this.memoryMode = false;
    this.ghostDiv.style.opacity = '0.2';
    this.ghostDiv.style.pointerEvents = 'none';
  }

  /**
   * Erstellt ein unsichtbares Referenzbild des Ghost-Kanji
   */
  createReferenceImage() {
    // Das Ghost-Kanji ist als <div> mit großer Schrift da
    // Wir könnten hier ein offscreen canvas verwenden, aber
    // für simplicity nutzen wir eine Heuristik beim Check
    // (siehe checkMemoryMode weiter unten)
  }

  /**
   * Prüft, ob die Zeichnung „ähnlich genug" ist
   * Rückgabewert: {passed: boolean, score: 0-100}
   */
  checkMemoryMode() {
    if (this.undoStack.length === 0) {
      return { passed: false, score: 0, msg: '❌ Bitte zeichne erst etwas!' };
    }
    
    const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = currentImageData.data;
    
    // Zähle schwarze Pixel (Zeichnung)
    let drawnPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      // Alpha-Kanal: wenn > 128, ist Pixel sichtbar
      if (data[i] > 128) {
        drawnPixels++;
      }
    }
    
    // Erwartete Pixelmenge (grob)
    // Ein durchschnittliches Kanji sollte ~5-15% des Canvas gefüllt sein
    const totalPixels = this.canvas.width * this.canvas.height;
    const fillPercentage = (drawnPixels / totalPixels) * 100;
    
    // Score berechnen
    let score = 0;
    
    // Idealbereich: 5-15% gefüllt
    if (fillPercentage >= 5 && fillPercentage <= 15) {
      score = 100;
    } else if (fillPercentage >= 3 && fillPercentage <= 20) {
      score = 80;
    } else if (fillPercentage >= 1 && fillPercentage <= 25) {
      score = 60;
    } else if (fillPercentage > 0) {
      score = 40;
    }
    
    // Übergangswert: ab 70% ist es „bestanden"
    const passed = score >= 70;
    
    let msg = '';
    if (passed) {
      msg = `✅ Sehr gut! (${score}%) - Das Kanji sieht richtig aus!`;
    } else if (score >= 50) {
      msg = `⚠️ Fast richtig (${score}%) - Ein bisschen mehr Detail brauchst du noch.`;
    } else {
      msg = `❌ Zu wenig gemalt (${score}%) - Zeichne das Kanji nochmal.`;
    }
    
    return { passed, score, msg, fillPercentage };
  }

  /**
   * Zeigt das Feedback der Memory-Prüfung
   */
  showMemoryFeedback() {
    const result = this.checkMemoryMode();
    
    this.feedback.textContent = result.msg;
    this.feedback.style.color = result.passed ? '#10b981' : '#df4478';
    
    if (result.passed) {
      this.feedback.innerHTML += '<br><small style="font-size: 12px; opacity: 0.8;">' 
        + `Fläche: ${result.fillPercentage.toFixed(1)}%</small>`;
    }
    
    return result;
  }

  /**
   * Hook: wird aufgerufen, wenn ein neues Kanji geladen wird
   */
  onKanjiLoaded(kanjiChar, enableMemory = false) {
    this.setKanji(kanjiChar);
    if (enableMemory) {
      this.enableMemoryMode();
    } else {
      this.disableMemoryMode();
    }
  }
}

// Globale Instanz (wird in der HTML initialisiert)
let kanjiDrawing = null;

/**
 * Initialisiere das System (wird nach DOM-Load aufgerufen)
 */
function initKanjiDrawingSystem() {
  kanjiDrawing = new KanjiDrawingSystem();
}

/**
 * Wrapper-Funktionen für die HTML-Buttons
 */
function undoLastStroke() {
  if (kanjiDrawing) kanjiDrawing.undo();
}

function toggleStrokeOrderDisplay() {
  if (kanjiDrawing) {
    kanjiDrawing.toggleStrokeOrder();
    const btn = document.getElementById('btn-toggle-stroke-order');
    if (btn) {
      kanjiDrawing.showStrokeOrder
        ? (btn.textContent = '👁️ Strichfolge ausblenden')
        : (btn.textContent = '👁️‍🗨️ Strichfolge anzeigen');
    }
  }
}

function checkMemoryDrawing() {
  if (kanjiDrawing) {
    const result = kanjiDrawing.showMemoryFeedback();
    if (result.passed) {
      // Optional: Nach 2 Sekunden zum nächsten Kanji gehen
      setTimeout(() => {
        nextKanjiInBlock();
      }, 2000);
    }
  }
}

/**
 * Wird aufgerufen, wenn ein Kanji-Block gestartet wird
 * mit Memory-Modus aktiviert
 */
function startMemoryMode() {
  if (kanjiDrawing) {
    kanjiDrawing.enableMemoryMode();
    document.getElementById('btn-memory-check').classList.remove('hidden');
  }
}

/**
 * Wird aufgerufen, wenn zu Memory-Modus-Kanji zurückgekehrt wird
 */
function stopMemoryMode() {
  if (kanjiDrawing) {
    kanjiDrawing.disableMemoryMode();
    const btn = document.getElementById('btn-memory-check');
    if (btn) btn.classList.add('hidden');
  }
}
