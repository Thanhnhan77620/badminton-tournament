import React, { useState } from 'react';

interface PlayerAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
  };

  // Generate clean initials (e.g. "Nguyễn Văn An" -> "NA")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Consistent color palette based on name hash
  const colors = [
    'bg-blue-600 text-white',
    'bg-indigo-600 text-white',
    'bg-sky-700 text-white',
    'bg-slate-700 text-white',
    'bg-teal-700 text-white',
    'bg-cyan-700 text-white',
  ];

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  if (!avatarUrl || imageError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-medium shrink-0 border border-white shadow-xs ${bgColor} ${sizeClasses[size]} ${className}`}
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100 ${sizeClasses[size]} ${className}`}
    >
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    </div>
  );
};
