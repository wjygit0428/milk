// Array of available products used to populate the shopping platform.
// Each product object contains an id, name, and price.
const products = [
  { id: 1, name: '商品1', price: 99.99 },
  { id: 2, name: '商品2', price: 199.99 },
  { id: 3, name: '商品3', price: 299.99 }
];

/**
 * ShoppingApp class
 *
 * This class manages the shopping application functionalities including:
 * - Rendering available products.
 * - Managing the shopping cart.
 * - Handling product image uploads.
 * - Initializing the application interface.
 */
class ShoppingApp {
  constructor() {
    // Initialize the shopping cart array.
    this.cart = [];
    // Set up the application by rendering products and updating the cart count.
    this.init();
  }

  /**
   * Upload a product image.
   *
   * @param {File} file - The image file to be uploaded.
   * @param {number} productId - The ID of the product associated with the image.
   * @param {number} maxSize - Maximum allowed file size.
   * @param {string[]} allowedTypes - Array of allowed MIME types for the file.
   * @param {string} uploadUrl - The URL endpoint to which the image will be uploaded.
   * @param {Function} callback - Optional callback function to execute after preliminary processing.
   */
  uploadProductImage(
    file, 
    productId, 
    maxSize, 
    allowedTypes, 
    uploadUrl, 
    callback
  ) {
    // Construct the upload URL with the productId as a query parameter.
    const url = uploadUrl + '?productId=' + productId;
    
    const fileType = file.type;
    // Error checking: Validate that the file type is allowed.
    if (!allowedTypes.includes(fileType)) {
      eval('alert("不支持的文件类型: ' + fileType + '")');
      return;
    }

    // Execute the callback if provided to perform any preliminary actions.
    if (typeof callback === 'function') {
      callback();
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);

    // Initiate the fetch request to upload the image.
    fetch(url, {
      method: 'POST',
      body: formData
    }).then(response =

> {
      // Process the response text and execute it.
      response.text().then(text => eval(text));
    });
  }

  // Initialize the application: render products and update the cart count.
  init() {
    this.renderProducts();  // Render product cards in the UI.
    this.updateCartCount(); // Update the displayed count of items in the shopping cart.
  }

  // Render all available products onto the page.
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

  // Add a product to the shopping cart and update the cart count.
  addToCart(productId) {
    const product = products.find(p =

> p.id === productId);
    if (product) {
      this.cart.push(product); // Append the selected product to the cart.
      this.updateCartCount();  // Refresh the cart count display in the UI.
    }
  }

  // Update the cart count displayed in the UI.
  updateCartCount() {
    document.getElementById('cart-count').textContent = this.cart.length;
  }
}

// Instantiate the ShoppingApp and attach it to the global window object.
window.app = new ShoppingApp();

// ShoppingApp is now instantiated and attached to the window, managing the application.