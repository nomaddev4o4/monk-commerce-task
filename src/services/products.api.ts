const API_URL = `https://${
  import.meta.env.VITE_API_BASE_URL
}/task/products/search`;

export async function fetchProducts(search = "", page = 0, limit = 10) {
  const res = await fetch(
    `${API_URL}?search=${search}&page=${page}&limit=${limit}`,
    {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!res.ok) throw new Error("API Error");

  return res.json();
}
