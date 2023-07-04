const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const os = require('os');
const { getDirectoryPath, getVideoFilePathsFromDirectories, getVideoFilePathsFromDirectory, shuffleFileList, } = require('./get-file-paths');
const port = 3000;

app.use(express.json());
app.use(cors());

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

// 정적 파일을 제공하기 위해 express.static 미들웨어를 사용
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/index.html'));
});

app.post('/add_path', (req, res) => {
    let key, value;
    value = req.body.path;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('파일을 읽는 중 오류가 발생했습니다.', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            const paths = JSON.parse(data).paths;
            const keys = Object.keys(paths);

            let i = 1;
            while (i <= 99) {
                const paddedIndex = i.toString().padStart(2, '0');
                const tmp = 'path' + paddedIndex;

                if (!keys.includes(tmp)) {
                    key = tmp;
                    break;
                }
                i++;
            }

            jsonData.paths[key] = value; // 데이터 추가
            const updatedData = JSON.stringify(jsonData, null, 2); // 수정된 JSON 객체를 문자열로 변환
            console.log(updatedData);

            // 파일에 쓰기
            fs.writeFile('data.json', updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('파일에 쓰는 중 오류가 발생했습니다.', err);
                    return;
                }

                console.log('데이터가 성공적으로 추가되었습니다.');
            });

        } catch (error) {
            console.error('데이터를 파싱하는 중 오류가 발생했습니다.', error);
        }
    });

    res.sendStatus(200); // 성공 응답 전송
});

app.get('/view_paths', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        res.json(jsonData); // JSON 데이터 응답
    });
});

app.post('/delete_path', (req, res) => {
    const value = req.body.value;
    console.log(`"${value}"가 선택되었습니다.`);

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('파일 읽기에 오류가 발생했습니다.', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            const updatedPaths = {};

            for (const key in jsonData.paths) {
                if (jsonData.paths.hasOwnProperty(key) && jsonData.paths[key] !== value) {
                    updatedPaths[key] = jsonData.paths[key];
                }
            }

            const updatedData = {
                paths: updatedPaths
            };

            const updatedJson = JSON.stringify(updatedData, null, 2);
            console.log(updatedJson);

            fs.writeFile('data.json', updatedJson, 'utf8', (err) => {
                if (err) {
                    console.error('파일 쓰기에 오류가 발싱했습니다.', err);
                    res.status(500).send('서버 오류: 파일 쓰기에 실패했습니다.');
                } else {
                    console.log(`데이터를 성공적으로 제거했습니다.`);
                    res.status(200).send('데이터를 성공적으로 제거했습니다.');
                }
            });

        } catch (error) {
            console.error('JSON Parse에 실패했습니다.', error);
            res.status(500).send('서버 오류: JSON Parse에 실패했습니다.');
        }
    });
});


getDirectoryPath()
    .then(directoryPaths => {
        const fileList = shuffleFileList(getVideoFilePathsFromDirectories(directoryPaths));
        let index = 0;
        let len = fileList.length;
        console.log(fileList[index]);

        async function getIndex() {
            return index;
        }

        app.get('/video/up', async (req, res) => {
            index = (index + 1) % len;
            res.status(200).send(index.toString());
            console.log(index, fileList[index]);
        });

        app.get('/video/down', async (req, res) => {
            index = (index - 1 + len) % len;
            res.status(200).send(index.toString());
            console.log(index, fileList[index]);
        });

        app.get('/info', async (req, res) => {
            const currentIndex = await getIndex();
            const filePath = fileList[currentIndex];
            const folderName = path.dirname(filePath);
            const fileName = path.basename(filePath);

            const data = {
                folderName: path.basename(folderName),
                fileName: fileName,
                playlist: getVideoFilePathsFromDirectory(folderName)
            };

            res.json(data);
        });

        app.get('/video', async (req, res) => {
            const currentIndex = await getIndex();
            // 동영상 파일의 절대 경로    
            let absolutePath = fileList[currentIndex];
            const stat = fs.statSync(absolutePath);
            const fileSize = stat.size;

            // Range 헤더를 통한 전송
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                let start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                if (start > end) {
                    start = end - 1;
                }

                const chunkSize = (end - start) + 1;

                const file = fs.createReadStream(absolutePath, { start, end });
                const headers = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'video/mp4',
                };

                res.writeHead(206, headers);
                file.pipe(res);
                // const currentTime = new Date().toLocaleTimeString();
                // const userAgent = req.headers['user-agent'];

            }
        });
    })
    .catch(error => {
        console.error('getDirectoryPath() 실행 중 에러가 발생했습니다.', error);
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('pid:', process.pid);
});