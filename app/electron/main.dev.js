/* eslint global-require: 0, no-console: 0 */
import { app, BrowserWindow, ipcMain } from 'electron';
// require('custom-env').env();

let mainWindow = null;

/* mainWindow.loadURL('http://localhost:3000'); */

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload)),
  ).catch(console.log);
};
console.log('myObject');
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      plugins: true, // Что это?
      partition: 'persist:webviewsession', // Что это?
    },
  });
  /* mainWindow.loadURL('http://localhost:3000'); */
  let pathVar = '';
  if (process.env.ME_ENV === 'me') pathVar = 'app/build';
  else pathVar = 'app.asar/build';
  // else pathVar = 'app/build';
  /* console.log(process.env.ME_ENV);
  console.log(pathVar);
  console.log(process.env.ME_ENV === 'me'); */

  const path = require('path');

  // prettier-ignore
  mainWindow.loadURL(
    // `file://${path.resolve(path.join(__dirname, '..', '..', 'build'))}/index.html`,
    // `file://${path.resolve( path.join(__dirname, '..', '..', 'app/build') )}/index.html`,
    `file://${path.resolve( path.join(__dirname, '..', '..', pathVar))}/index.html`,
  );

  // prettier-ignore
  console.log( `file://${path.resolve( path.join(__dirname, '..', '..', pathVar))}/index.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
    // notify the Renderer that Main is ready
    // mainWindow.webContents.send('mainReady');
  });

  // we expect 'rendererReady' notification from Renderer
  // prettier-ignore


  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.reply('asynchronous-reply', 'pong1')
  })

  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong2'
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
