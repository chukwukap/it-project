"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Palette } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";

const projectColors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#06b6d4", // Cyan
    "#71717a", // Zinc
];

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: string;
        name: string;
        description: string | null;
        color: string;
    };
    onUpdate: (projectId: string, data: { name?: string; description?: string; color?: string }) => Promise<void>;
}

export function EditProjectModal({ isOpen, onClose, project, onUpdate }: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [color, setColor] = useState(project.color);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when project changes
    useEffect(() => {
        setName(project.name);
        setDescription(project.description || "");
        setColor(project.color);
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Project name is required");
            return;
        }

        setIsLoading(true);
        try {
            await onUpdate(project.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                color,
            });
            toast.success("Project updated");
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update project");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md mx-4 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">Edit Project</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <Input
                        label="Project Name"
                        placeholder="Enter project name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            placeholder="Describe your project..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-foreground mb-2">
                            <Palette className="w-3.5 h-3.5" />
                            Project Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {projectColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-lg transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-surface ring-foreground scale-110" : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
