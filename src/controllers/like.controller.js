import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }

    const existingLike = await Like.findOne({video:videoId,likedBy:req.user._id})

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,null,"like removed successfully"))
    }else{
        const newLike = await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked added successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400,"commentId is missing")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"commentId is invalid")
    }
    const existingLike = await Like.findOne({comment:commentId,likedBy:req.user._id})

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,null,"like removed successfully"))
    }else{
        const newLike = await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked added successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"tweetId is missing")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is invalid")
    }
    const existingLike = await Like.findOne({tweet:tweetId,likedBy:req.user._id})

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,null,"like removed successfully"))
    }else{
        const newLike = await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked added successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400,"userId is invalid")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId")
    }

    const likeVideo = await Like.find({likedBy:userId , video:{$exists:true}}).populate('video','title description videoFile')

    if(!likeVideo.length){
        throw new ApiError(404,"no liked video found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,likeVideo.map(like=>like.video),"liked video fetch successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}