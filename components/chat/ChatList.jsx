"use client";

import React from 'react';
import { useChat } from "@/hooks/ChatContext";
import { formatDistanceToNow } from "date-fns";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ChatList() {
    const { conversations, selectThread, activeThreadId, conversationsLoading } = useChat();
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredConversations = conversations.filter(conv => {
        const name = (conv.clientName || conv.freelancerName || "").toLowerCase();
        const jobTitle = (conv.jobTitle || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || jobTitle.includes(query);
    });

    if (conversationsLoading && conversations.length === 0) {
        return (
            <div className="flex-1 space-y-4 p-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-purple-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 rounded bg-purple-100" />
                            <div className="h-3 w-32 rounded bg-purple-100" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-r border-purple-100 w-80">
            <div className="p-4 border-b border-purple-100">
                <h2 className="text-xl font-bold text-purple-900 mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-400" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 border-purple-100 focus-visible:ring-purple-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        {searchQuery ? "No chats found" : "No active conversations"}
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => selectThread(conv.id)}
                            className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-purple-50 ${activeThreadId === conv.id ? 'bg-purple-100 hover:bg-purple-100' : ''
                                }`}
                        >
                            <div className="relative">
                                {conv.clientPhoto || conv.freelancerPhoto ? (
                                    <img
                                        src={conv.clientPhoto || conv.freelancerPhoto}
                                        alt="Profile"
                                        className="h-12 w-12 rounded-full object-cover border border-purple-200"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                        {(conv.clientName || conv.freelancerName || "?").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {conv.status === 'NEW' && <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="font-semibold text-purple-900 truncate">
                                        {conv.clientName || conv.freelancerName}
                                    </h3>
                                    <span className="text-[10px] text-purple-400 whitespace-nowrap">
                                        {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false }) : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-purple-700 font-medium truncate mb-0.5">
                                    {conv.jobTitle}
                                </p>
                                <p className="text-xs text-muted-foreground truncate italic">
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
