// src/utils/notification.ts

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("이 브라우저는 데스크톱 알림을 지원하지 않습니다.");
        return false;
    }

    // 이미 권한이 있다면 true 반환
    if (Notification.permission === "granted") return true;

    // 권한 요청
    const permission = await Notification.requestPermission();
    return permission === "granted";
};

export const showTryonCompleteNotification = () => {
    if (Notification.permission === "granted") {
        new Notification("👕 가상 피팅 완료!", {
            body: "나만의 가상 피팅 결과가 준비되었습니다. 탭으로 돌아와 결과를 확인해 보세요!",
            icon: "/favicon.ico", // 프로젝트에 맞는 아이콘 경로로 수정 가능
        });
    }
};