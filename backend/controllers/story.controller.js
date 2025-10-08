import sharp from "sharp";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";

const MAX_STORY_SIZE = 25 * 1024 * 1024; // 25MB cap aligned with Instagram limits

export const createStory = async (req, res) => {
    try {
        const { caption, mediaType: requestedMediaType } = req.body;
        const media = req.file;
        const authorId = req.id;

        if (!media) {
            return res.status(400).json({ message: 'Story media is required', success: false });
        }

        if (media.size && media.size > MAX_STORY_SIZE) {
            return res.status(400).json({ message: 'Stories can be up to 25MB', success: false });
        }

        const normalizedType = requestedMediaType === 'video' ? 'video' : requestedMediaType === 'image' ? 'image' : null;
        const isImage = normalizedType ? normalizedType === 'image' : media.mimetype?.startsWith('image/');
        const isVideo = normalizedType ? normalizedType === 'video' : media.mimetype?.startsWith('video/');

        if (!isImage && !isVideo) {
            return res.status(400).json({ message: 'Unsupported story media type', success: false });
        }

        const uploadOptions = { folder: 'stories' };
        let fileUri;

        if (isImage) {
            const optimizedMediaBuffer = await sharp(media.buffer)
                .resize({ width: 1080, height: 1920, fit: 'cover', position: 'center' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();

            fileUri = `data:image/jpeg;base64,${optimizedMediaBuffer.toString('base64')}`;
        } else {
            uploadOptions.resource_type = 'video';
            const mimeType = media.mimetype || 'video/mp4';
            fileUri = `data:${mimeType};base64,${media.buffer.toString('base64')}`;
        }

        const cloudResponse = await cloudinary.uploader.upload(fileUri, uploadOptions);

        const story = await Story.create({
            caption,
            media: cloudResponse.secure_url,
            mediaType: isImage ? 'image' : 'video',
            duration: isVideo ? cloudResponse.duration : undefined,
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

        const authorIds = Array.from(
            new Set([req.id, ...currentUser.following.map(id => id.toString())])
        )
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

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

        const groupedStories = Array.from(groupedStoriesMap.values())
            .map(group => ({
                ...group,
                stories: group.stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }))
            .sort((a, b) => {
                const firstA = a.stories[0]?.createdAt ? new Date(a.stories[0].createdAt).getTime() : 0;
                const firstB = b.stories[0]?.createdAt ? new Date(b.stories[0].createdAt).getTime() : 0;
                return firstB - firstA;
            });

        return res.status(200).json({
            success: true,
            stories: groupedStories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Unable to load stories', success: false });
    }
};
