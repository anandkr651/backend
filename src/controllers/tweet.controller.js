import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"content is required")
    }

    const tweet = await Tweet.create({
        owner:req.user._id,
        content,
    })

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet created successfully!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}=req.params
    if(!userId?.trim()){
        throw new ApiResponse(400,"userId is invalid")
    }
    
    const alltweet = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup:{
                from:"tweets",
                localField:'_id',
                foreignField:"owner",
                as:'user_tweet'
            }
        },
        {
            $project:{
                user_tweet:1
            }
        }
    ]) 
    if(!alltweet?.length){
        throw new ApiError(404,"user does not do any tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, alltweet[0].user_tweet, "User tweet fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const{tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"invalid tweetId")
    }

    const {newTweet} = req.body
    if(!newTweet){
        throw new ApiError(400,"please enter the newTweet")
    }

    const updateTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content:newTweet
            }
        },
        {new : true}
    )
    if(!updateTweet){
        throw new ApiError(400,"tweet does not update")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updateTweet,"the tweet has been updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const{tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"invalid tweetId")
    }
    
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,deleteTweet,"the tweet has been deleted"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}