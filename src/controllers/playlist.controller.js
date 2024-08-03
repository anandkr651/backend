import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "name and description is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });
    if (!playlist) {
        throw new ApiError(404, "error in creating the playlist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist is created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "userId is missing");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "invalid userId");
    }
    const playlist = await Playlist.find({ owner: userId });

    if (!playlist) {
        throw new ApiError(404, "playlist is not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "error in finding the playlist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId is missing");
    }
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId or playlistId is invalid");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId },
        },
        {
            new: true,
        }
    );
    if (!playlist) {
        throw new ApiError(404, "unable to update the playlist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "video is added in the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId is missing");
    }
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId or playlistId is invalid");
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId },
        },
        {
            new: true,
        }
    );
    if (!playlist) {
        throw new ApiError(404, "unable to update the playlist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video is remove from the playlist")
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "delete the playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing");
    }
    if (!name || !description) {
        throw new ApiError(400, "name and description are missing");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description,
        },
        { new: true }
    );

    // ****************** OR   ******************************* with $set 
    // const playlist = await Playlist.findByIdAndUpdate(
    //     playlistId,
    //     {
    //         $set:{name: name,
    //         description: description,}
    //     },
    //     { new: true }
    // );
    if (!playlist) {
        throw new ApiError(400, "playlist is not update");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist has been updated"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
