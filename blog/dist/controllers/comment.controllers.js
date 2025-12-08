import { asyncHandler } from "../middlewares/asyncHandler.js";
export const createCommentController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const blogId = req.params.blogId;
});
