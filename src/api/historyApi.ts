import { API_ROUTES } from "./client";

export const getFittingHistories = async () => {
  /* [실제 구현부]
  const res = await fetch(API_ROUTES.HISTORIES);
  return res.json();
  */
  return [
    { tryonId: 301, garmentName: "White Tee", resultImageUrl: "https://picsum.photos/seed/301/400/550", createdAt: "2026-03-19" },
  ];
};