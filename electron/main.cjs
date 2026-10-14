const { app, BrowserWindow, ipcMain, dialog, nativeTheme, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in Main Process:', err);
});

// Enforce Dark Theme on Windows
nativeTheme.themeSource = 'dark';

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: workWidth, height: workHeight } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1440, workWidth),
    height: Math.min(900, workHeight),
    minWidth: 800,
    minHeight: 560,
    backgroundColor: '#0c0e12',
    title: 'Apex Office Suite • Native Windows Edition',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Windows smooth reveal - maximize window to match user display resolution
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Fallback to show window
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.maximize();
      mainWindow.show();
    }
  }, 600);

  // F11 fullscreen / window fit toggle
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  // Safe navigation: Open external links in default Windows web browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('http://localhost') || url.startsWith('file://');
    if (!isLocal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  const localIndexPath = path.join(__dirname, '../dist/index.html');
  function showBuildMissingFallback() {
    console.warn('Apex Office: build de producción no encontrado en dist/index.html');
    const fallbackHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Apex Office Suite • Build requerido</title>
  <style>
    body { background-color: #0c0e12; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    h1 { color: #ef4444; font-size: 24px; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; max-width: 520px; line-height: 1.6; }
    code { background: #1e293b; padding: 4px 8px; border-radius: 4px; color: #38bdf8; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Apex Office: Build de producción no encontrado</h1>
  <p>No se encontró el paquete compilado en <code>dist/index.html</code>.<br />Ejecuta <code>pnpm build</code> para compilar la aplicación, o inicia el servidor de desarrollo mediante <code>pnpm app:dev</code>.</p>
</body>
</html>`;
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fallbackHtml));
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch((err) => {
      console.error('Failed to load dev server, falling back to local file:', err);
      if (fs.existsSync(localIndexPath)) {
        mainWindow.loadFile(localIndexPath);
      } else {
        showBuildMissingFallback();
      }
    });
  } else if (fs.existsSync(localIndexPath)) {
    mainWindow.loadFile(localIndexPath);
  } else {
    showBuildMissingFallback();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================
// NATIVE WINDOWS IPC HANDLERS
// ==========================================

// 1. Native Windows Save Dialog
ipcMain.handle('dialog:saveFile', async (event, { defaultName, content, filters }) => {
  if (!mainWindow) return { canceled: true };

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar Archivo - Apex Office',
    defaultPath: defaultName || 'documento',
    filters: filters || [
      { name: 'Documento Markdown', extensions: ['md'] },
      { name: 'Documento HTML', extensions: ['html'] },
      { name: 'Hoja de Cálculo CSV', extensions: ['csv'] },
      { name: 'Archivo JSON', extensions: ['json'] },
      { name: 'Todos los archivos', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return { canceled: false, filePath };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

// 2. Native Windows Open File Dialog
ipcMain.handle('dialog:openFile', async (event, { filters }) => {
  if (!mainWindow) return { canceled: true };

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Abrir Archivo en Apex Office',
    properties: ['openFile'],
    filters: filters || [
      { name: 'Documentos Compatibles', extensions: ['md', 'txt', 'csv', 'json', 'html'] },
      { name: 'Todos los archivos', extensions: ['*'] },
    ],
  });

  if (canceled || filePaths.length === 0) {
    return { canceled: true };
  }

  try {
    const selectedPath = filePaths[0];
    const content = await fs.promises.readFile(selectedPath, 'utf8');
    return {
      canceled: false,
      filePath: selectedPath,
      fileName: path.basename(selectedPath),
      content,
    };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

// 3. Native Windows Window Controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// 4. System Diagnostics
ipcMain.handle('system:getInfo', () => {
  return {
    isNative: true,
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  };
});

// Single-Instance Lock to prevent duplicate processes
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Lifecycle events
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

