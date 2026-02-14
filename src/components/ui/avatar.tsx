import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
};

/** Deterministic gradient based on name string */
const gradients = [
    "from-violet-500 to-indigo-500",
    "from-sky-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-fuchsia-500 to-purple-500",
];

function getGradient(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn(
                    "rounded-full object-cover ring-2 ring-background",
                    sizeMap[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-linear-to-br text-white flex items-center justify-center font-bold ring-2 ring-background select-none",
                getGradient(name),
                sizeMap[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}
