import React, { FC, HTMLAttributes, useMemo, CSSProperties } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: number; // size in pixels
  initials?: string; // fallback initials if no src
  style?: CSSProperties; // ensure style prop is typed correctly
}

const Avatar: FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 40,
  initials,
  style,
  ...rest
}) => {
  const avatarStyle: CSSProperties = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: '#ccc',
    color: '#555',
    fontWeight: 'bold',
    fontSize: size / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none' as CSSProperties['userSelect'], // cast here
    ...style,
  }), [size, style]);

  return (
    <div {...rest} style={avatarStyle}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        initials || <span>?</span>
      )}
    </div>
  );
};

export default Avatar;

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {}

const AvatarFallback: FC<AvatarFallbackProps> = ({ children, ...rest }) => {
 return (
 <div {...rest} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
 {children}
 </div>
 );
};

export { Avatar, AvatarFallback };

