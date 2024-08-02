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
app.use(express.json({ limit: "16kb" })); //when the file come from the json formate.
app.use(express.urlencoded({ extended: true, limit: "16kb" }));  //it can encoded the url.
app.use(express.static("public"));  //it is a location where my photo and video are save.
app.use(cookieParser());   //cookieParser se cookies ka access diye.

//route import
import userRouter from "./routes/user.routes.js";

//route decelaration
//http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter);

import videoRoute from "./routes/video.routes.js";
app.use("/api/v1/videos",videoRoute);

import tweetRoute from "./routes/tweet.routes.js";
app.use("/api/v1/tweets",tweetRoute);

import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments",commentRouter)

import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes",likeRouter)

import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/playlists",playlistRouter)

import dashboardRouter from "./routes/dashboard.routes.js"
app.use("/api/v1/dashboards",dashboardRouter)

import healthCheckRouter from "./routes/healthcheck.routes.js"
app.use("/api/v1/healthchecks",healthCheckRouter)

import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/api/v1/subscriptions",subscriptionRouter)

export { app };
