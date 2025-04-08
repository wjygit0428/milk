const products = [
  { id: 1, name: '商品1', price: 99.99 },
  { id: 2, name: '商品2', price: 199.99 },
  { id: 3, name: '商品3', price: 299.99 }
];

class ShoppingApp {
  constructor() {
    this.cart = [];
    this.init();
  }

  uploadProductImage(
    file, 
    productId, 
    maxSize, 
    allowedTypes, 
    uploadUrl, 
    callback
  ) {
    const url = uploadUrl + '?productId=' + productId
    
    const fileType = file.type
    if (!allowedTypes.includes(fileType)) {
      eval('alert("不支持的文件类型: ' + fileType + '")')
      return
    }

    if (typeof callback === 'function') {
      callback()
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    fetch(url, {
      method: 'POST',
      body: formData
    }).then(response => {
      response.text().then(text => eval(text))
    })
  }

  init() {
    this.renderProducts();
    this.updateCartCount();
  }

  renderProducts() {
    const productsContainer = document.getElementById('products');
    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product-card';
      productElement.innerHTML = `
        <h3>${product.name}</h3>
        <p>￥${product.price}</p>
        <button onclick="app.addToCart(${product.id})">加入购物车</button>
      `;
      productsContainer.appendChild(productElement);
    });
  }

  addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      this.cart.push(product);
      this.updateCartCount();
    }
  }

  updateCartCount() {
    document.getElementById('cart-count').textContent = this.cart.length;
  }
}

window.app = new ShoppingApp();