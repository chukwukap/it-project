"use client";

import { Search, Video, Phone, Paperclip, Send, CheckCheck, ArrowLeft, MoreVertical, Image as ImageIcon, Smile, MoreHorizontal, Loader2, MessageCircle, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useConversations, useMessages, useUsers } from "@/hooks";
import { toast } from "sonner";

interface Participant {
    id: string;
    name: string;
    avatar: string | null;
}

interface Conversation {
    id: string;
    participant: Participant | null;
    lastMessage: {
        content: string;
        createdAt: string;
        isSender: boolean;
    } | null;
    unreadCount: number;
    updatedAt: string;
}

interface Message {
    id: string;
    content: string;
    sender: Participant;
    isSender: boolean;
    createdAt: string;
}

function ChatItem({ conversation, isActive, onClick }: { conversation: Conversation; isActive: boolean; onClick: () => void }) {
    const participant = conversation.participant;
    if (!participant) return null;

    const timeAgo = conversation.lastMessage
        ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${isActive
                ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
        >
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white font-bold text-sm">
                    {participant.avatar ? (
                        <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        participant.name.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold truncate text-foreground">
                        {participant.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">{timeAgo}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {conversation.lastMessage?.isSender ? 'You: ' : ''}{conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conversation.unreadCount}
                        </span>
                    ) : conversation.lastMessage?.isSender ? (
                        <CheckCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" strokeWidth={2} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ChatBubble({ message, showDate }: { message: Message; showDate?: string }) {
    return (
        <>
            {showDate && (
                <div className="flex justify-center my-6">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold text-muted-foreground rounded-full border border-zinc-200 dark:border-zinc-800 tracking-wider uppercase">
                        {showDate}
                    </span>
                </div>
            )}
            <div className={`flex flex-col ${message.isSender ? 'items-end' : 'items-start'} mb-2 group`}>
                <div
                    className={`max-w-[340px] px-4 py-2.5 shadow-sm transition-all text-sm ${message.isSender
                        ? 'bg-foreground text-background rounded-2xl rounded-tr-sm'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground rounded-2xl rounded-tl-sm'
                        }`}
                >
                    <p className="leading-relaxed">{message.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </>
    );
}

function NewConversationModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (userId: string) => void }) {
    const [search, setSearch] = useState("");
    const { users, isLoading } = useUsers({ search: search || undefined });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-lg font-bold text-foreground mb-4">New Conversation</h2>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
                    ) : (
                        users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => onSelect(user.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function MobileChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
    const participant = conversation.participant;
    const { messages, isLoading, sendMessage } = useMessages(conversation.id);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            await sendMessage(newMessage);
            setNewMessage("");
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (!participant) return null;

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col lg:hidden animate-slide-up">
            <div className="bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10 w-full">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white font-bold text-xs">
                        {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">{participant.name}</h3>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-12">No messages yet. Say hello!</p>
                ) : (
                    messages.map((message: Message) => (
                        <ChatBubble key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-background px-3 py-3 border-t border-border flex items-end gap-2 sticky bottom-0 safe-area-bottom">
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center px-3 py-2 min-h-[40px] border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all">
                    <input
                        type="text"
                        placeholder="Message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="p-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

export default function MessagePage() {
    const { conversations, isLoading: convLoading, createConversation } = useConversations();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations[activeIndex] as Conversation | undefined;
    const { messages, isLoading: msgLoading, sendMessage } = useMessages(activeConversation?.id || null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleChatClick = (index: number) => {
        setActiveIndex(index);
        setShowMobileChat(true);
    };

    const handleNewConversation = async (userId: string) => {
        try {
            await createConversation(userId);
            setShowNewModal(false);
            toast.success("Conversation started");
        } catch (error) {
            toast.error("Failed to start conversation");
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            await sendMessage(newMessage);
            setNewMessage("");
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 lg:pb-0 h-[calc(100vh-3.5rem)] flex flex-col">
            {showMobileChat && activeConversation && (
                <MobileChatView
                    conversation={activeConversation}
                    onBack={() => setShowMobileChat(false)}
                />
            )}

            <NewConversationModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSelect={handleNewConversation}
            />

            <div className="flex gap-0 h-full bg-background md:border border-border md:rounded-xl overflow-hidden shadow-sm">
                {/* Chat List - Sidebar */}
                <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col h-full bg-surface border-r border-border">
                    <div className="p-4 border-b border-border bg-surface shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                                Messages
                                {conversations.length > 0 && (
                                    <span className="text-xs font-normal text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                        {conversations.length}
                                    </span>
                                )}
                            </h1>
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-9 pl-9 pr-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none placeholder:text-muted-foreground"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        {convLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MessageCircle className="w-10 h-10 text-muted-foreground mb-3 opacity-20" />
                                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Start a new conversation</p>
                                <button
                                    onClick={() => setShowNewModal(true)}
                                    className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                                >
                                    New Message
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {conversations.map((conv: Conversation, i: number) => (
                                    <ChatItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={i === activeIndex}
                                        onClick={() => handleChatClick(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="hidden md:flex flex-col flex-1 bg-zinc-50/50 dark:bg-zinc-900/50">
                    {!activeConversation ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                            <h2 className="text-lg font-bold text-foreground mb-2">Select a conversation</h2>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Choose a conversation from the list or start a new one
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white font-bold text-sm">
                                        {activeConversation.participant?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">{activeConversation.participant?.name}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {msgLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-12">No messages yet. Say hello!</p>
                                ) : (
                                    messages.map((message: Message) => (
                                        <ChatBubble key={message.id} message={message} />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-surface border-t border-border shrink-0">
                                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center px-4 py-2.5 min-h-[44px] border border-transparent focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all shadow-inner">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            className="flex-1 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || !newMessage.trim()}
                                        className="p-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
