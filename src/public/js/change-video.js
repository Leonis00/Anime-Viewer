// 데스크탑
// ↑ 키를 눌렀을 때 화면 위로 전환
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] 요청을 보냈어요.`);
        fetch("/video/up", { method: "GET" })
            .then((response) => {
                if (response.ok) {
                    console.log(`[${currentTime}] 성공적으로 요청을 받았어요.`);
                    location.reload();
                } else {
                    console.error("Failed.");
                }
            })
            .catch((error) => {
                console.error("Error occurred while sending video request:", error);
            });
    }
});

// ↓ 키를 눌렀을 때 화면 아래로 전환
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] 요청을 보냈어요.`);
        fetch("/video/down", { method: "GET" })
            .then((response) => {
                if (response.ok) {
                    console.log(`[${currentTime}] 성공적으로 요청을 받았어요.`);
                    location.reload();
                } else {
                    console.error("Failed.");
                }
            })
            .catch((error) => {
                console.error("Error occurred while sending video request:", error);
            });
    }
});

// 모바일
let startY;
const videoContainer = document.querySelector('#videoContainer');

videoContainer.addEventListener("touchstart", (event) => {
    startY = event.touches[0].clientY;
});

videoContainer.addEventListener("touchend", (event) => {
    const endY = event.changedTouches[0].clientY;
    const deltaY = endY - startY;

    if (deltaY > 0) { // 아래로 스와이프
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] 요청을 보냈어요.`);
        fetch("/video/down", { method: "GET" })
            .then((response) => {
                if (response.ok) {
                    console.log(`[${currentTime}] 성공적으로 요청을 받았어요.`);
                    location.reload();
                } else {
                    console.error("Failed.");
                }
            })
            .catch((error) => {
                console.error("Error occurred while sending video request:", error);
            });
    } else if (deltaY < 0) { // 위로 스와이프
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] 요청을 보냈어요.`);
        fetch("/video/up", { method: "GET" })
            .then((response) => {
                if (response.ok) {
                    console.log(`[${currentTime}] 성공적으로 요청을 받았어요.`);
                    location.reload();
                } else {
                    console.error("Failed.");
                }
            })
            .catch((error) => {
                console.error("Error occurred while sending video request:", error);
            });
    }
});