"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, FileText, Star, Loader2, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUsers, useFollow } from "@/hooks";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Avatar colors for users without avatars (Monochrome/Subtle)
const avatarGradients = [
    "linear-gradient(135deg, #71717a 0%, #52525b 100%)", // Zinc
    "linear-gradient(135deg, #a1a1aa 0%, #71717a 100%)", // Zinc Light
    "linear-gradient(135deg, #52525b 0%, #3f3f46 100%)", // Zinc Dark
];

function getAvatarGradient(index: number) {
    return avatarGradients[index % avatarGradients.length];
}

interface UserCardProps {
    user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        taskCount?: number;
        projectCount?: number;
    };
    index: number;
    compact?: boolean;
    isCurrentUser?: boolean;
}

function UserCard({ user, index, compact = false, isCurrentUser = false }: UserCardProps) {
    const { isFollowing, toggleFollow, isLoading: followLoading } = useFollow(isCurrentUser ? "" : user.id);
    const [isToggling, setIsToggling] = useState(false);

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsToggling(true);
        try {
            await toggleFollow();
            toast.success(isFollowing ? `Unfollowed ${user.name}` : `Following ${user.name}`);
        } catch (error) {
            toast.error("Failed to update follow status");
        } finally {
            setIsToggling(false);
        }
    };

    // Generate mock rating (in real app, this would come from DB)
    const rating = (4.5 + (index % 5) * 0.1).toFixed(1);
    const role = ["UI/UX Designer", "Web Developer", "Mobile Developer", "3D Designer", "Backend Dev"][index % 5];

    if (compact) {
        return (
            <Link
                href={`/users/${user.id}`}
                className="shrink-0 w-[260px] bg-surface rounded-lg p-4 border border-border group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors block"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: user.avatar ? undefined : getAvatarGradient(index) }}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                            {user.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{role}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{user.taskCount || 0} Tasks</span>
                    </div>
                    {!isCurrentUser && (
                        <button
                            onClick={handleFollow}
                            disabled={isToggling || followLoading}
                            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors border disabled:opacity-50 ${isFollowing
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border-transparent'
                                : 'bg-transparent text-foreground border-border hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                }`}
                        >
                            {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/users/${user.id}`}
            className="w-full bg-surface rounded-lg p-5 border border-border group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all block"
        >
            <div className="flex items-start gap-4 mb-4">
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-base"
                    style={{ background: user.avatar ? undefined : getAvatarGradient(index) }}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-base font-bold text-foreground truncate group-hover:text-brand-500 transition-colors">
                            {user.name}
                        </h4>
                        {index < 3 && (
                            <div className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] rounded uppercase tracking-wide border border-zinc-200 dark:border-zinc-700">
                                Top Rated
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{role}</p>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed h-10">
                Hi, I&apos;m {user.name}. I&apos;m a professional {role.toLowerCase()} focused on building accessible and performant interfaces.
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{user.taskCount || 0} Tasks</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{rating}</span>
                </div>
                <div className="ml-auto">
                    {!isCurrentUser && (
                        <button
                            onClick={handleFollow}
                            disabled={isToggling || followLoading}
                            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors border disabled:opacity-50 ${isFollowing
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border-transparent'
                                : 'bg-foreground text-background border-transparent hover:opacity-90'
                                }`}
                        >
                            {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function MentorsPage() {
    const [search, setSearch] = useState("");
    const { data: session } = useSession();
    const { users, isLoading, error } = useUsers({ search: search || undefined });

    // Separate recent users (first 4)
    const recentUsers = users.slice(0, 4);

    return (
        <div className="min-h-screen pb-20 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                        Team
                    </h1>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Filter members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-border rounded-lg text-sm transition-all focus:border-foreground focus:ring-0 outline-none placeholder:text-muted-foreground"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading team...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/20 text-sm font-medium text-center">
                    Failed to load members. Please try again.
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-lg text-center">
                    <Users className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
                    <h2 className="text-sm font-bold text-foreground">No members found</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Try modifying your search query.
                    </p>
                </div>
            ) : (
                <div className="space-y-10 animate-fade-in">
                    {/* Recent Mentors Section */}
                    {!search && recentUsers.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    Top Performers
                                </h2>
                                <div className="flex items-center gap-1">
                                    <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-muted-foreground hover:text-foreground transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-thin">
                                {recentUsers.map((user, i) => (
                                    <UserCard key={user.id} user={user} index={i} compact isCurrentUser={user.id === session?.user?.id} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All Mentors Section */}
                    <section>
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 px-1">
                            {search ? `Results (${users.length})` : "All Members"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {users.map((user, i) => (
                                <UserCard key={user.id} user={user} index={i} isCurrentUser={user.id === session?.user?.id} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
