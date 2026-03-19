import dotenv from 'dotenv';
import mongoose from 'mongoose';
import algoliasearch from 'algoliasearch';
import Product from './src/models/Product.js';

dotenv.config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = 'products'; // Your index name

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
  console.error('❌ Missing Algolia App ID or Admin Key in .env');
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

async function syncProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to sync.`);

    // Map to Algolia's required format (must have objectID)
    const records = products.map(product => ({
      objectID: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      images: product.images,
      sizes: product.sizes,
      sleeveLength: product.sleeveLength,
      collarType: product.collarType,
      zip: product.zip,
      soldOut: product.soldOut,
      inStock: product.inStock,
      featured: product.featured,
      bestSeller: product.bestSeller,
      priority: product.priority,
      isVisible: product.isVisible,
      createdAt: product.createdAt
    }));

    await index.saveObjects(records);
    console.log(`✅ Successfully synced ${records.length} products to Algolia!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error syncing to Algolia:', error);
    process.exit(1);
  }
}

syncProducts();
