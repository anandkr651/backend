import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something is wrong while generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists: username,email
    //check for image, check for avatar
    //upload then to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const { fullName, email, username, password } = req.body;
    //   console.log("email :", email);
    //   console.log(req.body)

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "all field are required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username is allready exist");
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(req.files);
    /*avatar: [
    {
      fieldname: 'avatar',
      originalname: 'IMG-20191228-WA0007.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: 'IMG-20191228-WA0007.jpg',
      path: 'public\\temp\\IMG-20191228-WA0007.jpg',
      size: 108168
    }
  ] */
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(409, "avatar file is required");
    }
    // console.log(avatar);
/*{
  asset_id: '1b3eeacaf8f7c46bae74258c0eb4a2b5',
  public_id: 'sypqvjpzwldoic2vqpow',
  version: 1722396522,
  version_id: '5e986eecd4fa7c8c4c7a7d6aca0c883d',
  signature: 'd6977756bf6bf920fdf99a8307a75c32dbb082d9',
  width: 590,
  height: 1280,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2024-07-31T03:28:42Z',
  tags: [],
  bytes: 108168,
  type: 'upload',
  etag: 'efb7310ea01877f6858ec1ca029b46f4',
  placeholder: false,
  url: 'http://res.cloudinary.com/anand-kumar/image/upload/v1722396522/sypqvjpzwldoic2vqpow.jpg',
  secure_url: 'https://res.cloudinary.com/anand-kumar/image/upload/v1722396522/sypqvjpzwldoic2vqpow.jpg',
  asset_folder: '',
  display_name: 'sypqvjpzwldoic2vqpow',
  original_filename: 'IMG-20191228-WA0007',
  api_key: '162155916113427'
} */
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "something went wrong to registering to the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "user registured successfully"));
        //createdUser ---> yaha pe user ko response bhejene ki liye createdUser likha hua hai.
});

const loginUser = asyncHandler(async (req, res) => {
    //req body =>data
    //username =>email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }], //or mongodb ke operator hai 
    });
    if (!user) {
        throw new ApiError(404, "user does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "password is not correct");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true, //cookies sirf server se modefied ho sakiti hai frontend se koi nahi kar sakata hai
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,
                {
                    user: loggedInUser,  //yaha pe user khud se access token and refresh token ko save karna chata hai
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //clear the cookie
    //clear rhe accesstoken

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,   // this removes the field from document
            },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    //get refreshtoken from the cookie or from req.body
    //verfy the cookie using jwt
    // find the user using the decodedToken._id
    // compare the user's refreshtoken and the cookie refresh token
    //generate a new refresh and access token 
    //set a option object
    //return res with cookie

    const incommingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

        if (!incommingRefreshToken) {
            throw new ApiError(401, "unauthorize request");
        }
        try {
            const decodedToken = jwt.verify( incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET );
            
            const user = await User.findById(decodedToken?._id);
            // console.log("user detail",user);

        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used ");
        }
        const options = {
            httpOnly: true,
            secure: true,
        };

        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
        // console.log("ref",newrefreshToken);
/*NOTE --->if we change the name refreshToken into newrefreshToken then we get an error so we can not change the name. */
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200,
                    { 
                        accessToken, 
                        refreshToken, 
                    },
                    "access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Please provide old and new password")
    }
    const user = await User.findById(req.user?._id);   //verifyJWT se user aayaa
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password change successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetch successfully")
        );
});

 const updateAccountDetail = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!(fullName || email)) {
        throw new ApiError(400, "all fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password ");
   if(!user) {
    throw new ApiError(400,"user not exist")
   }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "account details update successfully")
        );
});

const updateUserAvater = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover Image file is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading on coverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;  //url se
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([  //return mi array aati hai
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                isSubscribed: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    console.log(channel);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "vidoes",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owener",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owener: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "watch history fetch successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvater,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
