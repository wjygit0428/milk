const products = [
  { id: 1, name: '商品1', price: 99.99, discount: 0.8 },
  { id: 2, name: '商品2', price: 199.99, discount: 0.7 },
  { id: 3, name: '商品3', price: 299.99, discount: 0.9 }
];

class ShoppingApp {
  constructor() {
    this.cart = [];
    this.activityEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
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
    this.renderActivityCountdown();
    this.renderProducts();
    this.updateCartCount();
  }

  renderActivityCountdown() {
    const header = document.querySelector('header');
    if (!header) {
      // Fail-safe: silently abort or log – adjust as needed
      console.warn('Header element not found – countdown not rendered');
      return;
    }
    let countdownEl = document.getElementById('activity-countdown');
    if (!countdownEl) {
      countdownEl = document.createElement('div');
      countdownEl.id = 'activity-countdown';
      countdownEl.style.margin = '10px 0';
      countdownEl.style.fontWeight = 'bold';
      header.appendChild(countdownEl);
    }
    const updateCountdown = () => {
      const now = new Date();
      let diff = Math.max(0, this.activityEndTime - now);
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      countdownEl.textContent = `限时活动倒计时：${hours}:${minutes}:${seconds}`;
      if (diff > 0) {
        requestAnimationFrame(updateCountdown);
      } else {
        countdownEl.textContent = '活动已结束';
      }
    };
    updateCountdown();
  }

  renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    products.forEach(product => {
      const discounted = product.discount && product.discount < 1;
      const discountPrice = discounted ? (product.price * product.discount).toFixed(2) : product.price.toFixed(2);
      const productElement = document.createElement('div');
      productElement.className = 'product-card';
      productElement.innerHTML = `
        <h3>${product.name}</h3>
        <p>
          ${discounted ? `<span style='color: red; font-weight: bold;'>￥${discountPrice}</span> <span style='text-decoration: line-through; color: #888; margin-left: 8px;'>￥${product.price}</span> <span style='color: green; margin-left: 8px;'>${(product.discount * 10).toFixed(1)} 折</span>` : `￥${product.price}`}
        </p>
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