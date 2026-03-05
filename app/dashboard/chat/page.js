"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/ChatContext";

function ChatContent() {
    const searchParams = useSearchParams();
    const { selectThread, activeThreadId } = useChat();

    useEffect(() => {
        const threadId = searchParams.get('threadId');
        if (threadId && threadId !== activeThreadId) {
            selectThread(threadId);
        }
    }, [searchParams, selectThread, activeThreadId]);

    return (
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
            {/* Sidebar List */}
            <ChatList />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm overflow-hidden">
                <ChatWindow />
                <MessageInput />
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading inbox...</div>}>
            <ChatContent />
        </Suspense>
    );
}
