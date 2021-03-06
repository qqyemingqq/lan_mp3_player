const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')
const menu = new Menu()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 776,
    height: 670,
    // width: 908,
    transparent: true,
    frame: false,
    backgroundColor: '#fafafa',
    resizable: false,
    icon: './res/musicOn.png',
    // thickFrame:false
  });//,transparent: true,frame: false

  win.setThumbarButtons([
    {
      tooltip: 'button1',
      icon: path.join(__dirname, './res/musicOn.png'),
      click() { console.log('button1 clicked') }
    },
    {
      tooltip: 'button2',
      icon: path.join(__dirname, './res/musicOn.png'),
      flags: ['enabled', 'dismissonclick'],
      click() { console.log('button2 clicked.') }
    }
  ]);
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    item.setSavePath('/')

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  }
  )

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
  globalShortcut.register('CommandOrControl+Alt+Right', () => {
    //下一首
    shortCutControlPlayer('next');
  })
  globalShortcut.register('CommandOrControl+Alt+left', () => {
    //上一首
    shortCutControlPlayer('previous');
  })
  globalShortcut.register('CommandOrControl+Alt+Down', () => {
    //暂停
    shortCutControlPlayer('stop');
  })
  globalShortcut.register('CommandOrControl+Alt+Up', () => {
    //随机
    shortCutControlPlayer('ramdom');
  })

}
function shortCutControlPlayer(order) {
  win.webContents.send('ControlPlayer', order)
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('window-all-closed', () => {
  app.quit();
});
ipcMain.on('hide-window', () => {
  win.hide();
});
ipcMain.on('restore-window', () => {
  win.show();
});
let appIcon = null

ipcMain.on('put-in-tray', function (event) {
  const iconName = process.platform === 'win32' ? './res/musicOn.png' : './res/musicOn.png'
  const iconPath = path.join(__dirname, iconName)
  if (!appIcon) {
    appIcon = new Tray(iconPath)
  }
  const contextMenu = Menu.buildFromTemplate([{
    label: '移除',
    click: function () {
      appIcon.destroy();
      win.show();
    }
  }, {
    label: '还原',
    click: function () {
      win.show();
    }
  }, {
    label: '退出',
    click: function () {
      app.quit();
    }
  }
  ])
  appIcon.setToolTip('小明播放器')
  appIcon.setContextMenu(contextMenu)
  appIcon.addListener('double-click', () => {
    win.show();
  })
})

app.on('window-all-closed', function () {
  if (appIcon) appIcon.destroy()
})