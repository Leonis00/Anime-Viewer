const path = require('path');
const fs = require('fs');

function getDirectoryPath() {
    return new Promise((resolve, reject) => {
        fs.readFile('data.json', 'utf8', (err, data) => {
            if (err) {
                console.error('파일 읽기에 오류가 발생했습니다.', err);
                reject(err);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                const pathValues = Object.values(jsonData.paths);
                resolve(pathValues);
            } catch (error) {
                console.error('JSON Parse에 실패했습니다.', error);
                reject(error);
            }
        });
    });
}

function getVideoFilePathsFromDirectories(directoryPaths) {
    const fileList = [];

    directoryPaths.forEach((directoryPath) => {
        try {
            const files = fs.readdirSync(directoryPath);

            files.forEach((file) => {
                const filePath = path.join(directoryPath, file);

                try {
                    const stats = fs.statSync(filePath);

                    if (stats.isFile()) {
                        const fileExtension = path.extname(filePath).toLowerCase();
                        const videoExtensions = ['.mp4', '.avi', '.mov']; // 동영상 확장자

                        if (videoExtensions.includes(fileExtension)) {
                            fileList.push(filePath);
                        }
                    } else if (stats.isDirectory()) {
                        const subDirectoryPaths = [filePath];
                        const subDirectoryFiles = getVideoFilePathsFromDirectories(subDirectoryPaths);
                        fileList.push(...subDirectoryFiles);
                    }
                } catch (error) {
                    // 파일에 대한 접근 권한이 없는 경우 무시하고 다음 파일로 진행합니다.
                }
            });

        } catch (error) {
            console.error('Error reading directory:', directoryPath, error);
        }
    });

    return fileList;
}

function getVideoFilePathsFromDirectory(directoryPath) {
    const fileList = [];

    try {
        const files = fs.readdirSync(directoryPath);

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);

            try {
                const stats = fs.statSync(filePath);

                if (stats.isFile()) {
                    const fileExtension = path.extname(filePath).toLowerCase();
                    const videoExtensions = ['.mp4', '.avi', '.mov']; // 동영상 확장자

                    if (videoExtensions.includes(fileExtension)) {
                        fileList.push(filePath);
                    }
                } else if (stats.isDirectory()) {
                    const subDirectoryFiles = getVideoFilePathsFromDirectory(filePath);
                    fileList.push(...subDirectoryFiles);
                }
            } catch (error) {
                // 파일에 대한 접근 권한이 없는 경우 무시하고 다음 파일로 진행합니다.
            }
        });

    } catch (error) {
        console.error('Error reading directory:', directoryPath, error);
    }
    return fileList;
}

function shuffleFileList(fileList) {
    for (let i = fileList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fileList[i], fileList[j]] = [fileList[j], fileList[i]];
    }
    return fileList;
}

function getAllFileExtensions(directoryPath) {
    const fileExtensions = new Set();

    function traverseDirectory(currentPath) {
        try {
            const files = fs.readdirSync(currentPath);

            files.forEach(file => {
                const filePath = path.join(currentPath, file);
                let stats;

                try {
                    stats = fs.statSync(filePath);
                } catch (error) {
                    // 파일에 접근할 수 없는 경우, 건너뜁니다.
                    console.error(`Skipping file ${filePath}: ${error}`);
                    return;
                }

                if (stats.isFile()) {
                    const extension = path.extname(filePath);
                    fileExtensions.add(extension);
                } else if (stats.isDirectory()) {
                    traverseDirectory(filePath);
                }
            });
        } catch (error) {
            console.error(`Error reading directory ${currentPath}: ${error}`);
        }
    }

    traverseDirectory(directoryPath);

    return fileExtensions;
}

module.exports = {
    getDirectoryPath,
    getVideoFilePathsFromDirectories,
    getVideoFilePathsFromDirectory,
    shuffleFileList,
};
