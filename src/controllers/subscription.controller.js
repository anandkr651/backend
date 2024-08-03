import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params  //userId denan hai
    const userId=req.user._id
    if(!channelId){
        throw new ApiError(400,"channelId is missing")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"channel is not found")
    }

    const existingSubsription=await Subscription.findOne({
        subscriber:userId,
        channel:channelId
    })

    if(existingSubsription){
        await Subscription.findByIdAndDelete(existingSubsription._id)
    }else{
        await Subscription.create({
            subscriber:userId,
            channel:channelId
        })
    }
    return res
    .status(200)
    .json(new ApiResponse(200,null,"subscription toggled successfully"))
})

// chai aur code ko kon kon subscriber kiya hai
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params   //chai aur code ka userId
    if(!channelId){
        throw new ApiError(400,"channelId is missing")
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber"
            }
        },
        {
            $addFields:{
                subscriber:{$first:"$subscriber"}
            }
        },
        {
           $project:{
            _id:0,
            'subscriber._id':1,
            'subscriber.username':1,
            'subscriber.fullName':1,
            'subscriber.email':1,
            'subscriber.avatar':1,
            'subscriber.coverImage':1,
           }
        }
    ])
    if(!subscribers.length){
        throw new ApiError(404,"no subscriber found for this channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"Subscriber fetched successfully"))

})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"invalid channel id")
    }

    const subscribedchannel = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
           $project:{
            _id:0,
            'channel._id':1,
            'channel.username':1,
            'channel.fullName':1,
            'channel.email':1,
            'channel.avatar':1,
            'channel.coverImage':1,
           }
        }
    ])
    if(!subscribedchannel.length){
        throw new ApiError(404,"no subscriber found for this channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribedchannel,"subscribedchannel fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}