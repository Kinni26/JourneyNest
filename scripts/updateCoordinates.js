


const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust1");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateCoordinates() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    if (!listing.location) continue;

    try {
      console.log("Fetching:", listing.location);

      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: listing.location,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "Wanderlust App"   // Nominatim requirement
        }
      });

      if (res.data.length > 0) {
        const lon = parseFloat(res.data[0].lon);
        const lat = parseFloat(res.data[0].lat);

        listing.geometry = {
          type: "Point",
          coordinates: [lon, lat]
        };

        await listing.save();
        console.log(`✔ Updated: ${listing.title} -> [${lat}, ${lon}]`);
      } else {
        console.log(`❌ No results for ${listing.title}`);
      }
    } catch (err) {
      console.log(`🔥 ERROR for ${listing.title}:`, err.message);
    }

    await delay(1000); // 1 sec delay for API safety
  }

  mongoose.connection.close();
}

updateCoordinates();

