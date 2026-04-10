export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const API_ROUTES = {
  AUTH: `${BASE_URL}/auth`,
  ME: `${BASE_URL}/me`,
  USERS: `${BASE_URL}/users`,
  USER_IMAGES: `${BASE_URL}/users-images`,
  GARMENTS: `${BASE_URL}/garments`,
  SEARCH_GARMENT: `${BASE_URL}/search/garment`,
  RECOMMENDATIONS: `${BASE_URL}/recommendations`,
  TRYONS: `${BASE_URL}/tryons`,
  RESULTS: `${BASE_URL}/results`,
  FAVORITES: `${BASE_URL}/favorites`,
  HISTORIES: `${BASE_URL}/histories`,
};