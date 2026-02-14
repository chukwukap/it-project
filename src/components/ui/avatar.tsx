import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn("rounded-full object-cover", sizes[size], className)}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-primary text-white flex items-center justify-center font-medium",
                sizes[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}
