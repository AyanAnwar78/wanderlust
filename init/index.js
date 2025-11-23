require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "68c29dba56474a3df45406bd"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();
