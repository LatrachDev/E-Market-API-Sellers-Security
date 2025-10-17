
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server'); // ton fichier Express

describe("Test add review", () => {
  it("should insert new review successfully", async () => {
    const res = await request(app)
      .post('/products/123/review')
      .send({
        rating: 2,
        comment: "Super produit !"
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', "success");
    expect(res.body.data).to.have.property('rating', 2);
    expect(res.body.data).to.have.property('comment', "Super produit !");
  });
  it("should return 409  dejaa  addded by user",async()=>{
const res= await request(app).


  })
});
 