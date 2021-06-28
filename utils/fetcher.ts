export const apiFetcher = (url) => fetch(url).then((r) => r.json());
