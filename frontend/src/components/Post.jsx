import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Badge } from './ui/badge';

const Post = ({ post }) => {
    const [commentText, setCommentText] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user } = useSelector((store) => store.auth);
    const { posts } = useSelector((store) => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [comments, setComments] = useState(post.comments || []);
    const dispatch = useDispatch();

    const updatePostsState = (updater) => {
        const updatedPosts = posts.map((item) => (item._id === post._id ? updater(item) : item));
        dispatch(setPosts(updatedPosts));
    };

    const handleLikeToggle = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const { data } = await apiClient.get(`/post/${post._id}/${action}`);
            if (!data.success) return;

            setLiked(!liked);
            setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
            updatePostsState((item) => ({
                ...item,
                likes: liked ? item.likes.filter((id) => id !== user._id) : [...item.likes, user._id],
            }));
        } catch (error) {
            toast.error(error.message || 'Unable to update like');
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const { data } = await apiClient.post(
                `/post/${post._id}/comment`,
                { text: commentText },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!data.success) return;

            const nextComments = [...comments, data.comment];
            setComments(nextComments);
            updatePostsState((item) => ({ ...item, comments: nextComments }));
            setCommentText('');
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || 'Unable to add comment');
        }
    };

    const handleDelete = async () => {
        try {
            const { data } = await apiClient.delete(`/post/delete/${post?._id}`);
            if (!data.success) return;

            const remainingPosts = posts.filter((item) => item._id !== post._id);
            dispatch(setPosts(remainingPosts));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || error.response?.data?.message || 'Unable to delete post');
        }
    };

    const handleBookmark = async () => {
        try {
            const { data } = await apiClient.get(`/post/${post?._id}/bookmark`);
            if (data.success) {
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Unable to update bookmark');
        }
    };

    return (
        <article className='my-6 w-full max-w-2xl mx-auto rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-35px_rgba(30,64,175,0.45)] backdrop-blur'>
            <header className='flex items-center justify-between px-6 py-4'>
                <div className='flex items-center gap-3'>
                    <Avatar className='h-11 w-11 border-2 border-indigo-100'>
                        <AvatarImage src={post.author?.profilePicture} alt={post.author?.username} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <span className='text-sm font-semibold text-slate-900'>{post.author?.username}</span>
                        {post.author?.name && <span className='text-xs text-slate-500'>{post.author.name}</span>}
                    </div>
                    {user?._id === post.author?._id && <Badge variant='secondary'>You</Badge>}
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <button className='rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'>
                            <MoreHorizontal />
                        </button>
                    </DialogTrigger>
                    <DialogContent className='max-w-sm space-y-2 text-center'>
                        {post?.author?._id !== user?._id && (
                            <Button variant='ghost' className='w-full justify-center text-rose-500' disabled>
                                Unfollow
                            </Button>
                        )}
                        <Button variant='ghost' className='w-full justify-center'>Add to favourites</Button>
                        {user && user?._id === post?.author?._id && (
                            <Button onClick={handleDelete} variant='ghost' className='w-full justify-center text-rose-600'>
                                Delete post
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </header>

            <img className='w-full aspect-square object-cover bg-slate-100' src={post.image} alt={post.caption || 'post'} />

            <section className='px-6 py-4 space-y-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 text-slate-600'>
                        {liked ? (
                            <FaHeart
                                onClick={handleLikeToggle}
                                size={24}
                                className='cursor-pointer text-rose-500 transition hover:scale-105'
                            />
                        ) : (
                            <FaRegHeart
                                onClick={handleLikeToggle}
                                size={22}
                                className='cursor-pointer transition hover:text-slate-900'
                            />
                        )}
                        <MessageCircle
                            onClick={() => {
                                dispatch(setSelectedPost(post));
                                setDialogOpen(true);
                            }}
                            className='h-6 w-6 cursor-pointer transition hover:text-slate-900'
                        />
                        <Send className='h-5 w-5 cursor-pointer transition hover:text-slate-900' />
                    </div>
                    <Bookmark onClick={handleBookmark} className='h-5 w-5 cursor-pointer transition hover:text-slate-900' />
                </div>
                <div>
                    <span className='text-sm font-semibold text-slate-900'>{likeCount} likes</span>
                </div>
                <p className='text-sm leading-relaxed text-slate-700'>
                    <span className='mr-2 font-semibold text-slate-900'>{post.author?.username}</span>
                    {post.caption}
                </p>
                {comments.length > 0 && (
                    <button
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setDialogOpen(true);
                        }}
                        className='text-sm font-medium text-indigo-600 transition hover:text-indigo-500'
                    >
                        View all {comments.length} comments
                    </button>
                )}
                <CommentDialog open={dialogOpen} setOpen={setDialogOpen} />
                <div className='flex items-center gap-3 rounded-full border border-slate-200 bg-white/70 px-4 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100'>
                    <input
                        type='text'
                        placeholder='Add a kind thought…'
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className='flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none'
                    />
                    {commentText && (
                        <button onClick={handleComment} className='text-sm font-semibold text-indigo-600 hover:text-indigo-500'>
                            Post
                        </button>
                    )}
                </div>
            </section>
        </article>
    );
};

export default Post;
