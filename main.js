// Configuration
const WHATSAPP_NUMBER = '5585991871158';
const PRODUCTS_KEY = 'atelie_products';

// --- Auth Management ---
function logout() {
    sessionStorage.removeItem('atelie_logged_in');
    window.location.href = 'index.html';
}
window.logout = logout;

// --- Product Management ---
function getProducts() {
    const products = localStorage.getItem(PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// --- Shopping Cart Logic ---
let cart = JSON.parse(localStorage.getItem('atelie_cart')) || [];

function saveCart() {
    localStorage.setItem('atelie_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id == productId);
    if (product) {
        cart.push({ ...product, cartId: Date.now() });
        saveCart();
        openCart();
    }
}
window.addToCart = addToCart;

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    saveCart();
}
window.removeFromCart = removeFromCart;

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalValue = document.getElementById('cart-total-value');
    const cartCount = document.getElementById('cart-count');

    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = '<p style="text-align: center; margin-top: 50px; opacity: 0.5;">Seu carrinho está vazio.</p>';
        totalValue.innerText = 'R$ 0,00';
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 0.9rem; margin-bottom: 2px;">${item.name}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px; line-height: 1.2;">
                        <i class="fas fa-info-circle" style="color: var(--accent); margin-right: 3px;"></i>${item.description || 'Produto artesanal feito com carinho.'}
                    </p>
                    <p style="color: var(--accent); font-weight: 600; font-size: 0.9rem;">R$ ${item.price}</p>
                </div>
                <button onclick="removeFromCart(${item.cartId})" class="icon-btn" style="font-size: 0.8rem; opacity: 0.5; padding: 5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((acc, item) => {
            const priceStr = String(item.price);
            const price = parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
            return acc + (isNaN(price) ? 0 : price);
        }, 0);

        totalValue.innerText = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    if (cartCount) cartCount.innerText = cart.length;
}

function openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('show');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('show');
}

// --- Storefront Rendering ---
function renderStorefront() {
    const grid = document.getElementById('product-grid');
    const top10Grid = document.getElementById('top10-grid');
    const products = getProducts();

    if (grid) {
        if (products.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 100px 0;"><p>O catálogo está sendo preparado. Volte em breve!</p></div>';
        } else {
            grid.innerHTML = products.map(product => createProductHtml(product)).join('');
        }
    }

    if (top10Grid) {
        const top10Products = products.filter(p => p.isTop10);
        if (top10Products.length === 0) {
            const top10Section = document.getElementById('top10');
            if (top10Section) top10Section.style.display = 'none';
        } else {
            const top10Section = document.getElementById('top10');
            if (top10Section) top10Section.style.display = 'block';
            top10Grid.innerHTML = top10Products.map(product => createProductHtml(product, true)).join('');
        }
    }
}

function createProductHtml(product, isTop10 = false) {
    // Para destaques, podemos adicionar um design levemente diferente ou manter o padrão
    const cardStyle = isTop10 ? 'min-width: 300px; flex: 0 0 auto;' : '';
    const badge = isTop10 ? '<div style="position: absolute; top: 15px; right: 15px; background: var(--accent); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; z-index: 10;"><i class="fas fa-star" style="margin-right: 5px;"></i>Mais Pedido</div>' : '';

    return `
        <div class="product-card fade-in" style="${cardStyle} position: relative;">
            ${badge}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.3;">${product.description || 'Uma peça especial do nosso ateliê.'}</p>
                <p class="product-price" style="margin-bottom: 15px;">R$ ${product.price}</p>
                <button onclick="addToCart(${product.id})" class="btn btn-outline" style="width: 100%;">Adicionar ao Carrinho</button>
            </div>
        </div>
    `;
}

// --- Theme Management ---
function initThemes() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    let currentTheme = localStorage.getItem('atelie_theme') || 'nature';
    document.body.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'nature' ? 'pink' : 'nature';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('atelie_theme', currentTheme);
    });
}

// --- Checkout ---
function checkout() {
    if (cart.length === 0) return;

    const itemsText = cart.map(item => `- ${item.name} (${item.price})`).join('%0A');
    const total = document.getElementById('cart-total-value').innerText;

    const message = `Olá Gleyci! Gostaria de encomendar os seguintes produtos:%0A%0A${itemsText}%0A%0A*Total: ${total}*%0A%0AAguardo seu retorno!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// --- Image Compression ---
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress generic JPEG (0.7 quality)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// --- Admin Logic ---
if (window.location.pathname.includes('admin.html')) {
    // Auth Check
    if (sessionStorage.getItem('atelie_logged_in') !== 'true') {
        window.location.href = 'login.html';
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('product-form');
        const adminGrid = document.getElementById('admin-product-grid');
        const editingIdInput = document.getElementById('editing-id');
        const submitActionBtn = document.getElementById('submit-action-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');

        window.renderAdminList = function () {
            const products = getProducts();
            adminGrid.innerHTML = products.map((product, index) => `
                <div class="product-card" style="padding: 15px; position: relative;">
                    ${product.isTop10 ? '<div style="position: absolute; top: 10px; right: 10px; background: var(--accent); color: white; border-radius: 5px; padding: 2px 6px; font-size: 0.65rem;"><i class="fas fa-star"></i></div>' : ''}
                    <img src="${product.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                    <h4 style="margin: 10px 0 5px; font-size: 0.95rem;">${product.name}</h4>
                    <p style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">R$ ${product.price}</p>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.2;">
                        ${(product.description && product.description.length > 50) ? product.description.substring(0, 50) + '...' : (product.description || '')}
                    </p>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="editProduct(${index})" class="btn" style="background: var(--primary); color: white; padding: 5px 10px; font-size: 0.7rem; flex: 1;">Editar</button>
                        <button onclick="deleteProduct(${index})" class="btn" style="background: #ff4757; color: white; padding: 5px 10px; font-size: 0.7rem; flex: 1;">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        window.deleteProduct = (index) => {
            if (confirm('Deseja excluir este produto?')) {
                const products = getProducts();
                products.splice(index, 1);
                saveProducts(products);
                renderAdminList();
                if (editingIdInput && editingIdInput.value === String(products[index]?.id)) window.cancelEdit();
            }
        };

        window.editProduct = (index) => {
            const products = getProducts();
            const product = products[index];
            if (!product) return;

            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description || '';
            document.getElementById('is-top10').checked = !!product.isTop10;
            editingIdInput.value = product.id;

            submitActionBtn.innerText = 'Salvar Alterações';
            cancelEditBtn.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.cancelEdit = () => {
            form.reset();
            editingIdInput.value = '';
            submitActionBtn.innerText = 'Adicionar à Loja';
            cancelEditBtn.style.display = 'none';
        };

        if (cancelEditBtn) cancelEditBtn.addEventListener('click', window.cancelEdit);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = document.getElementById('name').value;
                const price = document.getElementById('price').value;
                const description = document.getElementById('description').value;
                const isTop10 = document.getElementById('is-top10').checked;
                const imageFile = document.getElementById('image-file').files[0];
                const editingId = editingIdInput.value;
                const products = getProducts();

                if (!imageFile && !editingId) {
                    alert("Por favor, selecione uma imagem para o novo produto.");
                    return;
                }

                submitActionBtn.innerText = 'Processando...';
                submitActionBtn.disabled = true;

                const saveToStorage = (base64Image) => {
                    if (editingId) {
                        // Editing existing
                        const index = products.findIndex(p => String(p.id) === editingId);
                        if (index !== -1) {
                            products[index].name = name;
                            products[index].price = price;
                            products[index].description = description;
                            products[index].isTop10 = isTop10;
                            if (base64Image) {
                                products[index].image = base64Image;
                            }
                        }
                    } else {
                        // Create new
                        const newProduct = {
                            name: name,
                            price: price,
                            description: description,
                            image: base64Image,
                            isTop10: isTop10,
                            id: Date.now()
                        };
                        products.push(newProduct);
                    }

                    try {
                        saveProducts(products);
                        window.cancelEdit(); // resets form and states
                        renderAdminList();
                        alert(editingId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
                    } catch (err) {
                        alert('Erro ao salvar produto. A imagem pode ser muito grande, tente uma resolução menor.');
                    }
                    submitActionBtn.disabled = false;
                };

                if (imageFile) {
                    compressImage(imageFile, saveToStorage);
                } else {
                    // Editing without changing image (imageFile is null, but editingId exists)
                    saveToStorage(null);
                }
            });
        }

        renderAdminList();
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize common components if they exist
    renderStorefront();
    initThemes();
    updateCartUI();

    // Scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });

    // Cart Events
    const cartToggle = document.getElementById('cart-toggle');
    const closeBtn = document.getElementById('close-cart');
    const overlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
});
