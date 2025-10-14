require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Category = require('../models/categories');
const Product = require('../models/products');

async function seed() {
    await connectDB();
    console.log('Connected to MongoDB for seeding');

    try {
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Category.deleteMany({}),
        ]);
        console.log('Cleared Users, Products, and Categories collections');

        const categoriesData = [
            { name: 'Electronics', description: 'Phones, laptops, and gadgets' },
            { name: 'Home & Kitchen', description: 'Appliances and home essentials' },
            { name: 'Books', description: 'Fiction, non-fiction, and textbooks' },
        ];
        const categories = await Category.insertMany(categoriesData);
        console.log(`Inserted ${categories.length} categories`);

        const categoryByName = Object.fromEntries(
            categories.map((c) => [c.name, c._id])
        );

        const salt = bcrypt.genSaltSync(5);
        const hashPassword = (password) => bcrypt.hashSync(password, salt);
        const usersData = [
            {
                fullname: 'Admin User',
                email: 'admin@example.com',
                password: hashPassword('password123'),
                role: 'admin',
            },
            {
                fullname: 'Jane Doe',
                email: 'jane@example.com',
                password: hashPassword('password123'),
                role: 'user',
            },
            {
                fullname: 'John Smith',
                email: 'john@example.com',
                password: hashPassword('password123'),
                role: 'user',
            },
            {
                fullname: 'Alice Johnson',
                email: 'alice@example.com',
                password: 'password123', // Plain password for testing
                role: 'user',
            }
        ];
        const users = await User.insertMany(usersData);
        console.log(`Inserted ${users.length} users`);

        const productsData = [
            {
                title: 'iPhone 15',
                description: 'Latest Apple smartphone',
                price: 999,
                stock: 15,
                category: categoryByName['Electronics'],
                imageUrl: 'https://example.com/images/iphone15.jpg',
            },
            {
                title: 'Air Fryer Pro',
                description: 'Healthy frying with little to no oil',
                price: 129.99,
                stock: 30,
                category: categoryByName['Home & Kitchen'],
                imageUrl: 'https://example.com/images/airfryer.jpg',
            },
            {
                title: '“Clean Code” by Robert C. Martin',
                description: 'A Handbook of Agile Software Craftsmanship',
                price: 34.5,
                stock: 50,
                category: categoryByName['Books'],
                imageUrl: 'https://example.com/images/cleancode.jpg',
            },
            {
                title: 'Gaming Laptop',
                description: 'High-performance laptop for gaming and work',
                price: 1599.99,
                stock: 10,
                category: categoryByName['Electronics'],
                imageUrl: 'https://example.com/images/gaming-laptop.jpg',
            },
        ];
        const products = await Product.insertMany(productsData);
        console.log(`Inserted ${products.length} products`);

        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

seed();