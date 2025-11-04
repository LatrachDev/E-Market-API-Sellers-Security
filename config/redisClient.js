const redis = require("redis");

const client = redis.createClient({
  host: "127.0.0.1", // ou l'adresse de ton serveur Redis (ex: Azure, Heroku)
  port: 6379,
});

client.on("error", (err) => console.error(" Redis Error:", err));
client.on("connect", () => console.log(" Connected to Redis"));

client.connect();

module.exports = client;
