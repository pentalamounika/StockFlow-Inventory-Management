
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user') || '{}')
    );

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    price: '',
    low_stock_threshold: 5,
    description: ''
});

    const fetchProducts = async () => {
        try {
            const response = await API.get('/products');
            setProducts(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };
    
const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
        ...formData,
        [name]: value
    });
};

const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim() || !formData.category.trim()) {
        alert('Please fill in all required fields.');
        return;
    }

    if (
        formData.quantity === '' ||
        !Number.isInteger(Number(formData.quantity)) ||
        Number(formData.quantity) < 0
    ) {
        alert('Please enter a valid quantity.');
        return;
    }

    if (
        formData.price === '' ||
        !Number.isFinite(Number(formData.price)) ||
        Number(formData.price) < 0
    ) {
        alert('Please enter a valid price.');
        return;
    }

    try {
        await API.post('/products', {
            ...formData,
            name: formData.name.trim(),
            sku: formData.sku.trim(),
            category: formData.category.trim(),
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            low_stock_threshold: Number(formData.low_stock_threshold)
        });

        alert('Product added successfully!');

        setFormData({
            name: '',
            sku: '',
            category: '',
            quantity: '',
            price: '',
            low_stock_threshold: 5,
            description: ''
        });

        setShowForm(false);
        fetchProducts();

    } catch (err) {
        setError(err.response?.data?.message || 'Unable to add product.');
    }
};

const handleEditProduct = async (product) => {
    const updatedName = prompt(
        'Enter product name:',
        product.name
    );

    if (updatedName === null || !updatedName.trim()) {
        return;
    }

    const updatedQuantity = prompt(
        'Enter quantity:',
        product.quantity
    );

    if (
        updatedQuantity === null ||
        updatedQuantity.trim() === '' ||
        !Number.isInteger(Number(updatedQuantity)) ||
        Number(updatedQuantity) < 0
    ) {
        alert('Please enter a valid quantity.');
        return;
    }

    const updatedPrice = prompt(
        'Enter price:',
        product.price
    );

    if (
        updatedPrice === null ||
        updatedPrice.trim() === '' ||
        !Number.isFinite(Number(updatedPrice)) ||
        Number(updatedPrice) < 0
    ) {
        alert('Please enter a valid price.');
        return;
    }

    try {
        await API.put(`/products/${product.id}`, {
            name: updatedName.trim(),
            sku: product.sku,
            category: product.category,
            quantity: Number(updatedQuantity),
            price: Number(updatedPrice),
            low_stock_threshold: product.low_stock_threshold,
            description: product.description
        });

        alert('Product updated successfully!');
        fetchProducts();

    } catch (err) {
        alert(
            err.response?.data?.message ||
            'Unable to update product.'
        );
    }
};


const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
        'Are you sure you want to delete this product?'
    );

    if (!confirmDelete) {
        return;
    }

    try {
        await API.delete(`/products/${id}`);

        alert('Product deleted successfully!');
        fetchProducts();

    } catch (err) {
        alert(
            err.response?.data?.message ||
            'Unable to delete product.'
        );
    }
};


    const totalProducts = products.length;
    const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
);

    const totalCategories = new Set(
        products.map(product => product.category)
    ).size;

    const lowStock = products.filter(
        product => product.quantity <= product.low_stock_threshold
    ).length;

    const stockValue = products.reduce(
        (total, product) =>
            total + Number(product.quantity) * Number(product.price),
        0
    );

    return (
        <div className="dashboard">
            <header className="topbar">
                <h2>StockFlow</h2>
                <div>
                    <span>Welcome, {user.name || 'User'}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                <h1>Inventory Dashboard</h1>
                <p>Manage and monitor your inventory.</p>

                {error && <p>{error}</p>}

                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Products</h3>
                        <h2>{totalProducts}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Categories</h3>
                        <h2>{totalCategories}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Low Stock Items</h3>
                        <h2>{lowStock}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Total Stock Value</h3>
                        <h2>₹{stockValue.toLocaleString('en-IN')}</h2>
                    </div>
                </section>

                <section className="inventory-section">
                    <h2>Inventory Management</h2>
                    
<div className="search-container">
    <input
        type="text"
        placeholder="Search by product name, SKU or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />
</div>

                    
<button onClick={() => setShowForm(!showForm)}>
    {showForm ? 'Cancel' : '+ Add Product'}
</button>

{showForm && (
    <form onSubmit={handleAddProduct} className="product-form">

        <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleInputChange}
            required
        />

        <input
            type="text"
            name="sku"
            placeholder="Product SKU"
            value={formData.sku}
            onChange={handleInputChange}
            required
        />

        <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleInputChange}
            required
        />

        <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            min="0"
            value={formData.quantity}
            onChange={handleInputChange}
            required
        />

        <input
            type="number"
            name="price"
            placeholder="Price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
        />

        <input
            type="number"
            name="low_stock_threshold"
            placeholder="Low Stock Threshold"
            min="0"
            value={formData.low_stock_threshold}
            onChange={handleInputChange}
            required
        />

        <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleInputChange}
        />

        <button type="submit">Save Product</button>

    </form>
)}


                    {loading ? (
                        <p>Loading products...</p>
                    ) : filteredProducts.length === 0 ? (
                        <p>No products found. Add your first product soon!</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Stock Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>{product.sku}</td>
                                            <td>{product.category}</td>
                                            <td>{product.quantity}</td>
                                            <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
                                            <td>
    {product.quantity <= product.low_stock_threshold ? (
        <span className="low-stock">Low Stock</span>
    ) : (
        <span className="in-stock">In Stock</span>
    )}
</td>
                                            <td>
    <button onClick={() => handleEditProduct(product)}>
        Edit
    </button>

    <button onClick={() => handleDeleteProduct(product.id)}>
        Delete
    </button>
</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
