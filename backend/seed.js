import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harlon';

// Sample categories for a jersey store (include slug since insertMany doesn't trigger pre-save hooks)
const categories = [
    { name: 'Football', slug: 'football' },
    { name: 'Basketball', slug: 'basketball' },
    { name: 'Cricket', slug: 'cricket' },
    { name: 'Tennis', slug: 'tennis' },
    { name: 'Baseball', slug: 'baseball' }
];

// Sample products (jerseys)
const products = [
    // Football
    {
        name: 'Real Madrid Home Jersey 2024/25',
        price: 2499,
        originalPrice: 3499,
        description: 'Official Real Madrid home jersey for the 2024/25 season. Premium quality fabric with moisture-wicking technology.',
        category: 'Football',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500'],
        inStock: true,
        featured: true,
        bestSeller: true
    },
    {
        name: 'Barcelona Away Jersey 2024/25',
        price: 2299,
        originalPrice: 3299,
        description: 'FC Barcelona away jersey with breathable mesh panels. Features the iconic club crest.',
        category: 'Football',
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'],
        inStock: true,
        featured: true,
        bestSeller: false
    },
    {
        name: 'Manchester United Third Kit 2024/25',
        price: 2199,
        originalPrice: 2999,
        description: 'Stylish third kit with a unique design. Perfect for fans who want something different.',
        category: 'Football',
        sizes: ['M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'],
        inStock: true,
        featured: false,
        bestSeller: false
    },
    {
        name: 'Chelsea Home Jersey 2024/25',
        price: 2399,
        originalPrice: 3199,
        description: 'Classic Chelsea blue home jersey with premium stitching and authentic club badge.',
        category: 'Football',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500'],
        inStock: true,
        featured: true,
        bestSeller: true
    },
    // Basketball
    {
        name: 'Lakers Yellow Jersey #23',
        price: 1999,
        originalPrice: 2799,
        description: 'LA Lakers iconic yellow jersey. Number 23. Perfect for basketball enthusiasts.',
        category: 'Basketball',
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'],
        inStock: true,
        featured: true,
        bestSeller: true
    },
    {
        name: 'Bulls Red Jersey #23',
        price: 1899,
        originalPrice: 2599,
        description: 'Chicago Bulls classic red jersey. A tribute to basketball legends.',
        category: 'Basketball',
        sizes: ['M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500'],
        inStock: true,
        featured: false,
        bestSeller: true
    },
    {
        name: 'Warriors Blue Jersey #30',
        price: 2099,
        originalPrice: 2899,
        description: 'Golden State Warriors blue jersey with gold accents. High-quality polyester.',
        category: 'Basketball',
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500'],
        inStock: true,
        featured: true,
        bestSeller: false
    },
    // Cricket
    {
        name: 'India ODI Jersey 2024',
        price: 1799,
        originalPrice: 2499,
        description: 'Official Team India ODI jersey. Blue with orange accents. Lightweight and breathable.',
        category: 'Cricket',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500'],
        inStock: true,
        featured: true,
        bestSeller: true
    },
    {
        name: 'Australia Test Jersey',
        price: 1699,
        originalPrice: 2299,
        description: 'Australian cricket team test match jersey. Classic baggy green style.',
        category: 'Cricket',
        sizes: ['M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500'],
        inStock: true,
        featured: false,
        bestSeller: false
    },
    // Tennis
    {
        name: 'Classic White Tennis Polo',
        price: 1299,
        originalPrice: 1799,
        description: 'Elegant white tennis polo with moisture management. Perfect for the court.',
        category: 'Tennis',
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500'],
        inStock: true,
        featured: false,
        bestSeller: false
    },
    {
        name: 'Pro Tennis Jersey Blue',
        price: 1499,
        originalPrice: 1999,
        description: 'Professional grade tennis jersey with UV protection and sweat-wicking fabric.',
        category: 'Tennis',
        sizes: ['S', 'M', 'L'],
        images: ['https://images.unsplash.com/photo-1617711167306-2e8a52eb5c93?w=500'],
        inStock: true,
        featured: true,
        bestSeller: false
    },
    // Baseball
    {
        name: 'Yankees Classic Jersey',
        price: 1899,
        originalPrice: 2599,
        description: 'New York Yankees traditional pinstripe jersey. An American classic.',
        category: 'Baseball',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500'],
        inStock: true,
        featured: true,
        bestSeller: true
    },
    {
        name: 'Red Sox Home Jersey',
        price: 1799,
        originalPrice: 2399,
        description: 'Boston Red Sox home jersey with authentic team colors and logo.',
        category: 'Baseball',
        sizes: ['M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1578432014316-48b448d79d57?w=500'],
        inStock: true,
        featured: false,
        bestSeller: false
    }
];

async function seedDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Insert categories
        console.log('📁 Creating categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`   ✅ Created ${createdCategories.length} categories`);

        // Insert products
        console.log('📦 Creating products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`   ✅ Created ${createdProducts.length} products`);

        console.log('\n🎉 Database seeded successfully!');
        console.log(`   Categories: ${createdCategories.length}`);
        console.log(`   Products: ${createdProducts.length}`);

        // Display category summary
        console.log('\n📋 Categories:');
        createdCategories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.slug})`);
        });

        // Display featured products
        console.log('\n⭐ Featured Products:');
        createdProducts.filter(p => p.featured).forEach(p => {
            console.log(`   - ${p.name} - ₹${p.price}`);
        });

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedDatabase();
