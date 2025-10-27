require("dotenv").config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Category = require('../models/categories');
const Product = require('../models/products');
const Order = require('../models/Order'); // Ton modèle Order

async function seed() {
    await connectDB();
    console.log('Connected to MongoDB for seeding');

    try {
        // Vider les collections
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Category.deleteMany({}),
            Order.deleteMany({}),
        ]);
        console.log('Cleared Users, Products, Categories, and Orders collections');

        // Catégories
        const categoriesData = [
            { name: 'Electronics', description: 'Phones, laptops, and gadgets' },
            { name: 'Home & Kitchen', description: 'Appliances and home essentials' },
            { name: 'Books', description: 'Fiction, non-fiction, and textbooks' },
        ];
        const categories = await Category.insertMany(categoriesData);
        console.log(`Inserted ${categories.length} categories`);
        const categoryByName = Object.fromEntries(categories.map(c => [c.name, c._id]));

        // Utilisateurs
        const salt = bcrypt.genSaltSync(5);
        const hashPassword = (password) => bcrypt.hashSync(password, salt);
        const usersData = [
            { fullname: 'Admin User', email: 'admin@example.com', password: hashPassword('password123'), role: 'admin' },
            { fullname: 'Jane Doe', email: 'jane@example.com', password: hashPassword('password123'), role: 'user' },
            { fullname: 'John Smith', email: 'john@example.com', password: hashPassword('password123'), role: 'user' },
            { fullname: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'user' }
        ];
        const users = await User.insertMany(usersData);
        console.log(`Inserted ${users.length} users`);
        const userByName = Object.fromEntries(users.map(u => [u.fullname, u._id]));

        // Produits
        const productsData = [
            { title: 'iPhone 15', description: 'Latest Apple smartphone', price: 999, stock: 15, seller: userByName['Jane Doe'], categories: [categoryByName['Electronics']], images: ['https://example.com/images/iphone15.jpg'] },
            { title: 'Air Fryer Pro', description: 'Healthy frying with little to no oil', price: 129.99, stock: 30, seller: userByName['John Smith'], categories: [categoryByName['Home & Kitchen'], categoryByName['Electronics']], images: ['https://example.com/images/airfryer.jpg'] },
            { title: '“Clean Code” by Robert C. Martin', description: 'A Handbook of Agile Software Craftsmanship', price: 34.5, stock: 50, seller: userByName['Alice Johnson'], categories: [categoryByName['Books']], images: ['https://example.com/images/cleancode.jpg'] },
            { title: 'Gaming Laptop', description: 'High-performance laptop for gaming and work', price: 1599.99, stock: 10, seller: userByName['Jane Doe'], categories: [categoryByName['Electronics']], images: ['https://example.com/images/gaming-laptop.jpg'] },
        ];
        const products = await Product.insertMany(productsData);
        console.log(`Inserted ${products.length} products`);

        // Créer des commandes (Orders) avec status "paid"
        const ordersData = [
            {
                user: userByName['Jane Doe'],
                items: [
                    { product: products[0]._id, quantity: 2, price: products[0].price, seller: products[0].seller },
                    { product: products[2]._id, quantity: 1, price: products[2].price, seller: products[2].seller }
                ],
                total: (2 * products[0].price) + (1 * products[2].price),
                status: 'paid',
                paymentStatus: 'paid'
            },
            {
                user: userByName['John Smith'],
                items: [
                    { product: products[1]._id, quantity: 1, price: products[1].price, seller: products[1].seller }
                ],
                total: products[1].price,
                status: 'delivered',
                paymentStatus: 'paid'
            }
        ];

        await Order.insertMany(ordersData);
        console.log(`Inserted ${ordersData.length} paid orders`);

        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    } 
    // finally {
    //     await mongoose.connection.close();
    //     console.log('MongoDB connection closed');
    // }
}

seed();
module.exports = seed;
