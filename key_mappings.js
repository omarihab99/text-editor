const keyboardHelper = {
  getOS: function () {
    return navigator.userAgent.includes("Windows")
      ? "windows"
      : navigator.userAgent.includes("Mac")
        ? "mac"
        : "linux";
  },
  shortcuts: {
    windows: {
      copy: "Ctrl+C",
      cut: "Ctrl+X",
      paste: "Ctrl+V",
      bold: "Ctrl+B",
      italic: "Ctrl+I",
      underline: "Ctrl+U",
      undo: "Ctrl+Z",
      redo: "Ctrl+Y",
      selectAll: "Ctrl+A",
      save: "Ctrl+S",
      open: "Ctrl+O",
      find: "Ctrl+F",
      replace: "Ctrl+H",
    },
    mac: {
      copy: "⌘+C",
      cut: "⌘+X",
      paste: "⌘+V",
      bold: "⌘+B",
      italic: "⌘+I",
      underline: "⌘+U",
      undo: "⌘+Z",
      redo: "⌘+Shift+Z",
      selectAll: "⌘+A",
      save: "⌘+S",
      open: "⌘+O",
      find: "⌘+F",
      replace: "⌘+Option+F",
    },
    linux: {
      copy: "Ctrl+C",
      cut: "Ctrl+X",
      paste: "Ctrl+V",
      bold: "Ctrl+B",
      italic: "Ctrl+I",
      underline: "Ctrl+U",
      undo: "Ctrl+Z",
      redo: "Ctrl+Y",
      selectAll: "Ctrl+A",
      save: "Ctrl+S",
      open: "Ctrl+O",
      find: "Ctrl+F",
      replace: "Ctrl+H",
    },
  },
  getShortcurForAction: function (action) {
    const os = this.getOS();
    return this.shortcuts[os][action] || "";
  },
  setupTooltips: function () {
    const toolbarButtons = document.querySelectorAll(".toolbar button");
    toolbarButtons.forEach((button) => {
      const toolTip = button.querySelector(".tooltip-text");
      const action = button.dataset.action;
      const shortcut = this.getShortcurForAction(action);
      toolTip.textContent = shortcut;
    });
  },
};
