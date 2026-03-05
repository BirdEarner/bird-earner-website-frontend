"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/hooks/AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user, role } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const pollingRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        if (!user || !role?.active) return;

        setConversationsLoading(true);
        try {
            const roleId = role.active === 'client' ? role.clientData?.id : role.freelancerData?.id;
            if (!roleId) return;

            const endpoint = role.active === 'client'
                ? `${API_BASE_URL}/api/chats/conversations/client/${roleId}`
                : `${API_BASE_URL}/api/chats/conversations/freelancer/${roleId}`;

            const res = await fetch(endpoint, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setConversationsLoading(false);
        }
    }, [user, role]);

    const fetchMessages = useCallback(async (threadId) => {
        if (!threadId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/chats/messages/${threadId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    }, []);

    const sendMessage = async (content, type = 'text', attachments = null) => {
        if (!activeThreadId || !user) return;

        const activeConv = conversations.find(c => c.id === activeThreadId);
        if (!activeConv) return;

        // Determine receiver
        const receiverId = role.active === 'client' ? activeConv.freelancerUserId : activeConv.clientUserId;
        const senderType = role.active === 'client' ? 'CLIENT' : 'FREELANCER';

        try {
            const res = await fetch(`${API_BASE_URL}/api/chats/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatThreadId: activeThreadId,
                    senderId: user.id,
                    receiverId,
                    messageContent: content,
                    messageType: type,
                    attachments,
                    senderType
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                // Optimistically update messages
                setMessages(prev => [...prev, data.data]);
                // Refresh conversations to update "last message"
                fetchConversations();
                return data.data;
            }
        } catch (err) {
            console.error("Error sending message:", err);
            throw err;
        }
    };

    const markThreadAsRead = async (threadId) => {
        try {
            await fetch(`${API_BASE_URL}/api/chats/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatThreadId: threadId }),
                credentials: 'include'
            });
            // Optionally update local conversation state
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    // Set active thread and load messages
    const selectThread = (threadId) => {
        setActiveThreadId(threadId);
        if (threadId) {
            setMessages([]); // Clear current messages while loading
            fetchMessages(threadId);
            markThreadAsRead(threadId);
        }
    };

    // Initial load and polling
    useEffect(() => {
        if (user && role?.active) {
            fetchConversations();

            // Poll for updates every 10 seconds
            pollingRef.current = setInterval(() => {
                fetchConversations();
                if (activeThreadId) {
                    fetchMessages(activeThreadId);
                }
            }, 10000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [user, role, activeThreadId, fetchConversations, fetchMessages]);

    return (
        <ChatContext.Provider value={{
            conversations,
            messages,
            activeThreadId,
            loading,
            conversationsLoading,
            selectThread,
            sendMessage,
            fetchConversations,
            fetchMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
