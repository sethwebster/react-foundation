import Image from "next/image";
import Link from "next/link";

interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  size?: number;
  href?: string;
  showBorder?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  size = 40,
  href,
  showBorder = true,
  className = "",
}: UserAvatarProps) {
  const initial = user.name?.charAt(0) || user.email?.charAt(0) || "U";
  const borderClass = showBorder
    ? size >= 80
      ? "border-4 border-white/20"
      : "border-2 border-white/20"
    : "";

  const avatar = (
    <div
      className={`relative overflow-hidden rounded-full ${borderClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || "User"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-indigo-500 font-bold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="transition hover:opacity-80"
      >
        {avatar}
      </Link>
    );
  }

  return avatar;
}
