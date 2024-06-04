const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
async function fetchProducts(company, category, top, minPrice, maxPrice) {
  try {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products`, {
      params: {
        top,
        minPrice,
        maxPrice
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
app.get('/categories/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  const { top, minPrice, maxPrice, page, sort } = req.query;

  try {
    const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
    const productsPromises = companies.map(company => fetchProducts(company, categoryname, top, minPrice, maxPrice));
    const productsResponses = await Promise.all(productsPromises);

    let products = [];
    productsResponses.forEach(response => {
      products = products.concat(response);
    });
    if (sort) {
      const [sortBy, sortOrder] = sort.split(':');
      products.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy] - b[sortBy];
        } else {
          return b[sortBy] - a[sortBy];
        }
      });
    }

    const pageSize = parseInt(top) || 10;
    const currentPage = parseInt(page) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json(paginatedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
  const { categoryname, productid } = req.params;
  res.json({ category: categoryname, product: productid });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
