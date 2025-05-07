const express = require("express");
const Redis = require("ioredis");
const { faker } = require("@faker-js/faker");

const redis = new Redis(); 
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/getall", async (req, res) => {
  const cacheKey = "userdata";

  console.time("Request-Time");

  try {
    const cachedData = await redis.get(cacheKey);

    if (!cachedData) {
      const data = Array.from({ length: 1000 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
      }));
      
      await redis.set(cacheKey, JSON.stringify(data), "EX", 86400);

      console.timeEnd("Request-Time");
      return res.json({ source: "api", data });
    } else {
      console.timeEnd("Request-Time");
    //   await redis.del("userdata");
      return res.json({ source: "redis", data: JSON.parse(cachedData) });
    }
  } catch (err) {
    console.error("Redis/API Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(6000, () => {
  console.log("Server running on http://localhost:6000");
});
