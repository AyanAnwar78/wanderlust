require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function geocodeLocation(location) {
    if (!location) return { lat: 28.6139, lng: 77.2090 };
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
            headers: { "User-Agent": "MajorProject/1.0" }
        });
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) {
        console.error("Geocoding error:", e.message);
    }
    return { lat: 28.6139, lng: 77.2090 };
}

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
        await initDB();
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});

        const processedData = [];
        for (let obj of initData.data) {
            const geo = await geocodeLocation(obj.location || obj.country);
            processedData.push({
                ...obj,
                owner: "68c29dba56474a3df45406bd",
                geometry: { type: 'Point', coordinates: [geo.lng, geo.lat] }
            });
            console.log(`Geocoded: ${obj.title}`);
        }

        await Listing.insertMany(processedData);
        console.log("data was initialised");
    } catch (err) {
        console.error("Initialization failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

main();
