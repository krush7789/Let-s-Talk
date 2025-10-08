import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { createStory, getStoryFeed } from "../controllers/story.controller.js";

const router = express.Router();

router.route('/')
    .post(isAuthenticated, upload.single('media'), createStory)
    .get(isAuthenticated, getStoryFeed);

router.route('/feed').get(isAuthenticated, getStoryFeed);

export default router;
