import { Compass, Heart, Home, LogOut, MessageCircle, PlaySquare, Plus, Search, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const navigationItems = [
    { icon: Home, label: 'Home', description: 'Your personalised stream' },
    { icon: Search, label: 'Search', description: 'Find people & topics' },
    { icon: Compass, label: 'Explore', description: 'Trending today' },
    { icon: PlaySquare, label: 'Reels', description: 'Quick moments' },
    { icon: MessageCircle, label: 'Messages', description: 'Chats & inbox' },
];

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector((store) => store.auth);
    const { likeNotification } = useSelector((store) => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const notifications = useMemo(() => likeNotification.slice(0, 6), [likeNotification]);

    const logoutHandler = async () => {
        try {
            const res = await apiClient.get('/user/logout');
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate('/login');
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.message || error.response?.data?.message || 'Unable to logout');
        }
    };

    const sidebarHandler = (type) => {
        switch (type) {
            case 'Logout':
                logoutHandler();
                break;
            case 'Create':
                setOpen(true);
                break;
            case 'Profile':
                navigate(`/profile/${user?._id}`);
                break;
            case 'Home':
                navigate('/');
                break;
            case 'Messages':
                navigate('/chat');
                break;
            case 'Search':
                navigate('/search');
                break;
            case 'Explore':
                navigate('/explore');
                break;
            case 'Reels':
                navigate('/reels');
                break;
            default:
                break;
        }
        setMobileMenuOpen(false);
    };

    const NotificationPopover = () => (
        <Popover>
            <PopoverTrigger asChild>
                <button className='relative flex h-11 w-11 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50'>
                    <Heart className='h-5 w-5' />
                    {likeNotification.length > 0 && (
                        <span className='absolute -top-2 -right-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white'>
                            {likeNotification.length}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className='w-72 rounded-2xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur'>
                <h3 className='mb-2 text-sm font-semibold text-slate-900'>Recent appreciations</h3>
                <div className='space-y-3'>
                    {notifications.length === 0 && <p className='text-sm text-slate-500'>No new notifications yet.</p>}
                    {notifications.map((notification) => (
                        <div key={notification.userId} className='flex items-center gap-3 rounded-xl bg-slate-50/80 p-2'>
                            <Avatar className='h-9 w-9'>
                                <AvatarImage src={notification.userDetails?.profilePicture} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <p className='text-sm text-slate-600'>
                                <span className='font-semibold text-slate-900'>{notification.userDetails?.username}</span> liked your post
                            </p>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <>
            <aside className='hidden md:flex md:w-72 lg:w-80 fixed left-0 top-0 z-20 h-screen flex-col justify-between border-r border-slate-200/60 bg-white/75 px-6 pb-8 pt-10 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(30,64,175,0.4)]'>
                <div className='space-y-8'>
                    <button
                        onClick={() => sidebarHandler('Home')}
                        className='flex items-center gap-3 rounded-full bg-indigo-500/10 px-4 py-2 text-left text-indigo-700 transition hover:bg-indigo-500/15'
                    >
                        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg'>
                            <Sparkles className='h-5 w-5' />
                        </span>
                        <div>
                            <p className='text-sm font-semibold tracking-tight'>Pulseboard</p>
                            <p className='text-xs text-indigo-500/80'>A fresher way to stay in touch</p>
                        </div>
                    </button>

                    <nav className='space-y-2'>
                        {navigationItems.map(({ icon: Icon, label, description }) => (
                            <button
                                key={label}
                                onClick={() => sidebarHandler(label)}
                                className='group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600'
                            >
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-indigo-500/10 group-hover:text-indigo-600'>
                                    <Icon className='h-5 w-5' />
                                </span>
                                <span className='flex flex-col'>
                                    {label}
                                    <span className='text-xs font-normal text-slate-400 group-hover:text-indigo-400'>{description}</span>
                                </span>
                            </button>
                        ))}
                    </nav>

                    <div className='flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-500/10 p-4 text-sm text-indigo-600 shadow-inner'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs uppercase tracking-wide text-indigo-400'>Create</span>
                            <p className='text-sm font-semibold text-indigo-700'>Share a new moment</p>
                            <p className='text-xs text-indigo-400'>Craft stories, posts, or reels instantly.</p>
                        </div>
                        <Button
                            onClick={() => sidebarHandler('Create')}
                            className='rounded-full bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-600'
                        >
                            <Plus className='mr-1 h-4 w-4' /> Compose
                        </Button>
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border border-indigo-100'>
                                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                                <AvatarFallback>YOU</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-slate-900'>{user?.username}</span>
                                <span className='text-xs text-slate-500'>{user?.bio || 'Say something about yourself'}</span>
                            </div>
                        </div>
                        <NotificationPopover />
                    </div>
                    <Button
                        onClick={() => sidebarHandler('Profile')}
                        variant='outline'
                        className='w-full justify-center rounded-xl border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
                    >
                        View profile
                    </Button>
                    <Button
                        onClick={logoutHandler}
                        className='w-full justify-center rounded-xl bg-rose-500 text-white transition hover:bg-rose-600'
                    >
                        <LogOut className='mr-2 h-4 w-4' /> Logout
                    </Button>
                </div>
            </aside>

            <div className='md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur'>
                <button onClick={() => setMobileMenuOpen((prev) => !prev)} className='rounded-full border border-slate-200 p-2 text-slate-600'>
                    <Search className='h-5 w-5' />
                </button>
                <button onClick={() => sidebarHandler('Home')} className='flex items-center gap-2 rounded-full bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow'>
                    <Sparkles className='h-4 w-4' /> Pulseboard
                </button>
                <button onClick={() => sidebarHandler('Create')} className='rounded-full border border-indigo-200 bg-indigo-500/10 p-2 text-indigo-600'>
                    <Plus className='h-5 w-5' />
                </button>
                {mobileMenuOpen && (
                    <div className='absolute left-4 right-4 top-[110%] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl'>
                        <div className='mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3'>
                            <Avatar className='h-9 w-9 border border-indigo-100'>
                                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                                <AvatarFallback>YOU</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='text-sm font-semibold text-slate-900'>{user?.username}</p>
                                <p className='text-xs text-slate-500'>{user?.bio || 'Tap to view profile'}</p>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            {navigationItems.map(({ icon: Icon, label }) => (
                                <button
                                    key={label}
                                    onClick={() => sidebarHandler(label)}
                                    className='flex items-center gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-sm text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600'
                                >
                                    <Icon className='h-4 w-4' /> {label}
                                </button>
                            ))}
                            <button
                                onClick={() => sidebarHandler('Profile')}
                                className='flex items-center gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-sm text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600'
                            >
                                <Avatar className='h-6 w-6'>
                                    <AvatarImage src={user?.profilePicture} />
                                    <AvatarFallback>YOU</AvatarFallback>
                                </Avatar>
                                Profile
                            </button>
                            <button
                                onClick={logoutHandler}
                                className='flex items-center gap-2 rounded-xl border border-rose-200/70 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50'
                            >
                                <LogOut className='h-4 w-4' /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreatePost open={open} setOpen={setOpen} />
        </>
    );
};

export default LeftSidebar;
