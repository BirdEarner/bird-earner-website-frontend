"use client";

import React, { useEffect, useRef } from 'react';
import { useChat } from "@/hooks/ChatContext";
import { format } from "date-fns";
import { useAuth } from "@/hooks/AuthContext";
import { FileIcon, ImageIcon, Download } from "lucide-react";

export function ChatWindow() {
    const { messages, activeThreadId, conversations } = useChat();
    const { user } = useAuth();
    const scrollRef = useRef(null);

    const activeConv = conversations.find(c => c.id === activeThreadId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!activeThreadId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-muted-foreground p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <ImageIcon className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Your Inbox</h3>
                <p className="max-w-xs">Select a conversation from the left to start messaging and sharing files.</p>
            </div>
        );
    }

    const renderAttachment = (attachment) => {
        const isImage = attachment.type?.startsWith('image/');
        if (isImage) {
            return (
                <div className="mt-2 group relative">
                    <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full rounded-lg border border-purple-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                    />
                    <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Download className="h-4 w-4" />
                    </a>
                </div>
            );
        }

        return (
            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-purple-100/50">
                <div className="h-10 w-10 rounded-md bg-purple-50 flex items-center justify-center">
                    <FileIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{attachment.type?.split('/')[1] || 'FILE'}</p>
                </div>
                <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                    <Download className="h-4 w-4 text-purple-600" />
                </a>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-white border-b border-purple-100 flex items-center gap-3">
                {activeConv?.clientPhoto || activeConv?.freelancerPhoto ? (
                    <img
                        src={activeConv.clientPhoto || activeConv.freelancerPhoto}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover border border-purple-200"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(activeConv?.clientName || activeConv?.freelancerName || "?").charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-purple-900 leading-tight">{activeConv?.clientName || activeConv?.freelancerName}</h3>
                    <p className="text-[11px] text-purple-600 font-medium">{activeConv?.jobTitle}</p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <p className="text-sm">No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === user?.id;
                        let attachments = [];
                        try {
                            attachments = msg.attachments ? (typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments) : [];
                        } catch (e) {
                            console.error("Failed to parse attachments", e);
                        }

                        let messageData = {};
                        try {
                            messageData = msg.messageData ? (typeof msg.messageData === 'string' ? JSON.parse(msg.messageData) : msg.messageData) : {};
                        } catch (e) {
                            console.error("Failed to parse messageData", e);
                        }

                        const renderSystemMessage = () => {
                            if (msg.messageType === 'cash_payment') {
                                const { amount, clientConfirmed, freelancerConfirmed } = messageData;
                                return (
                                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg mt-2 mb-1 w-full text-left">
                                        <p className="text-sm font-bold text-orange-800">💰 Cash Payment</p>
                                        <p className="text-sm font-semibold text-orange-900 mt-1">₹{amount || '0'}</p>
                                        <div className="text-[11px] mt-2 space-y-1 text-orange-700">
                                            <p className="flex items-center gap-1">
                                                {clientConfirmed ? '✅' : '⏳'} Client Confirmed
                                            </p>
                                            <p className="flex items-center gap-1">
                                                {freelancerConfirmed ? '✅' : '⏳'} Freelancer Received
                                            </p>
                                        </div>
                                    </div>
                                );
                            } else if (msg.messageType === 'completion_request') {
                                return (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mt-2 mb-1 w-full text-left">
                                        <p className="text-sm font-bold text-blue-800">✅ Project Completion Request</p>
                                        <p className="text-xs text-blue-700 mt-1 mb-2">The freelancer has requested to complete this project.</p>
                                        <div className="text-[11px] space-y-1 text-blue-700">
                                            <p className="flex items-center gap-1">
                                                {messageData?.status === 'accepted' ? '✅ accepted' : messageData?.status === 'rejected' ? '❌ rejected' : '⏳ Pending Client Approval'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            } else if (msg.messageType === 'review_request') {
                                return (
                                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mt-2 mb-1 w-full text-left">
                                        <p className="text-sm font-bold text-green-800">⭐ Review Request</p>
                                        <p className="text-xs text-green-700 mt-1 mb-2">Please leave a review for this project.</p>
                                    </div>
                                );
                            }
                            return null;
                        };

                        const systemCard = renderSystemMessage();

                        return (
                            <div
                                key={msg.id || index}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                                    <div className={`p-3 rounded-2xl shadow-sm ${isMe
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-white border border-purple-100 text-purple-900 rounded-tl-none'
                                        }`}>
                                        {systemCard ? systemCard : (
                                            msg.messageContent && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageContent}</p>
                                        )}
                                        {attachments.map((at, i) => (
                                            <div key={i}>{renderAttachment(at)}</div>
                                        ))}
                                    </div>
                                    <p className={`text-[10px] text-muted-foreground px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
