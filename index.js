window.addEventListener("load", () => {
  keyboardHelper.setupTooltips();
  const editor = new TextEditor("editor-canvas");
  editor.setText(
    "Welcome to Canvas Text Editor!\nThis is a simple text editor built using HTML5 Canvas.\nYou can type, select, edit, and format text here."
  );
  window.editor = editor;
});
