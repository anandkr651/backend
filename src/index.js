// require('dotenv').config({path:'./env'})   //package.json file mi "dev" mi kuch add nahi karna hota hai

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env", //package.json file mi "dev": '-r dotenv/config --experimental-json-modules' add karna hota hai
});
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at Port: ${process.env.PORT}`);
        });
        app.on("err",(error)=>{
            console.log("My application is not talk to database",error);
        })
    })
    .catch((err) => {
        console.log("Mongo db connection failed !!! ", err);
    });

//  ***********  OR  **************

/*import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";

const app = express()(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("My application is not talk to database", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Mongo db connection failed !!", error);
        throw error;
    }
})();*/
