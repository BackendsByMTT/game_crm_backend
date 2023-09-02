const express = require("express");
const app = express();
const mongoose = require("mongoose");
const routes =  require("./routes")
const cors =  require("cors")
const cookieParser = require('cookie-parser');
require("dotenv").config()

const corsOrigin ={
  origin:['http://localhost:5173','https://casino-game-website-players.vercel.app','http://localhost:5174','https://game-crm-frontend.vercel.app','https://game-crm-frontend-abgy.vercel.app'], //or whatever port your frontend is using
  credentials:true,            
  optionSuccessStatus:200
}

app.use(cors(corsOrigin))
const mongoDBUrl = process.env.MONGOURL;

main().then(()=>console.log("database connected"))
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDBUrl);
}
app.use(cookieParser());

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/",routes)


const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log("server started at ",PORT))