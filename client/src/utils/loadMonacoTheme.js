// src/utils/loadMonacoTheme.js
import * as monaco from 'monaco-editor';
import monokaiTheme from 'monaco-themes/themes/Monokai.json';

export const loadTheme = async () => {
  monaco.editor.defineTheme('monokai', monokaiTheme);
};
