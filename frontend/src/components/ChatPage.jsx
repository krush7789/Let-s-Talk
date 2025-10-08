import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import apiClient from '@/lib/apiClient';
import { setMessages } from '@/redux/chatSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState('');
    const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
    const { onlineUsers, messages } = useSelector((store) => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        if (!textMessage.trim()) return;
        try {
            const res = await apiClient.post(
                `/message/send/${receiverId}`,
                { textMessage },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => () => dispatch(setSelectedUser(null)), [dispatch]);

    return (
        <div className='flex min-h-[70vh] flex-col gap-6 rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_30px_90px_-50px_rgba(30,64,175,0.4)] backdrop-blur lg:h-[78vh] lg:flex-row'>
            <section className='lg:w-80'>
                <div className='mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-4'>
                    <div>
                        <h1 className='text-sm font-semibold text-slate-900'>{user?.username}</h1>
                        <p className='text-xs text-slate-500'>Select someone to start talking.</p>
                    </div>
                </div>
                <div className='space-y-2 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-inner lg:h-[60vh]'>
                    {suggestedUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(suggestedUser?._id);
                        const isActive = selectedUser?._id === suggestedUser?._id;
                        return (
                            <button
                                key={suggestedUser?._id}
                                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${isActive ? 'bg-indigo-500/10 text-indigo-600' : 'hover:bg-slate-100/80'}`}
                            >
                                <Avatar className='h-11 w-11 border border-indigo-100'>
                                    <AvatarImage src={suggestedUser?.profilePicture} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className='text-sm font-semibold'>{suggestedUser?.username}</span>
                                    <span className={`text-xs font-medium ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {isOnline ? 'Online now' : 'Offline'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {selectedUser ? (
                <section className='flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90'>
                    <div className='flex items-center gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3'>
                        <Avatar className='h-11 w-11 border border-indigo-100'>
                            <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='text-sm font-semibold text-slate-900'>{selectedUser?.username}</span>
                            <span className='text-xs text-slate-500'>{selectedUser?.bio || 'Say hello and keep the energy positive.'}</span>
                        </div>
                    </div>
                    <div className='flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4'>
                        <Messages selectedUser={selectedUser} />
                    </div>
                    <div className='flex items-center gap-3 border-t border-slate-200 bg-white/90 px-4 py-3'>
                        <Input
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                            type='text'
                            className='flex-1 rounded-full border-slate-200 bg-slate-50/80 text-sm focus-visible:border-indigo-300 focus-visible:ring-indigo-100'
                            placeholder='Send a message…'
                        />
                        <Button
                            onClick={() => sendMessageHandler(selectedUser?._id)}
                            className='rounded-full bg-indigo-600 px-5 text-sm text-white hover:bg-indigo-700'
                        >
                            Send
                        </Button>
                    </div>
                </section>
            ) : (
                <div className='flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/60 bg-slate-50/60 text-center text-slate-500'>
                    <MessageCircleCode className='mb-4 h-16 w-16 text-indigo-300' />
                    <h2 className='text-base font-semibold text-slate-700'>Your messages</h2>
                    <p className='text-sm'>Choose a friend to start a conversation.</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
