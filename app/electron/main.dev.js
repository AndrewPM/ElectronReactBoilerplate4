/* eslint global-require: 0, no-console: 0 */
import { app, BrowserWindow, ipcMain } from 'electron';

let mainWindow = null;

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
  // mainWindow.setMenu(null) //this will r menu bar

  let pathVar = '';
  if (process.env.ME_ENV === 'me') pathVar = 'app/build';
  else pathVar = 'app.asar/build';

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
  });
  // we expect 'rendererReady' notification from Renderer
  // prettier-ignore
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg); // prints "ping"

    event.sender.send('asynchronous-reply', 'pong1');
  });

  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg); // prints "ping"

    // eslint-disable-next-line  no-param-reassign
    event.returnValue = 'pong2';
  });

  // prettier-ignore
  const ffi = require('ffi');
  const ref = require('ref');
  const StructType = require('ref-struct');
  const ushort = ref.coerceType('ushort');
  const refushort = ref.coerceType('ushort *');

  const libm = ffi.Library(`${__dirname}/rdmprotlite.dll`, {
    GetLibVer: ['int', ['void']],
    OpenLite: ['uint', [refushort, 'int']],
  });
  let res = libm.GetLibVer(null);
  const buf = new Buffer.from('d:/1.rdm', 'utf16le');
  // buf.type = refushort;

  res = libm.OpenLite(buf, 0);
  console.log(res);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
