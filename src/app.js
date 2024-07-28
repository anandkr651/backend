import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());   //cookieParser se cookies ka access diye

//route import
import userRouter from "./routes/user.route.js";

//route decelaration
//http://localhost:3000/api/v1/users/register
app.use("/api/v1/users", userRouter);

export { app };
