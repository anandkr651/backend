import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        //user ko login ke time mi accesstoken diye hai
        // or ka yaha use isliye kiye because mobile application
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (typeof token !== "string") {
            throw new ApiError(400, "Invalid token format");
        }
        if (!token) {
            throw new ApiError(404, "unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "invalid user");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
});
