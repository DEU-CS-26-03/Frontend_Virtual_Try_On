// "우리 서버 주소는 어디지?"를 결정하는 주소 설정 센터
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ROUTES = {
  USER_IMAGES: `${BASE_URL}/users-images`,
  GARMENTS: `${BASE_URL}/garments`,
  TRYONS: `${BASE_URL}/tryons`,
  RESULTS: `${BASE_URL}/results`,
};