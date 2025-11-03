const chai = require("chai");
const request = require('supertest');
const expect = chai.expect;
const app = require('../server');
const mongoose = require('mongoose');


describe(" add produit  ", () => {


    before(async () => {
        const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/marketSeller_test' || process.env.MONGO_URI;

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri);
        }
    })

    it(' token invalide', async () => {
        const res = await request(app)
            .post('/products')
            .send({
                title: "produit name",
                description: "description produit",
                price: 150,
                stock: 15,
                categories: [],
                images: [""]
            });
        expect(res.status).to.equal(401);

    })



})
