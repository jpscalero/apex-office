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
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch((err) => {
      console.error('Failed to load dev server, falling back to local file:', err);
      if (fs.existsSync(localIndexPath)) {
        mainWindow.loadFile(localIndexPath);
      }
    });
  } else if (fs.existsSync(localIndexPath)) {
    mainWindow.loadFile(localIndexPath);
  } else {
    mainWindow.loadURL('http://localhost:5175');
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

// Lifecycle events
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
