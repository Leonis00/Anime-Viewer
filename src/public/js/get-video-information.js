document.getElementById("menu").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
});

// 폴더명과 파일명을 가져와서 HTML 요소에 설정하는 함수
function setFolderAndFileName(folderName, fileName) {
    const folderNameElement = document.getElementById('folderNameValue');
    const fileNameElement = document.getElementById('fileNameValue');

    folderNameElement.textContent = folderName;
    fileNameElement.textContent = fileName;
}

// 재생목록을 가져와서 HTML 요소에 설정하는 함수
function setPlaylist(playlist) {
    const playlistElement = document.getElementById('playlist');

    playlist.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.classList.add('playlist-item');
        playlistElement.appendChild(li);

        // 재생목록 아이템 클릭 이벤트 처리
        li.addEventListener('click', function () {
            sendFileName(item);
        });

    });
}

fetch('/info')
    .then(response => response.json())
    .then(data => {
        setFolderAndFileName(data.folderName, data.fileName);
        setPlaylist(data.playlist);
    })
    .catch(error => {
        console.error('데이터를 가져오는 중에 오류가 발생했습니다.', error);
    });

function sendFileName(path) {
    fetch('/sidebar/video', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: path })
    })
        .then(response => response.text())
        .then(data => {
            console.log('서버 응답:', data);
            const newWindow = window.open('about:blank', '_blank'); // 새 창을 열어 비디오를 실행
            newWindow.location.href = '/videoPlayerNew';
        })
        .catch(error => {
            console.error('데이터를 보내는 중에 오류가 발생했습니다.', error);
        });
}