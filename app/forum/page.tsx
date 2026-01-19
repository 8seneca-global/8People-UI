"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    MessageSquare,
    ThumbsUp,
    Heart,
    Sparkles,
    Lightbulb,
    HandHeart,
    Pin,
    Calendar,
    Plus,
    FileText,
    Shield,
    BookOpen,
    Send,
    Image as ImageIcon,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { forumPosts, forumComments, type ForumPost, type ReactionType, type PostCategory } from "@/lib/mock-forum-data"

export default function ForumPage() {
    const [newComment, setNewComment] = useState("")
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
    const [postTitle, setPostTitle] = useState("")
    const [postContent, setPostContent] = useState("")
    const [postCategory, setPostCategory] = useState<PostCategory>("discussion")
    const [postImages, setPostImages] = useState<string[]>([])
    const [imageUrl, setImageUrl] = useState("")

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            setPostImages([...postImages, imageUrl])
            setImageUrl("")
        }
    }

    const handleRemoveImage = (index: number) => {
        setPostImages(postImages.filter((_, i) => i !== index))
    }

    const handleCreatePost = () => {
        // TODO: Add post to store
        console.log({ postTitle, postContent, postCategory, postImages })
        setIsCreatePostOpen(false)
        setPostTitle("")
        setPostContent("")
        setPostCategory("discussion")
        setPostImages([])
    }

    const getReactionIcon = (type: ReactionType, className?: string) => {
        const iconClass = className || "h-4 w-4"
        switch (type) {
            case "like":
                return <ThumbsUp className={iconClass} />
            case "love":
                return <Heart className={iconClass} />
            case "celebrate":
                return <Sparkles className={iconClass} />
            case "insightful":
                return <Lightbulb className={iconClass} />
            case "support":
                return <HandHeart className={iconClass} />
        }
    }

    const getCategoryBadge = (category: ForumPost["category"]) => {
        const variants = {
            announcement: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            update: "bg-green-500/10 text-green-600 border-green-500/20",
            discussion: "bg-purple-500/10 text-purple-600 border-purple-500/20",
            event: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        }

        return (
            <Badge className={cn("text-xs border", variants[category])}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const renderPost = (post: ForumPost) => {
        // Group reactions by type
        const reactionCounts = post.reactions.reduce(
            (acc, r) => {
                acc[r.type] = (acc[r.type] || 0) + 1
                return acc
            },
            {} as Record<ReactionType, number>,
        )

        // Get top 2 comments for this post
        const postComments = forumComments.filter((c) => c.postId === post.id && !c.parentCommentId).slice(0, 2)

        return (
            <Card key={post.id} className="overflow-hidden">
                {/* Post Header */}
                <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(post.authorName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm">{post.authorName}</p>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                                {post.authorDepartment && (
                                    <>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <p className="text-xs text-muted-foreground">{post.authorDepartment}</p>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                                {getCategoryBadge(post.category)}
                                {post.isPinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-base">{post.title}</h3>
                        <p className="text-sm text-card-foreground whitespace-pre-wrap">{post.content}</p>

                        {/* Post Images */}
                        {post.images && post.images.length > 0 && (
                            <div className={cn("grid gap-2", post.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                                {post.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Post image ${idx + 1}`}
                                        className="w-full rounded-lg object-cover max-h-96"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-4 pt-4 mt-4 border-t">
                        {Object.entries(reactionCounts).map(([type, count]) => (
                            <button
                                key={type}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <span className="group-hover:scale-110 transition-transform">
                                    {getReactionIcon(type as ReactionType)}
                                </span>
                                <span className="text-xs font-medium">{count}</span>
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">{post.commentCount}</span>
                        </div>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="grid grid-cols-5 gap-2 pt-3 mt-3 border-t">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                            {getReactionIcon("like", "h-3.5 w-3.5")}
                            Like
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                            {getReactionIcon("love", "h-3.5 w-3.5")}
                            Love
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                            {getReactionIcon("celebrate", "h-3.5 w-3.5")}
                            Celebrate
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                            {getReactionIcon("insightful", "h-3.5 w-3.5")}
                            Insightful
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                            {getReactionIcon("support", "h-3.5 w-3.5")}
                            Support
                        </Button>
                    </div>

                    {/* Top Comments */}
                    {postComments.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                            {postComments.map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-secondary text-xs">
                                            {getInitials(comment.authorName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-xs">{comment.authorName}</p>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                        {comment.reactions.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                {comment.reactions.map((r, idx) => (
                                                    <span key={idx} className="text-xs text-muted-foreground">
                                                        {getReactionIcon(r.type, "h-3 w-3 inline")}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {post.commentCount > 2 && (
                                <button className="text-xs text-primary hover:underline ml-10">
                                    View all {post.commentCount} comments
                                </button>
                            )}
                        </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-4 pt-4 border-t flex gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1 h-9 text-sm"
                            />
                            <Button size="sm" className="h-9 px-3">
                                <Send className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <AdminLayout title="Company Forum" subtitle="Stay connected with your team">
            {/* Max-width container for better readability */}
            <div className="max-w-4xl mx-auto">
                <div className="space-y-4">
                    {/* Create Post Card */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">You</AvatarFallback>
                                </Avatar>
                                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex-1 justify-start text-muted-foreground h-10">
                                            Share an update with your team...
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create Post</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="What's on your mind?"
                                                    value={postTitle}
                                                    onChange={(e) => setPostTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="content">Content</Label>
                                                <Textarea
                                                    id="content"
                                                    placeholder="Share more details..."
                                                    value={postContent}
                                                    onChange={(e) => setPostContent(e.target.value)}
                                                    rows={6}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select value={postCategory} onValueChange={(v) => setPostCategory(v as PostCategory)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="announcement">Announcement</SelectItem>
                                                        <SelectItem value="update">Update</SelectItem>
                                                        <SelectItem value="discussion">Discussion</SelectItem>
                                                        <SelectItem value="event">Event</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Images</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Enter image URL"
                                                        value={imageUrl}
                                                        onChange={(e) => setImageUrl(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                                                    />
                                                    <Button type="button" onClick={handleAddImage} size="sm">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {postImages.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {postImages.map((img, idx) => (
                                                            <div key={idx} className="relative group">
                                                                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                                                                <button
                                                                    onClick={() => handleRemoveImage(idx)}
                                                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreatePost}>Post</Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Posts Feed */}
                    {forumPosts
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1
                            if (!a.isPinned && b.isPinned) return 1
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        })
                        .map(renderPost)}
                </div>
            </div>
        </AdminLayout>
    )
}
