// const API_URL = "https://stageapi.monkcommerce.app/task/products/search";

export async function fetchProducts(search = "", page = 0, limit = 10) {
  //   const res = await fetch(
  //     `${API_URL}?search=${search}&page=${page}&limit=${limit}`,
  //     {
  //       headers: {
  //         "x-api-key": import.meta.env.VITE_MONK_API_KEY,
  //       },
  //     }
  //   );

  const allProducts = [
    {
      id: 77,
      title: "Long Socks - Made with natural materials",
      variants: [
        {
          id: 1,
          product_id: 77,
          title: "S/ White / Cotton",
          price: "3.99",
        },
        {
          id: 2,
          product_id: 77,
          title: "M/ White / Cotton",
          price: "3.99",
        },
        {
          id: 3,
          product_id: 77,
          title: "L/ White / Cotton",
          price: "3.99",
        },
        {
          id: 4,
          product_id: 77,
          title: "S/ White / Cotton",
          price: "3.99",
        },
        {
          id: 5,
          product_id: 77,
          title: "M/ White / Cotton",
          price: "3.99",
        },
      ],
      image: {
        id: 266,
        product_id: 77,
        src: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400",
      },
    },
    {
      id: 80,
      title: "Printed Tshirt",
      variants: [
        {
          id: 64,
          product_id: 80,
          title: "S/ White / Cotton",
          price: "8.99",
        },
      ],
      image: {
        id: 272,
        product_id: 80,
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      },
    },
    {
      id: 81,
      title: "Cotton Hoodie",
      variants: [
        {
          id: 65,
          product_id: 81,
          title: "S/ Black / Cotton",
          price: "24.99",
        },
        {
          id: 66,
          product_id: 81,
          title: "M/ Black / Cotton",
          price: "24.99",
        },
        {
          id: 67,
          product_id: 81,
          title: "L/ Black / Cotton",
          price: "24.99",
        },
      ],
      image: {
        id: 273,
        product_id: 81,
        src: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
      },
    },
  ];

  // Filter by search query
  const filteredProducts = search
    ? allProducts.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;

  //   if (!res.ok) throw new Error("API Error");

  //   return res.json();
  return filteredProducts;
}
