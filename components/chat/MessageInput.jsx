"use client";

import React, { useState, useRef } from 'react';
import { useChat } from "@/hooks/ChatContext";
import { useAuth } from "@/hooks/AuthContext";
import { Send, Paperclip, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/services/api";

export function MessageInput() {
    const { sendMessage, activeThreadId, conversations, messages } = useChat();
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    const activeConv = conversations.find(c => c.id === activeThreadId);

    // Character Limit Calculations
    const isJobOpen = activeConv?.jobStatus === 'OPEN';
    const characterLimit = isJobOpen ? (activeConv?.characterLimit || 200) : null;

    // For both users, the original backend handles character counts based on `msg.senderId`.
    const charactersUsed = isJobOpen ? messages
        .filter(msg => msg.senderId === user?.id)
        .reduce((total, msg) => total + (msg.messageContent?.length || 0), 0) : 0;

    const charactersRemaining = characterLimit ? Math.max(0, characterLimit - charactersUsed) : null;
    const currentInputLength = text.length;
    const remainingForCurrentMessage = charactersRemaining !== null ? charactersRemaining - currentInputLength : null;

    const otherCharactersUsed = isJobOpen ? messages
        .filter(msg => msg.senderId && msg.senderId !== user?.id)
        .reduce((total, msg) => total + (msg.messageContent?.length || 0), 0) : 0;
    const otherCharactersRemaining = characterLimit ? Math.max(0, characterLimit - otherCharactersUsed) : null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // File size limit (e.g., 20MB for chat)
        if (file.size > 20 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select a file under 20MB for chat sharing.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'chat_attachment');

            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setAttachment({
                url: data.secure_url,
                name: data.original_filename || file.name,
                type: file.type,
                size: data.bytes || file.size
            });
        } catch (err) {
            console.error("Upload error:", err);
            toast({
                title: "Upload failed",
                description: "Could not upload attachment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if ((!text.trim() && !attachment) || isUploading) return;

        const messageText = text.trim();

        if (isJobOpen && remainingForCurrentMessage !== null && remainingForCurrentMessage < 0) {
            toast({
                title: "Character Limit Exceeded",
                description: `You have exceeded the maximum limit of ${characterLimit} characters.`,
                variant: "destructive",
            });
            return;
        }

        const messageType = attachment ? 'ATTACHMENT' : 'text';
        const attachments = attachment ? [attachment] : null;

        // Reset local state first for better UX
        setText("");
        setAttachment(null);

        try {
            await sendMessage(messageText, messageType, attachments);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
            // Optionally restore text if failed, but usually better to let user retry or just show error
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    if (!activeThreadId) return null;

    return (
        <div className="bg-white border-t border-purple-100 flex flex-col">
            {isJobOpen && characterLimit && (
                <div className="px-4 py-3 bg-purple-50/50 border-b border-purple-100/50 flex flex-col items-center justify-center text-center mx-4 mt-2 rounded-xl">
                    <p className="text-sm font-semibold text-purple-900 mb-1">Character Limit Active</p>
                    <p className="text-xs text-purple-700 font-medium">
                        {charactersRemaining !== null
                            ? `${Math.max(0, remainingForCurrentMessage)} characters remaining (${charactersUsed + currentInputLength}/${characterLimit} used)`
                            : `Maximum ${characterLimit} characters total`
                        }
                    </p>
                    <p className="text-[10px] text-purple-500 italic mt-1.5">
                        Limit will be removed once the client accepts you as their freelancer.
                    </p>
                    {otherCharactersRemaining === 0 && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">
                            The other party has exhausted their character limit.
                        </p>
                    )}
                </div>
            )}
            <div className="p-4">
                {attachment && (
                    <div className="mb-3 flex items-center gap-3 p-2 bg-purple-50 rounded-lg border border-purple-100 max-w-sm">
                        {attachment.type.startsWith('image/') ? (
                            <div className="h-10 w-10 rounded bg-gray-200 overflow-hidden">
                                <img src={attachment.url} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                                <Paperclip className="h-5 w-5 text-purple-600" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate italic text-purple-900">{attachment.name}</p>
                            <p className="text-[10px] text-purple-500 uppercase">Ready to send</p>
                        </div>
                        <button
                            onClick={removeAttachment}
                            className="p-1 hover:bg-purple-200 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-purple-600" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={charactersRemaining === 0 ? "Character limit reached" : "Type a message..."}
                            className="w-full bg-gray-50 border border-purple-100 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none min-h-[48px] max-h-32 text-sm disabled:opacity-50"
                            rows={1}
                            style={{ height: 'auto' }}
                            maxLength={charactersRemaining !== null ? charactersRemaining + currentInputLength : undefined}
                            disabled={isJobOpen && charactersRemaining === 0 && currentInputLength === 0}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-purple-400 hover:text-purple-600 hover:bg-purple-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Paperclip className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={(!text.trim() && !attachment) || isUploading}
                        className="h-[48px] w-[48px] rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                    >
                        <Send className="h-5 w-5 text-white" />
                    </Button>
                </form>
                <p className="mt-2 text-[10px] text-muted-foreground text-center">
                    Press Enter to send, Shift + Enter for new line.
                </p>
            </div>
        </div>
    );
}
