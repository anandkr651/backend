import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "like removed successfully"));
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "liked added successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "commentId is missing");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "commentId is invalid");
    }
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "like removed successfully"));
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "liked added successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweetId is invalid");
    }
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "like removed successfully"));
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "liked added successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(400, "userId is invalid");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid userId");
    }

    const likeVideo = await Like.find({  //this function is used to find particular data from the mongodb database
        likedBy: userId,
        video: { $exists: true },
    }).populate("video", "title description videoFile duration");
    /*The $exists operator matches documents that contain or do not contain a specified field, including documents where the field value is null.
    The following query specifies the query predicate video: { $exists: true }:
    The results consist of those documents that contain the field video, including the document whose field video contains a null value:
    */

    if (!likeVideo.length) {
        throw new ApiError(404, "no liked video found");
    }
    return res.status(200).json(
        new ApiResponse(200,likeVideo.map((like) => like.video),"liked video fetch successfully")
    );
});
/*{
    "statusCode": 200,
    "data": [
        {
            "_id": "66ab4f15f222553de1d98382",
            "videoFile": "http://res.cloudinary.com/anand-kumar/video/upload/v1722502930/vlj7bkudibw0dqgkxik0.mp4",
            "title": "oneA",
            "description": "oneA",
            "duration": 9.322667
        },
        {
            "_id": "66ab4f80f222553de1d98389",
            "videoFile": "http://res.cloudinary.com/anand-kumar/video/upload/v1722503036/nntffvpaos3zktfp7l1o.mp4",
            "title": "two",
            "description": "two",
            "duration": 9.322667
        }
    ],
    "message": "liked video fetch successfully",
    "success": true
} */

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

//.populate("video", "title description videoFile");