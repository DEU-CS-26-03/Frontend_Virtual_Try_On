import { API_ROUTES } from "./client";

export const getFittingHistories = async () => {
  const res = await fetch(API_ROUTES.HISTORIES);
  return res.json();
};