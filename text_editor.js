class TextEditor {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.text = "";
    this.cursorX = 0;
    this.cursorY = 0;
    this.fontFamily = "Arial";
    this.fontSize = 12;
    this.textColor = "#000000";
    this.isBold = false;
    this.isItalic = false;
    this.isUnderlined = false;
    this.selectionEnd = null;
    this.selectionStart = null;
    this.blinkInterval = null;
    this.showCursor = true;
    this.cursorLine = 0;
    this.cursorCol = 0;
    this.lineHeight = 20;
    this.paddingTop = 10;
    this.paddingLeft = 10;
    this.charWidth = 8; // avg. char width
    this.lines = [""];
    this.setupEventListeners();
    this.startCursorBlink();
    this.render();
  }
  setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    //Toolbar event listeners
    document.getElementById("font-family").addEventListener("change", (e) => {
      this.fontFamily = e.target.value;
      this.render();
    });
    document.getElementById("font-size").addEventListener("change", (e) => {
      this.fontSize = e.target.value;
      this.render();
    });
    document.getElementById("bold-btn").addEventListener("click", (e) => {
      this.isBold = !this.isBold;
      document
        .getElementById("bold-btn")
        .classList.toggle("active", this.isBold);
      this.render();
    });
    document.getElementById("italic-btn").addEventListener("click", (e) => {
      this.isItalic = !this.isItalic;
      document
        .getElementById("italic-btn")
        .classList.toggle("active", this.isItalic);
      this.render();
    });
    document.getElementById("underline-btn").addEventListener("click", (e) => {
      this.isUnderlined = !this.isUnderlined;
      document
        .getElementById("underline-btn")
        .classList.toggle("active", this.isUnderlined);
      this.render();
    });
    document
      .getElementById("text-color-picker")
      .addEventListener("change", (e) => {
        this.textColor = e.target.value;
        this.render();
      });
    document.getElementById("clear-btn").addEventListener("click", (e) => {
      this.setText("");
    });
  }
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const lineIndex = Math.floor((mouseY - this.paddingTop) / this.lineHeight);
    if (lineIndex >= 0 && lineIndex < this.lines.length) {
      this.cursorLine = lineIndex;
      const line = this.lines[lineIndex];
      const x = mouseX - this.paddingLeft;
      const charIndex = Math.round(x / this.charWidth);
      this.cursorCol = Math.max(0, Math.min(charIndex, line.length));
      this.selectionStart = {
        line: this.cursorLine,
        col: this.cursorCol,
      };
      this.selectionEnd = null;
      this.updateCursorStatus();
      this.render();
    }
  }
  handleKeyDown(e) {
    switch (e.key) {
      case "ArrowLeft":
        this.moveCursorLeft(e.shiftKey);
        break;
      case "ArrowRight":
        this.moveCursorRight(e.shiftKey);
        break;
      case "ArrowUp":
        this.moveCursorUp(e.shiftKey);
        break;
      case "ArrowDown":
        this.moveCursorDown(e.shiftKey);
        break;
      case "Backspace":
        this.handleBackspace();
        break;
      case "Delete":
        this.handleDelete();
        break;
      case "Enter":
        this.handleEnter();
        e.preventDefault();
        break;
      case "Tab":
        this.handleTab();
        e.preventDefault();
        break;
      default:
        if (e.ctrlKey || e.metaKey) {
          if (e.key === "c") {
            this.copySelectedText();
          } else if (e.key === "v") {
            this.pasteText();
          } else if (e.key === "x") {
            this.cutSelectedText();
          } else if (e.key === "a") {
            this.selectAll();
          } else if (e.key === "b") {
            this.isBold = !this.isBold;
            document
              .getElementById("bold-btn")
              .classList.toggle("active", this.isBold);
            this.render();
            e.preventDefault();
          } else if (e.key === "i") {
            this.isItalic = !this.isItalic;
            document
              .getElementById("italic-btn")
              .classList.toggle("active", this.isItalic);
            this.render();
            e.preventDefault();
          } else if (e.key === "u") {
            this.isUnderlined = !this.isUnderlined;
            document
              .getElementById("underline-btn")
              .classList.toggle("active", this.isUnderlined);
            this.render();
            e.preventDefault();
          }
        } else {
          const char = String.fromCharCode(e.which);
          this.insertText(char);
          e.preventDefault();
        }
    }
  }
  insertText(text) {
    if (this.hasSelection()) {
      this.deleteSelection();
    }
    const line = this.lines[this.cursorLine];
    this.lines[this.cursorLine] =
      line.substring(0, this.cursorCol) + text + line.substring(this.cursorCol);
    this.cursorCol += text.length;
    this.updateCursorStatus();
    this.render();
  }
  handleMouseUp(e) {
    if (this.selectionStart && !this.selectionEnd) {
      this.selectionEnd = {
        line: this.cursorLine,
        col: this.cursorCol,
      };
    }
    if (
      this.selectionStart &&
      this.selectionEnd &&
      this.selectionStart.col === this.selectionEnd.col &&
      this.selectionStart.line === this.selectionEnd.line
    ) {
      this.selectionStart = null;
      this.selectionEnd = null;
    }
    this.updateCursorStatus();
    this.render();
  }
  handleMouseMove(e) {
    if (e.button === 1 && this.selectionStart) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const lineIndex = Math.floor(
        (mouseY - this.paddingTop) / this.lineHeight
      );
      if (lineIndex >= 0 && lineIndex < this.lines.length) {
        const line = this.lines[lineIndex];
        const x = mouseX - this.paddingLeft;
        let charIndex = Math.round(x / this.charWidth);
        charIndex = Math.max(0, Math.min(charIndex, line.length));
        this.cursorLine = lineIndex;
        this.cursorCol = charIndex;
        this.selectionEnd = {
          line: lineIndex,
          col: charIndex,
        };
        this.updateCursorStatus();
        this.render();
      }
    }
  }
  handleBackspace() {
    if (this.hasSelection()) {
      this.deleteSelection();
      return;
    }
    if (this.cursorCol > 0) {
      const line = this.lines[this.cursorLine];
      this.lines[this.cursorLine] =
        line.substring(0, this.cursorCol - 1) + line.substring(this.cursorCol);
      this.cursorCol--;
    } else if (this.cursorLine > 0) {
      const currentLineText = this.lines[this.cursorLine];
      const prevLineText = this.lines[this.cursorLine - 1];
      this.cursorCol = prevLineText.length;
      this.lines[this.cursorLine - 1] = prevLineText + currentLineText;
      this.lines.splice(this.cursorLine, 1);
      this.cursorLine--;
    }
    this.updateCursorStatus();
    this.render();
  }
  deleteSelection() {
    if (!this.hasSelection()) {
      return;
    }
    const { start, end } = this.normalizeSelection();
    if (start.line === end.line) {
      const line = this.lines[start.line];
      this.lines[start.line] =
        line.substring(0, start.col) + line.substring(end.col);
    }
    const startLine = this.lines[start.line];
    const endLine = this.lines[end.line];
    this.lines[start.line] =
      startLine.substring(0, start.col) + endLine.substring(end.col);
    this.lines.splice(start.lines + 1, end.line - start.line);
    this.cursorLine = start.line;
    this.cursorCol = start.col;
    this.selectionStart = null;
    this.selectionEnd = null;
    this.updateCursorStatus();
    this.render();
  }
  hasSelection() {
    return (
      this.selectionStart &&
      this.selectionEnd &&
      (this.selectionStart.line !== this.selectionEnd.line ||
        this.selectionStart.col !== this.selectionEnd.col)
    );
  }
  pasteText() {
    navigator.clipboard
      .readText()
      .then((text) => {
        if (text) {
          this.insertText(text);
        }
      })
      .catch((err) => {
        console.error("Failed to paste text: ", err);
      });
  }
  copySelectedText() {
    const text = this.getSelectedText();
    if (text) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Failed to copy text: ", err);
      });
    }
  }
  cutSelectedText() {
    this.copySelectedText();
    this.deleteSelection();
  }
  getSelectedText() {
    if (!this.hasSelection()) {
      return "";
    }
    const { start, end } = this.normalizeSelection();
    if (start.line === end.line) {
      return this.lines[start.line].substring(start.col, end.col);
    }
    let selectedText = this.lines[start.line].substring(start.col) + "\n";
    for (let i = start.line + 1; i < end.line; i++) {
      selectedText += this.lines[i] + "\n";
    }
    selectedText = this.lines[end.line].substring(0, end.col);
    return selectedText;
  }
  selectAll() {
    this.selectionStart = {
      line: 0,
      col: 0,
    };
    this.selectionEnd = {
      line: this.lines.length - 1,
      col: this.lines[this.lines.length - 1].length,
    };
    this.cursorLine = this.lines.length - 1;
    this.cursorCol = this.lines[this.lines.length - 1].length;
    this.updateCursorStatus();
    this.render();
  }
  startCursorBlink() {
    this.stopCursorBlink();
    this.blinkInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
      this.render();
    }, 500);
  }
  stopCursorBlink() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
  }
  handleTab() {
    this.insertText("    "); // 4 spaces
  }
  handleEnter() {
    if (this.hasSelection()) {
      this.deleteSelection();
      return;
    }
    const currentLine = this.lines[this.cursorLine];
    const textBeforeCursor = currentLine.substring(0, this.cursorCol);
    const textAfterCursor = currentLine.substring(this.cursorCol);
    this.lines[this.cursorLine] = textBeforeCursor;
    this.lines.splice(this.cursorLine + 1, 0, textAfterCursor);
    this.cursorLine++;
    this.cursorCol = 0;
    this.updateCursorStatus();
    this.render();
  }
  handleDelete() {
    if (this.hasSelection()) {
      this.deleteSelection();
      return;
    }
    const line = this.lines[this.cursorLine];
    if (this.cursorCol < line.length) {
      this.lines[this.cursorLine] =
        line.substring(0, this.cursorCol) + line.substring(this.cursorCol + 1);
    } else if (this.cursorLine < this.lines.length - 1) {
      const nextLineText = this.lines[this.cursorLine + 1];
      this.lines[this.cursorCol] = line + nextLineText;
      this.lines.splice(this.cursorLine + 1, 1);
    }
    this.render();
  }
  moveCursorLeft(shiftKey = false) {
    if (!shiftKey && this.hasSelection()) {
      const { start } = this.normalizeSelection();
      this.cursorLine = start.line;
      this.cursorCol = start.col;
      this.selectionStart = null;
      this.selectionEnd = null;
    } else {
      if (this.cursorCol > 0) {
        this.cursorCol--;
      } else if (this.cursorLine > 0) {
        this.cursorLine--;
        this.cursorCol = this.lines[this.cursorLine].length;
      }
      if (shiftKey) {
        this.updateSelection();
      } else {
        this.selectionStart = null;
        this.selectionEnd = null;
      }
    }
    this.updateCursorStatus();
    this.render();
  }
  moveCursorRight(shiftKey = false) {
    if (!shiftKey && this.hasSelection()) {
      const { end } = this.normalizeSelection();
      this.cursorLine = end.line;
      this.cursorCol = end.col;
      this.selectionStart = null;
      this.selectionEnd = null;
    } else {
      const line = this.lines[this.cursorLine];
      if (this.cursorCol < line.length) {
        this.cursorCol++;
      } else if (this.cursorLine < this.lines.length) {
        this.cursorLine++;
        this.cursorCol = 0;
      }
      if (shiftKey) {
        this.updateSelection();
      } else {
        this.selectionStart = null;
        this.selectionEnd = null;
      }
    }
    this.updateCursorStatus();
    this.render();
  }
  moveCursorUp(shiftKey = false) {
    if (this.cursorLine > 0) {
      this.cursorLine--;
      const line = this.lines[this.cursorLine];
      this.cursorCol = Math.min(this.cursorCol, line.length);
      if (shiftKey) {
        this.updateSelection();
      } else {
        this.selectionStart = null;
        this.selectionEnd = null;
      }
    }
    this.updateCursorStatus();
    this.render();
  }
  moveCursorDown(shiftKey = false) {
    if (this.cursorLine < this.lines.length - 1) {
      this.cursorLine++;
      const line = this.lines[this.cursorLine];
      this.cursorCol = Math.min(this.cursorCol, line.length);
      if (shiftKey) {
        this.updateSelection();
      } else {
        this.selectionStart = null;
        this.selectionEnd = null;
      }
    }
    this.updateCursorStatus();
    this.render();
  }
  updateSelection() {
    if (!this.selectionStart) {
      this.selectionStart = {
        line: this.cursorLine,
        col: this.cursorCol,
      };
    }
    this.selectionEnd = {
      line: this.cursorLine,
      col: this.cursorCol,
    };
  }
  normalizeSelection() {
    if (!this.selectionStart || !this.selectionEnd) {
      return { start: null, end: null };
    }
    const start = { ...this.selectionStart };
    const end = { ...this.selectionEnd };
    if (
      start.line > end.line ||
      (start.line === end.line && start.col > end.col)
    ) {
      return { start: end, end: start };
    }
    return { start, end };
  }
  updateCursorStatus() {
    document.getElementById("cursor-position").textContent = `Line: ${
      this.cursorLine + 1
    }, Column: ${this.cursorCol + 1}`;
    document.getElementById("word-count").textContent =
      `Word Count: ${this.lines.reduce(
        (acc, e) => acc + e.split(" ").length,
        0
      )}`;
    document.getElementById("character-count").textContent =
      `Character Count: ${this.lines.reduce((acc, e) => acc + e.length, 0)}`;
    document.getElementById("line-count").textContent =
      `Line Count: ${this.lines.length}`;
    const selectionInfo = document.getElementById("selection-info");
    if (this.hasSelection()) {
      const selectedText = this.getSelectedText();
      selectionInfo.textContent = `Selection: ${selectedText.length} chars`;
    } else {
      selectionInfo.textContent = "";
    }
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = this.getFontString();
    this.ctx.fillStyle = this.textColor;
    this.ctx.textBaseline = "top";
    const metrics = this.ctx.measureText(" ");
    this.charWidth = metrics.width;
    if (this.hasSelection()) {
      const { start, end } = this.normalizeSelection();
      this.drawSelectionBackground(start, end);
    }
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const y = this.paddingTop + i * this.lineHeight;
      this.ctx.fillText(line, this.paddingLeft, y);
      if (this.isUnderlined) {
        const textWidth = this.ctx.measureText(line).width;
        const lineY = y + this.fontSize + 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.paddingLeft, lineY);
        this.ctx.lineTo(this.paddingLeft + textWidth, lineY);
        this.ctx.strokeStyle = this.textColor;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }
    if (this.showCursor && !this.hasSelection()) {
      this.drawCursor();
    }
  }
  getFontString() {
    let fontStyle = "";
    if (this.isBold) fontStyle += "bold ";
    if (this.isItalic) fontStyle += "italic ";
    return `${fontStyle}${this.fontSize}px ${this.fontFamily}`;
  }
  drawSelectionBackground() {}
  drawCursor() {
    const line = this.lines[this.cursorLine];
    const cursorText = line.substring(0, this.cursorCol);
    const x = this.paddingLeft + this.ctx.measureText(cursorText).width;
    const y = this.paddingTop + this.cursorLine * this.lineHeight;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y + this.lineHeight);
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  setText(text) {
    this.lines = text.split("\n");
    if (this.lines.length === 0) {
      this.lines = [""];
    }
    this.selectionStart = null;
    this.selectionEnd = null;
    this.cursorLine = 0;
    this.cursorCol = 0;
    this.updateCursorStatus();
    this.render();
  }
  getText() {
    return this.lines.join("\n");
  }
}
