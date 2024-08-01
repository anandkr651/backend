import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video id is invalid")
    }
    const comment = await Comment.find({video:videoId})
    .skip((page-1)*limit)
    .limit(limit)
    .sort({createdAt:-1})

    if(!comment){
        throw new ApiError(404,"no comment found")
    }
    const totalComment= await Comment.countDocuments({video:videoId});

    return res
    .status(200)
    .json(new ApiResponse(200,{comment,page,limit},"comment fetch successfully"))
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "videoId is missing");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video page is required");
    }

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "connent is missing");
    }
    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId,
    });
    if (!comment) {
        throw new ApiError(401, "failed to add comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "comment is added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(404, "commentId is missing");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "invalid commentId");
    }

    const { newcontent } = req.body;
    if (!newcontent) {
        throw new ApiError(400, "connent is missing");
    }

    const updatecomment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newcontent,
            },
        },
        { new: true }
    );
    if (!updatecomment) {
        throw new ApiError(400, "comment does not update");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatecomment, "the comment has been updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const{commentId} = req.params
    if(!commentId){
        throw new ApiError(400,"invalid commentId")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "invalid commentId");
    }
    
    const deletecomment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200,deletecomment,"the comment has been deleted"))

});

export { getVideoComments, addComment, updateComment, deleteComment };
