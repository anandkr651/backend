import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(404, "Title and Description are required ");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is missing");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!videoFile.url || !thumbnail.url) {
        throw new ApiError(
            400,
            "Error on uploading the video and thumbnail on cloudinary"
        );
    }

    const videoDuration = videoFile.duration;

    const video = await Video.create({
        duration: videoDuration,
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        isPubliced: true,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"VideoId is missing")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(402,"Invalid videoId formate")
    }

    const video = await Video.findById(videoId)
    // console.log(video);
    if(!video){
        throw new ApiError(400,"Invalid video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"videoId matched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"VideoId is missing")
    }

    const thumbnailLocalPath=req.file?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400,"error uploading in file")
    }

    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(400,"thumbnail is not uploaded")
    }

    const video= await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                thumbnail:thumbnail.url
            }
        },
        {new:true}
    )
    if(!video){
        throw new ApiError(400,"video is not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"thumbnail is updated"))

})

//error hai abhi cloudinary se video delete nahi ho raha hai
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"VideoId is missing")
    }
    const video = await Video.findById(videoId)
    // console.log(video);
    const cloudinaryPublicId = video.thumbnail;
    // console.log("cloudinaryPublicId",cloudinaryPublicId);
// Delete the video from Cloudinary
try {
    await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'video' });
} catch (error) {
    throw new ApiError(500, "Failed to delete video from Cloudinary");
}

// Optionally delete the video document from your database
await Video.findByIdAndDelete(videoId);

return res
.status(200)
.json(new ApiResponse(200, null, "Video is deleted"));

})

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"VideoId is missing")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video is not found")
    }

    video.isPubliced=!video.isPubliced

    await video.save({ validateBeforeSave: false })
    return res
    .status(200)
    .json(new ApiResponse(200,video,"togglePublishStatus is saved"))

})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    // getAllVideos,
    togglePublishStatus
};
