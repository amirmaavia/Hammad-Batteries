export const API_VERSION = "v2";

export const API_BASE_URL = `/api/${API_VERSION}`;

export const API_ROUTES = {
  items: `${API_BASE_URL}/items`,
} as const;
