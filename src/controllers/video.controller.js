import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/deleteCloudinary.js";

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
        throw new ApiError(400,"Error on uploading the video and thumbnail on cloudinary");
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
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(402, "Invalid videoId formate");
    }

    const video = await Video.findById(videoId);
    // console.log(video);
    if (!video) {
        throw new ApiError(400, "Invalid video");
    }

    return res.status(200).json(new ApiResponse(200, video, "videoId matched"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "error uploading in file");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(400, "thumbnail is not uploaded");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
            },
        },
        { new: true }
    );
    if (!video) {
        throw new ApiError(400, "video is not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "thumbnail is updated"));
});

//data base se video delete ho raha hai but cloudinary se video delete nahi ho raha hai
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;   
    
    if (!videoId) {
        throw new ApiError(400, "videoId is invalid");
    }

    // const video = await Video.findById(videoId)
    // console.log(video);

    /*{
  _id: new ObjectId('66ab500af222553de1d98396'),
  videoFile: 'http://res.cloudinary.com/anand-kumar/video/upload/v1722503175/xtarw6rhz4niw5vjzjaq.mp4',
  thumbnail: 'http://res.cloudinary.com/anand-kumar/video/upload/v1722503178/ifqqglva1xlfzbmojhu0.mp4',
  title: 'threeC',
  description: 'threeC',
  duration: 9.322667,
  views: 0,
  isPubliced: true,
  owner: new ObjectId('66ab2bf9a4c185ea0fb66a87'),
  createdAt: 2024-08-01T09:06:18.240Z,
  updatedAt: 2024-08-01T09:06:18.240Z,
  __v: 0
} */
    
    //  const currentVideoFile = video.videoFile
    //  const currentThumbnail = video.thumbnail
    // //console.log(video.videoFile);
  
    //  const deleteVideoFile = await currentVideoFile.split("/").pop().split(".")[0]
    //  const deleteThcurrentThumbnail = await currentThumbnail.split("/").pop().split(".")[0]

    //  if(deleteVideoFile){
    //     await deleteOnCloudinary(deleteVideoFile)
    //  }
    //  if(deleteThcurrentThumbnail){
    //     await deleteOnCloudinary(deleteThcurrentThumbnail)
    //  }

    const deleteVideo = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, deleteVideo, "the video has been deleted"));
});

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video is not found");
    }

    video.isPubliced = !video.isPubliced;

    await video.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, video, "togglePublishStatus is saved"));
});

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    // getAllVideos,
    togglePublishStatus,
};
