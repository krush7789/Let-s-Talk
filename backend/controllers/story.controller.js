import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";

export const createStory = async (req, res) => {
    try {
        const { caption } = req.body;
        const media = req.file;
        const authorId = req.id;

        if (!media) {
            return res.status(400).json({ message: 'Story media is required', success: false });
        }

        const optimizedMediaBuffer = await sharp(media.buffer)
            .resize({ width: 1080, height: 1920, fit: 'cover', position: 'center' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedMediaBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri, { folder: 'stories' });

        const story = await Story.create({
            caption,
            media: cloudResponse.secure_url,
            author: authorId
        });

        await story.populate({ path: 'author', select: 'username profilePicture' });

        return res.status(201).json({
            message: 'Story shared successfully',
            success: true,
            story,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Unable to share story', success: false });
    }
};

export const getStoryFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.id).select('following');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const authorIds = [req.id, ...currentUser.following.map(id => id.toString())];

        const activeStories = await Story.find({
            author: { $in: authorIds },
            expiresAt: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' });

        const groupedStoriesMap = new Map();

        activeStories.forEach(story => {
            const authorId = story.author._id.toString();
            if (!groupedStoriesMap.has(authorId)) {
                groupedStoriesMap.set(authorId, {
                    author: story.author,
                    stories: []
                });
            }
            groupedStoriesMap.get(authorId).stories.push(story);
        });

        const groupedStories = Array.from(groupedStoriesMap.values());

        return res.status(200).json({
            success: true,
            stories: groupedStories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Unable to load stories', success: false });
    }
};
