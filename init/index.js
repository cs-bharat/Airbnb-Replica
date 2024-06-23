require('dotenv').config()
const mongoose  = require("mongoose");
const initData  = require("./data.js");
const listing  = require("../models/listing.js");

main()
.then(()=>{
    console.log("server is connected db");
}).catch((err) =>{
 console.log(err);
})

async function main(){
  await mongoose.connect(process.env.mongo_url);
}

const initDB = async ()=>{
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("data was initialized / data insert on DataBase.");
}

initDB();