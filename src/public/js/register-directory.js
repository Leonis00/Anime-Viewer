const fileSelectBtn = document.getElementById('fileSelectBtn');
fileSelectBtn.addEventListener('click', async () => {
    const userLanguage = navigator.language;

    if (userLanguage === 'ko') {
        promptMessage = "경로를 입력해주세요:";
    } else if (userLanguage === 'ja') {
        promptMessage = "パスを入力してください:";
    } else {
        promptMessage = "Please enter the path:";
    }

    const path = prompt(promptMessage);

    const absolutePathRegex = /^[a-zA-Z]:\\([^\\:*?"<>|]+\\)*[^\\:*?"<>|]*$/; // 절대 경로 유효성 검사를 위한 정규표현식

    if (path !== null) {
        if (absolutePathRegex.test(path)) {
            // 유효한 경로일 경우
            const response = await fetch('/add_path', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path })
            });

            if (response.ok) {
                console.log('경로가 성공적으로 추가되었습니다.');
                alert('경로가 성공적으로 추가되었습니다.');
            } else {
                console.log('경로 전송에 실패 했습니다.');
            }
        } else {
            // 유효하지 않은 경로일 경우
            console.log('유효하지 않은 경로입니다.');
            alert('유효하지 않은 경로입니다.');
        }
    } else {
        // 취소했을 경우
        console.log('경로 추가가 취소되었습니다.');
        alert('경로 추가가 취소되었습니다.');
    }
});