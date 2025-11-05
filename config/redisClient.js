const { createClient } = require('redis')

const client = createClient({
  socket: {
    host: 'redis', // 🔥 nom du service défini dans docker-compose.yml
    port: 6379,
  },
})

client.on('error', (err) => console.error('❌ Redis Client Error:', err))

client
  .connect()
  .then(() => console.log('✅ Connected to Redis'))
  .catch((err) => console.error('❌ Redis connection failed:', err))

module.exports = client
