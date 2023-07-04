const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

let pid_global;

// PID를 사용하여 프로세스를 종료하는 함수
function killProcess(pid, callback) {
    exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Failed to kill process with PID ${pid}: ${error.message}`);
            return;
        }
        console.log(`Process with PID ${pid} has been terminated.`);
        callback(null);
    });
}

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 200,
        height: 200,
        resizable: false, // 크기 변경 불가능
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            defaultEncoding: 'UTF-8' // 인코딩 설정 추가
        }
    });

    mainWindow.loadFile('electron.html');
    mainWindow.setMenu(null); // 메뉴 제거

    // 개발자 도구를 별도의 새 창에 띄우기
    mainWindow.webContents.openDevTools({ mode: 'undocked' });

    mainWindow.webContents.on('console-message', (event, level, message) => {
        console.log('Developer Tools Log:', message);

        const pidPattern = /pid: (\d+)/;
        const match = message.match(pidPattern);
        if (match && match[1]) { // 첫 번째 값 추출
            const pid = match[1];
            console.log('PID:', pid);
            mainWindow.webContents.send('pid', pid);
            pid_global = pid;
        }
    });

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log('Server will be closed');
        killProcess(pid_global, (error) => {
            if (error) {
                console.error('Failed to kill process:', error);
                return;
            }
            app.quit();
        });
    }
});

