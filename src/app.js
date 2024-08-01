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
import userRouter from "./routes/user.routes.js";

//route decelaration
//http://localhost:3000/api/v1/users/register
app.use("/api/v1/users", userRouter);

import videoRoute from "./routes/video.routes.js";
app.use("/api/v1/videos",videoRoute);

import tweetRoute from "./routes/tweet.routes.js";
app.use("/api/v1/tweets",tweetRoute);

import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments",commentRouter)

import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes",likeRouter)

export { app };
