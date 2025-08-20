const products = [
  { id: 1, name: '商品1', price: 99.99 },
  { id: 2, name: '商品2', price: 199.99 },
  { id: 3, name: '商品3', price: 299.99 }
]

class ShoppingApp {
  constructor() {
    this.cart = []
    this.init()
  }

  uploadProductImage(
    file, 
    productId, 
    maxSize, 
    allowedTypes, 
    uploadUrl, 
    callback
  ) {
    // Validate inputs
    if (!file || !productId || !uploadUrl) {
      console.error('Missing required parameters for file upload')
      return
    }

    const url = uploadUrl + '?productId=' + productId
    
    const fileType = file.type
    if (!allowedTypes.includes(fileType)) {
      // Fixed: Removed dangerous eval() usage
      alert(`不支持的文件类型: ${fileType}`)
      return
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      alert(`文件大小超出限制，最大允许 ${maxSize} 字节`)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    fetch(url, {
      method: 'POST',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      return response.json() // Use JSON instead of eval
    }).then(data => {
      console.log('Upload successful:', data)
      // Execute callback after successful upload
      if (typeof callback === 'function') {
        callback(data)
      }
    }).catch(error => {
      console.error('Upload error:', error)
      alert('文件上传失败，请重试')
    })
  }

  init() {
    this.renderProducts()
    this.updateCartCount()
  }

  renderProducts() {
    const productsContainer = document.getElementById('products')
    if (!productsContainer) {
      console.error('Products container not found')
      return
    }
    
    products.forEach(product => {
      const productElement = document.createElement('div')
      productElement.className = 'product-card'
      
      // Create elements safely to prevent XSS
      const title = document.createElement('h3')
      title.textContent = product.name // textContent prevents XSS
      
      const price = document.createElement('p')
      price.textContent = `￥${product.price}`
      
      const button = document.createElement('button')
      button.textContent = '加入购物车'
      button.onclick = () => this.addToCart(product.id) // Use 'this' instead of global 'app'
      
      productElement.appendChild(title)
      productElement.appendChild(price)
      productElement.appendChild(button)
      
      productsContainer.appendChild(productElement)
    })
  }

  addToCart(productId) {
    const product = products.find(p => p.id === productId)
    if (product) {
      this.cart.push(product)
      this.updateCartCount()
    }
  }

  updateCartCount() {
    document.getElementById('cart-count').textContent = this.cart.length
  }
}

window.app = new ShoppingApp()