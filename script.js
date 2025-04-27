const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');

let products = JSON.parse(localStorage.getItem('products')) || [];

function saveToStorage() {
  localStorage.setItem('products', JSON.stringify(products));
}

function renderProducts() {
  productList.innerHTML = '';
  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'" />
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p class="price">Rp ${product.price}</p>
      <div class="actions">
        <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteProduct(${index})">Hapus</button>
      </div>
    `;
    productList.appendChild(card);
  });
}


  

function editProduct(index) {
  const p = products[index];
  document.getElementById('product-id').value = index;
  document.getElementById('name').value = p.name;
  document.getElementById('price').value = p.price;
  document.getElementById('image').value = p.image;
  document.getElementById('description').value = p.description;
}

function deleteProduct(index) {
  if (confirm('Yakin mau hapus produk ini?')) {
    products.splice(index, 1);
    saveToStorage();
    renderProducts();
  }
}

// First render
renderProducts();
