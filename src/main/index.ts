import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // allow HID
  // https://www.electronjs.org/docs/latest/tutorial/devices#webhid-api
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    // Add events to handle devices being added or removed before the callback on
    // `select-hid-device` is called.
    mainWindow.webContents.session.on('hid-device-added', (_event, device) => {
      console.log('hid-device-added FIRED WITH', device);
      console.log(details.deviceList);
      // Optionally update details.deviceList
    });

    mainWindow.webContents.session.on('hid-device-removed', (_event, device) => {
      console.log('hid-device-removed FIRED WITH', device);
      console.log(details.deviceList);
      // Optionally update details.deviceList
    });

    event.preventDefault();

    console.log('devices: ' + JSON.stringify(details.deviceList));
    if (details.deviceList && details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    }
  });


  // allow webserial
  // https://www.electronjs.org/docs/latest/tutorial/devices#web-serial-api
  mainWindow.webContents.session.on('select-serial-port', (event, portList, _webContents, callback) => {
    // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
    // is called.
    mainWindow.webContents.session.on('serial-port-added', (_event, port) => {
      console.log('serial-port-added FIRED WITH', port);
      // Optionally update portList to add the new port
    });

    mainWindow.webContents.session.on('serial-port-removed', (_event, port) => {
      console.log('serial-port-removed FIRED WITH', port);
      // Optionally update portList to remove the port
    });

    event.preventDefault();

    console.log('ports: ' + JSON.stringify(portList));

    if (portList && portList.length > 0) {
      callback(portList[0].portId);
    } else {
      // eslint-disable-next-line n/no-callback-literal
      callback(''); // Could not find any matching devices
    }
  });

  mainWindow.webContents.session.setPermissionCheckHandler((_webContents, _permission, _requestingOrigin) => {
    return true;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((_details) => {
    return true;
  });

  mainWindow.webContents.executeJavaScript(
    `
      function clickButton() {
        const button = document.querySelector("#scanner-button");
        if (button) {
          button.click();
        } else {
          window.setTimeout(clickButton, 300);
        }
      }
      clickButton()`,
    true
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// UNSECURE
// SSL/TSL: this is the self-signed certificate support
// https://stackoverflow.com/questions/38986692/how-do-i-trust-a-self-signed-certificate-from-an-electron-app
app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  console.log('UNSECURE request to ' + url);
  callback(true);
});
