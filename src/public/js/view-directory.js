const viewDirectoryBtn = document.getElementById('viewDirectoryBtn');
let modalDisplayed = false;

viewDirectoryBtn.addEventListener('click', () => {
    if (modalDisplayed) {
        return;
    }

    fetch('/view_paths')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayDataInModal(data.paths);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    function displayDataInModal(paths) {
        // 모달 엘리먼트 생성
        const modal = document.createElement('div');
        modal.classList.add('modal');

        // 모달 콘텐츠 생성
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        // 텍스트를 감싸는 요소 생성
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('text-wrapper');

        // 텍스트를 감싸는 요소에 텍스트 추가
        textWrapper.textContent = '경로 리스트';

        // 텍스트를 감싸는 요소를 모달 콘텐츠에 추가
        modalContent.appendChild(textWrapper);

        // 테이블 엘리먼트를 생성합니다.
        const table = document.createElement('table');

        // 데이터를 순회하면서 값을 표시
        for (const key in paths) {
            if (paths.hasOwnProperty(key)) {
                // 테이블 행
                const row = document.createElement('tr');

                // Value열
                const valueCell = document.createElement('td');
                valueCell.textContent = paths[key];
                valueCell.classList.add('valueCell');
                row.appendChild(valueCell);

                // 삭제 버튼 열
                const deleteCell = document.createElement('td');
                deleteCell.classList.add('delete-link');
                const deleteLink = document.createElement('a');
                deleteLink.textContent = 'x';
                deleteLink.classList.add('delete-link');
                deleteLink.href = '#';
                deleteLink.addEventListener('click', () => {
                    const value = paths[key];

                    fetch('/delete_path', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ value })
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log(`데이터를 성공적으로 제거했습니다.`);
                                row.remove(); // 클라이언트에서 해당 행 삭제
                            } else {
                                console.log(`데이터 제거에 실패했습니다.`);
                            }
                        })
                        .catch(error => {
                            // 오류 처리
                            console.error('Error:', error);
                        });
                });
                deleteCell.appendChild(deleteLink);
                row.appendChild(deleteCell);

                table.appendChild(row);
            }
        }

        modalContent.appendChild(table);

        // 닫기 버튼 생성
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.classList.add('modal-close-button');

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            modalDisplayed = false;
        });

        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.style.display = 'block';
        modalDisplayed = true;

        // Esc키 이벤트
        document.addEventListener('keydown', handleKeyDown);

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
                modalDisplayed = false;
                document.removeEventListener('keydown', handleKeyDown); // 이벤트 핸들러를 제거
            }
        }
    }
});

