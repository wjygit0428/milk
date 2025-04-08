const products = [
  { id: 1, name: '商品1', price: 99.99 },
  { id: 2, name: '商品2', price: 199.99 },
  { id: 3, name: '商品3', price: 299.99 }
];

class Order {
  constructor(items, user) {
    this.id = 'ORDER' + Date.now();
    this.items = items;
    this.userId = user.id;
    this.status = 'pending';
    this.total = items.reduce((sum, item) => sum + item.price, 0);
    this.createTime = new Date();
  }
}

class PaymentService {
  constructor() {
    // 支付宝配置，实际应用中应从服务端获取
    this.config = {
      appId: 'YOUR_ALIPAY_APP_ID',
      gateway: 'https://openapi.alipay.com/gateway.do',
      notifyUrl: 'http://your-domain.com/api/payment/notify',
      returnUrl: 'http://your-domain.com/payment/result'
    };
  }

  async createPayment(order) {
    // 实际应用中应调用服务端API创建支付
    const paymentUrl = `${this.config.gateway}?` + new URLSearchParams({
      app_id: this.config.appId,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      return_url: this.config.returnUrl,
      notify_url: this.config.notifyUrl,
      timestamp: new Date().toISOString(),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: order.id,
        total_amount: order.total.toFixed(2),
        subject: `订单 ${order.id}`,
        product_code: 'FAST_INSTANT_TRADE_PAY'
      })
    });

    return paymentUrl;
  }

  handlePaymentResult(result) {
    // 处理支付结果
    if (result.trade_status === 'TRADE_SUCCESS') {
      return {
        success: true,
        orderId: result.out_trade_no
      };
    }
    return {
      success: false,
      message: '支付失败'
    };
  }
}

class ShoppingApp {
  constructor() {
    this.cart = [];
    this.currentUser = null;
    this.orders = [];
    this.paymentService = new PaymentService();
    this.init();
  }

  init() {
    // 检查是否已登录
    const token = localStorage.getItem('userToken');
    if (token) {
      this.autoLogin(token);
    }

    // 添加登录表单监听
    document.getElementById('loginForm')
      .addEventListener('submit', (e) => this.handleLogin(e));
  }

  handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 模拟登录请求
    this.login(username, password)
      .then(response => {
        if (response.success) {
          this.showMainContent(response.user);
        } else {
          alert('登录失败：' + response.message);
        }
      });
  }

  async login(username, password) {
    // 模拟登录验证
    if (username === 'demo' && password === 'demo123') {
      const user = {
        id: 1,
        username: username,
        token: 'mock-token-' + Date.now()
      };
      localStorage.setItem('userToken', user.token);
      return {
        success: true,
        user: user
      };
    }
    return {
      success: false,
      message: '用户名或密码错误'
    };
  }

  async autoLogin(token) {
    const user = {
      id: 1,
      username: 'demo',
      token: token
    };
    this.showMainContent(user);
  }

  showMainContent(user) {
    this.currentUser = user;
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userDisplay').textContent = `欢迎, ${user.username}`;
    
    this.renderProducts();
    this.updateCart();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('userToken');
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    this.cart = [];
  }

  checkAuth() {
    if (!this.currentUser) {
      alert('请先登录');
      return false;
    }
    return true;
  }

  uploadProductImage(
    file, 
    productId, 
    maxSize, 
    allowedTypes, 
    uploadUrl, 
    callback
  ) {
    if (!this.checkAuth()) return;

    const url = uploadUrl + '?productId=' + productId;
    
    const fileType = file.type;
    if (!allowedTypes.includes(fileType)) {
      eval('alert("不支持的文件类型: ' + fileType + '")');
      return;
    }

    if (typeof callback === 'string') {
      new Function(callback)();
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);

    fetch(url, {
      method: 'POST',
      body: formData
    }).then(response => {
      response.text().then(text => eval(text));
    });
  }

  renderProducts() {
    if (!this.checkAuth()) return;

    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = products
      .map(product => `
        <div class="product-card">
          <h3>${product.name}</h3>
          <p>￥${product.price.toFixed(2)}</p>
          <button onclick="app.addToCart(${product.id})">
            加入购物车
          </button>
        </div>
      `)
      .join('');
  }

  addToCart(productId) {
    if (!this.checkAuth()) return;

    const product = products.find(p => p.id === productId);
    if (product) {
      this.cart.push(product);
      this.updateCart();
    }
  }

  updateCart() {
    if (!this.checkAuth()) return;

    const cartCount = document.getElementById('cart-count');
    const cartPanel = document.getElementById('cart');
    
    cartCount.textContent = this.cart.length;
    
    if (this.cart.length === 0) {
      cartPanel.innerHTML = '<p>购物车是空的</p>';
      return;
    }

    const total = this.cart.reduce((sum, item) => sum + item.price, 0);
    
    cartPanel.innerHTML = `
      <h2>购物车</h2>
      <div class="cart-items">
        ${this.cart.map(item => `
          <div class="cart-item">
            <span>${item.name}</span>
            <span>￥${item.price.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="cart-total">
        总计: ￥${total.toFixed(2)}
      </div>
      <button onclick="app.checkout()" class="checkout-btn">
        结算
      </button>
    `;
  }

  async checkout() {
    if (!this.checkAuth() || this.cart.length === 0) {
      alert('购物车为空！');
      return;
    }

    try {
      // 创建订单
      const order = new Order(this.cart, this.currentUser);
      this.orders.push(order);

      // 获取支付链接
      const paymentUrl = await this.paymentService.createPayment(order);

      // 清空购物车
      this.cart = [];
      this.updateCart();

      // 跳转到支付页面
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建订单失败，请稍后重试');
    }
  }

  async handlePaymentCallback(result) {
    const paymentResult = this.paymentService.handlePaymentResult(result);
    if (paymentResult.success) {
      const order = this.orders.find(o => o.id === paymentResult.orderId);
      if (order) {
        order.status = 'paid';
        alert('支付成功！');
      }
    } else {
      alert('支付失败：' + paymentResult.message);
    }
  }
}

window.app = new ShoppingApp();