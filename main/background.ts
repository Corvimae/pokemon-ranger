import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import chokidar from 'chokidar';
import fs from 'fs';
import { createWindow } from './helpers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 720,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./route');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/route`);
    

    mainWindow.webContents.openDevTools();
  }

  const activeRouteWatcher: { current: chokidar.FSWatcher | null } = { current: null };

  function detachActiveRouteWatcher() {
   if (activeRouteWatcher.current) activeRouteWatcher.current.close();
  }
  
  function attachActiveRouteWatcher(file: string) {
    detachActiveRouteWatcher();
  
    console.info(`Now watching ${file}`);
    activeRouteWatcher.current = chokidar.watch(file);
  
    activeRouteWatcher.current.on('change', path => {
      console.info('File updated.');

      const contents = fs.readFileSync(path);

      mainWindow.webContents.send('route:update', [contents.toString()]);
    });
  }
  
  // listen to file(s) add event
  ipcMain.on('route:open', ( event, files = [] ) => {
    if (!files.length) return;
    
    attachActiveRouteWatcher(files[0]);
  });
  
  ipcMain.on('route:close', event => {
    detachActiveRouteWatcher();
  });
  

})();

app.on('window-all-closed', () => {
  app.quit();
});
