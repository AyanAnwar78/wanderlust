const mongoose = require("mongoose");
const Listing = require("../models/listing");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

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

async function updateAll() {
    const listings = await Listing.find({});
    for (let listing of listings) {
        const loc = listing.location || listing.country;
        const geo = await geocodeLocation(loc);
        listing.geometry = { type: 'Point', coordinates: [geo.lng, geo.lat] };
        await listing.save();
        console.log(`Updated ${listing.title}`);
    }
    console.log("All listings updated!");
    mongoose.connection.close();
}

updateAll();
