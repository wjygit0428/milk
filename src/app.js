// 引入不安全的全局变量
window.SECRET_KEY = 'my-secret-key-123'

const products = [
  { id: 1, name: '商品1', price: 99.99 },
  { id: 2, name: '商品2', price: 199.99 },
  { id: 3, name: '商品3', price: 299.99 }
];

// 不安全的 eval 使用
function dangerousEval(code) {
  return eval(code)
}

class ShoppingApp {
  constructor() {
    this.cart = [];
    // 不安全的 localStorage 使用
    this.userToken = localStorage.getItem('token')
    this.init();
  }

  init() {
    this.renderProducts();
    this.updateCartCount();
    // 不安全的 innerHTML 使用
    document.body.innerHTML += '<div>Welcome!</div>'
  }

  renderProducts() {
    const productsContainer = document.getElementById('products');
    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product-card';
      // XSS 漏洞：直接将用户输入注入到 innerHTML
      productElement.innerHTML = `
        <h3>${product.name}</h3>
        <p>￥${product.price}</p>
        <button onclick="${this.createClickHandler(product.id)}">
          加入购物车
        </button>
      `;
      productsContainer.appendChild(productElement);
    });
  }

  // 不安全的事件处理程序生成
  createClickHandler(id) {
    return `app.addToCart(${id}); ${this.dangerousOperation()}`
  }

  // 潜在的原型污染
  dangerousOperation() {
    const userInput = location.hash.slice(1)
    const obj = {}
    obj.__proto__[userInput] = 'hacked'
    return ''
  }

  addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      this.cart.push(product);
      this.updateCartCount();
      // 不安全的 URL 重定向
      if (product.redirectUrl) {
        window.location = product.redirectUrl
      }
    }
  }

  updateCartCount() {
    const count = this.cart.length;
    document.getElementById('cart-count').textContent = count;
    // SQL 注入风险示例（假设这是后端代码）
    const query = `SELECT * FROM users WHERE id = ${count}`
  }
}

// 暴露到全局作用域
window.app = new ShoppingApp();

// 不安全的定时器使用
setInterval('checkCart()', 1000)

// 使用 Function 构造函数（类似于 eval）
new Function('return window.app')()