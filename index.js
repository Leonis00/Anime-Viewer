const os = require('os');
const { ipcRenderer } = require('electron');
const { exec } = require('child_process');

const button = document.querySelector("#button");
const output = document.querySelector("#output");


let isServerOpen = false;
let serverPid;

button.addEventListener("click", () => {

    if (isServerOpen) {
        // 서버 종료 로직
        if (serverPid) {
            killProcess(serverPid); // 저장된 PID로 포트 종료
            serverPid = null; // PID 초기화
        }

        button.innerText = "Open Server";
        output.innerText = "Server closed.";
        isServerOpen = false;
        console.log('Server closed');

    } else {
        // 서버 시작 로직
        serverProcess = exec('node server.js');

        serverProcess.stdout.on('data', (data) => {
            console.log(`[Server] ${data}`);
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`[Error] ${data}`);
        });

        output.innerText = getIPv4();
        button.innerText = "Close Server";
        isServerOpen = true;
        console.log('Server opened');
    }
});

ipcRenderer.once('pid', (event, arg) => {
    serverPid = arg; // PID 저장
    console.log('Received pid:', serverPid);
});

// PID를 사용하여 프로세스를 종료하는 함수
function killProcess(pid) {
    exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Failed to kill process with PID ${pid}: ${error.message}`);
            return;
        }
        console.log(`Process with PID ${pid} has been terminated.`);
    });
}

function getIPv4() {
    const interfaces = os.networkInterfaces();
    let ipv4 = '';

    Object.keys(interfaces).forEach((interfaceName) => {
        const interfaceArray = interfaces[interfaceName];

        interfaceArray.forEach((interfaceInfo) => {
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                ipv4 = interfaceInfo.address;
            }
        });
    });

    return ipv4;
}

