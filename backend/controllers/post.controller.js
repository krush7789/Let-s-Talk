import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const extractTags = (caption = "") => {
    const matches = caption.match(/#[\p{L}\p{N}_]+/gu) || [];
    const normalized = matches.map(tag => tag.slice(1).toLowerCase());
    return Array.from(new Set(normalized));
};

const canViewerSeeUser = (userDoc, viewerId) => {
    if (!userDoc) return false;
    if (userDoc.accountType === 'public') return true;
    if (userDoc._id.equals(viewerId)) return true;
    return userDoc.followers.some(followerId => followerId.equals(viewerId));
};

export const addNewPost = async (req, res) => {
    try {
        const { caption = "" } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const tags = extractTags(caption);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
            tags,
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to add post' });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const viewerId = req.id;
        const viewer = await User.findById(viewerId).select('following');
        const followings = viewer?.following?.map(id => id.toString()) || [];
        const candidateIds = [...new Set([viewerId, ...followings])];

        const posts = await Post.find({ author: { $in: candidateIds } })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture accountType followers' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        const visiblePosts = posts.filter(post => canViewerSeeUser(post.author, viewerId));

        return res.status(200).json({
            posts: visiblePosts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch posts' });
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture accountType followers'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch user posts' });
    }
};

export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');

        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            const notification = {
                type: 'like',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({ message: 'Post liked', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to like post' });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            const notification = {
                type: 'dislike',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({ message: 'Post disliked', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to dislike post' });
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const { text } = req.body;

        const post = await Post.findById(postId);

        if (!text) return res.status(400).json({ message: 'text is required', success: false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        });

        await comment.populate({
            path: 'author',
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to add comment' });
    }
};

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch comments' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to delete post' });
    }
};

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmark', success: true });

        } else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'Post bookmarked', success: true });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to bookmark post' });
    }
};

export const searchPosts = async (req, res) => {
    try {
        const viewerId = req.id;
        const { q = "" } = req.query;
        const query = q.trim();
        if (!query) {
            return res.status(200).json({ success: true, posts: [] });
        }

        const regex = new RegExp(query, 'i');
        const posts = await Post.find({
            $or: [
                { caption: regex },
                { tags: { $elemMatch: { $regex: regex } } }
            ]
        }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture accountType followers' });

        const visiblePosts = posts.filter(post => canViewerSeeUser(post.author, viewerId));

        return res.status(200).json({ success: true, posts: visiblePosts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to search posts' });
    }
};

export const getExplorePosts = async (req, res) => {
    try {
        const viewerId = req.id;
        const posts = await Post.find()
            .populate({ path: 'author', select: 'username profilePicture accountType followers' })
            .sort({ createdAt: -1 });

        const publicPosts = posts.filter(post => {
            if (!post.author) return false;
            if (post.author.accountType === 'public') return true;
            return post.author._id.equals(viewerId) || post.author.followers.some(followerId => followerId.equals(viewerId));
        });

        publicPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

        return res.status(200).json({ success: true, posts: publicPosts.slice(0, 50) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch explore posts' });
    }
};

export const getPostsByTag = async (req, res) => {
    try {
        const viewerId = req.id;
        const tagParam = req.params.tag?.toLowerCase();
        if (!tagParam) {
            return res.status(400).json({ success: false, message: 'Tag is required' });
        }

        const posts = await Post.find({ tags: tagParam })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture accountType followers' });

        const visiblePosts = posts.filter(post => canViewerSeeUser(post.author, viewerId));

        return res.status(200).json({ success: true, posts: visiblePosts, tag: tagParam });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch tag feed' });
    }
};

