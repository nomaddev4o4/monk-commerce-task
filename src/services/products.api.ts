const API_URL = `https://${
  import.meta.env.VITE_API_BASE_URL
}/task/products/search`;

/**
 * Fetch products from Monk Commerce API.
 *
 * Note: API `page` is 1-based. This client accepts a 0-based `pageIndex`
 * (pageIndex=0 => page=1) to avoid off-by-one issues in UI pagination.
 */
export async function fetchProducts(search = "", pageIndex = 0, limit = 10) {
  const safePageIndex = Number.isFinite(pageIndex) ? Math.max(0, pageIndex) : 0;
  const apiPage = safePageIndex + 1;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, limit) : 10;
  const safeSearch = typeof search === "string" ? search : "";

  const res = await fetch(
    `${API_URL}?search=${encodeURIComponent(
      safeSearch
    )}&page=${apiPage}&limit=${safeLimit}`,
    {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!res.ok) throw new Error(`API Error (${res.status})`);

  return res.json();
}
