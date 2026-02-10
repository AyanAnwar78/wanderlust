require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function geocodeLocation(location) {
    if (!location) return { lat: 28.6139, lng: 77.2090 };
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
            headers: { "User-Agent": "MajorProject/1.0" }
        });
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (e) { console.error(e); }
    return { lat: 28.6139, lng: 77.2090 };
}

const initDB = async () => {
    await Listing.deleteMany({});

    const processedData = [];
    for (let obj of initData.data) {
        const geo = await geocodeLocation(obj.location || obj.country);
        processedData.push({
            ...obj,
            owner: "68c29dba56474a3df45406bd", // Restored original owner ID
            geometry: { type: 'Point', coordinates: [geo.lng, geo.lat] }
        });
        console.log(`Geocoded: ${obj.title}`);
    }

    await Listing.insertMany(processedData);
    console.log("data was initialised");
};

initDB();
