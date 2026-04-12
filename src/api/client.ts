export const BASE_URL = "/api/v1";

export const API_ROUTES = {
  AUTH: `/api/auth`,
  ME: `/api/me`,
  USERS: `/api/users`,
  USER_IMAGES: `/api/users-images`,
  GARMENTS: `/api/garments`,
  SEARCH_GARMENT: `/api/search/garment`,
  RECOMMENDATIONS: `/api/recommendations`,
  TRYONS: `${BASE_URL}/tryons`,
  RESULTS: `${BASE_URL}/tryons`,
  FAVORITES: `/api/favorites`,
  HISTORIES: `/api/histories`,
};

console.log("BASE_URL =", BASE_URL);
console.log("TRYONS =", API_ROUTES.TRYONS);