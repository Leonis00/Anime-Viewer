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
        playlistElement.appendChild(li);
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