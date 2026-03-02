// AvatarFigure.jsx
import React, { useMemo, useEffect, useRef, useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './AvatarFigure.css';

// ==================== GAME-STYLE AVATAR CONFIG ====================
const AVATAR_CONFIG = {
  skin: {
    default: '#FDDBB4',
    dark: '#C68B5E',
    light: '#FCE5CD',
    tan: '#E0AC69',
    pale: '#FFE0C0'
  },
  hair: {
    black: '#1A1A1A',
    brown: '#5C3A1E',
    blonde: '#D4A76A',
    red: '#B84A3A',
    blue: '#3B82F6',
    pink: '#EC4899',
    purple: '#8B5CF6',
    silver: '#94A3B8'
  },
  outfit: {
    casual: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    formal: ['#1F2937', '#4B5563', '#6B7280', '#111827'],
    sporty: ['#DC2626', '#2563EB', '#16A34A', '#EAB308'],
    gamer: ['#8B5CF6', '#EC4899', '#6366F1', '#06B6D4']
  },
  eyes: {
    brown: '#634832',
    green: '#2e7d32',
    blue: '#1976d2',
    gray: '#475569'
  },
  animation: {
    idle: 3000,
    speaking: 2000,
    listening: 2500,
    thinking: 2800,
    nod: 1500,
    gesture: 1800,
    blinkInterval: 4000,
    blinkDuration: 150,
    breatheIntensity: 0.3
  },
  sizes: {
    sm: { width: 120, height: 160, scale: 0.6 },
    md: { width: 200, height: 260, scale: 1 },
    lg: { width: 280, height: 360, scale: 1.4 },
    xl: { width: 360, height: 460, scale: 1.8 }
  },
  expressions: {
    neutral: { brows: 'neutral', eyes: 'normal', mouth: 'neutral' },
    smile: { brows: 'neutral', eyes: 'happy', mouth: 'smile' },
    thinking: { brows: 'thinking', eyes: 'thinking', mouth: 'thinking' },
    surprised: { brows: 'raised', eyes: 'wide', mouth: 'surprised' },
    serious: { brows: 'serious', eyes: 'normal', mouth: 'serious' }
  }
};

// ==================== PROP TYPES ====================
export const AvatarPropTypes = {
  avatar: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    gender: PropTypes.oneOf(['male', 'female', 'non-binary']),
    role: PropTypes.string,
    style: PropTypes.oneOf(['casual', 'formal', 'sporty', 'gamer']),
    hairColor: PropTypes.oneOf(['black', 'brown', 'blonde', 'red', 'blue', 'pink', 'purple', 'silver']),
    eyeColor: PropTypes.oneOf(['brown', 'green', 'blue', 'gray']),
    skinTone: PropTypes.oneOf(['default', 'dark', 'light', 'tan', 'pale']),
    outfitColor: PropTypes.string,
    accessory: PropTypes.oneOf(['glasses', 'headphones', 'cap', 'none']),
    emotion: PropTypes.oneOf(['neutral', 'smile', 'thinking', 'surprised', 'serious'])
  }),
  state: PropTypes.oneOf(['idle', 'speaking', 'listening', 'thinking', 'nodding', 'gesturing']),
  isActive: PropTypes.bool,
  onStateChange: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  priority: PropTypes.bool,
  showNameplate: PropTypes.bool,
  showStatus: PropTypes.bool
};

// ==================== UTILITY FUNCTIONS ====================
const getSkinColor = (skinTone) => {
  return AVATAR_CONFIG.skin[skinTone] || AVATAR_CONFIG.skin.default;
};

const getHairColor = (hairColor) => {
  return AVATAR_CONFIG.hair[hairColor] || AVATAR_CONFIG.hair.brown;
};

const getEyeColor = (eyeColor) => {
  return AVATAR_CONFIG.eyes[eyeColor] || AVATAR_CONFIG.eyes.brown;
};

const getOutfitColors = (style, customColor) => {
  const colors = AVATAR_CONFIG.outfit[style] || AVATAR_CONFIG.outfit.casual;
  if (customColor) {
    return [customColor, ...colors.slice(1)];
  }
  return colors;
};

const getAvatarSeed = (avatar) => {
  if (avatar?.id) return Math.abs(Number(avatar.id) || 0);
  const key = `${avatar?.name || ''}${avatar?.role || ''}`;
  return key.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 1;
};

// ==================== CUSTOM HOOKS ====================
const useAvatarState = (initialState = 'idle', onStateChange) => {
  const [currentState, setCurrentState] = useState(initialState);
  const [expression, setExpression] = useState('neutral');
  const timersRef = useRef({});

  const transitionTo = useCallback((newState, duration) => {
    setCurrentState(newState);
    
    // Clear existing timer for this state
    if (timersRef.current[newState]) {
      clearTimeout(timersRef.current[newState]);
    }

    // Set auto-transition back to idle
    if (duration && newState !== 'idle') {
      timersRef.current[newState] = setTimeout(() => {
        setCurrentState('idle');
        setExpression('neutral');
        onStateChange?.('idle');
      }, duration);
    }

    onStateChange?.(newState);
  }, [onStateChange]);

  // Update expression based on state
  useEffect(() => {
    const expressionMap = {
      speaking: 'smile',
      listening: 'neutral',
      thinking: 'thinking',
      nodding: 'smile',
      gesturing: 'smile',
      idle: 'neutral'
    };
    
    if (currentState !== 'idle') {
      setExpression(expressionMap[currentState] || 'neutral');
    }
  }, [currentState]);

  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return { currentState, expression, transitionTo };
};

const useBlinkAnimation = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef(null);

  useEffect(() => {
    const scheduleBlink = () => {
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), AVATAR_CONFIG.animation.blinkDuration);
        scheduleBlink();
      }, AVATAR_CONFIG.animation.blinkInterval);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimerRef.current);
  }, []);

  return isBlinking;
};

const useIdleAnimation = (isActive) => {
  const [idleMotion, setIdleMotion] = useState({ rotate: 0, translateY: 0 });

  useEffect(() => {
    if (!isActive) return;

    let frame;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Subtle breathing and floating motion
      const breathe = Math.sin(elapsed * 2) * AVATAR_CONFIG.animation.breatheIntensity;
      const float = Math.sin(elapsed * 1.5) * 2;
      
      setIdleMotion({
        rotate: breathe * 0.5,
        translateY: float
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  return idleMotion;
};

// ==================== SVG COMPONENTS ====================
const AvatarDefs = memo(({ primaryColor, hasGlow = false }) => (
  <defs>
    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
    </linearGradient>
    
    <radialGradient id="skinGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
    </radialGradient>
    
    <filter id="softShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
    </filter>
    
    {hasGlow && (
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    )}
    
    <clipPath id="avatarClip">
      <circle cx="100" cy="120" r="80" />
    </clipPath>
  </defs>
));

AvatarDefs.displayName = 'AvatarDefs';

const Head = memo(({ skinColor, eyeColor, expression, isBlinking, isActive }) => {
  const eyeWidth = isBlinking ? 12 : 14;
  const eyeHeight = isBlinking ? 2 : 10;
  
  const getBrowPath = (side) => {
    const baseY = expression === 'thinking' ? 90 : 92;
    const baseX = side === 'left' ? 68 : 92;
    
    if (expression === 'surprised') {
      return `M${baseX},${baseY-2} Q${baseX+12},${baseY-8} ${baseX+24},${baseY-2}`;
    }
    if (expression === 'serious') {
      return `M${baseX},${baseY} Q${baseX+12},${baseY-4} ${baseX+24},${baseY}`;
    }
    return `M${baseX},${baseY} Q${baseX+12},${baseY-6} ${baseX+24},${baseY-2}`;
  };

  return (
    <g className="avatar-head" filter="url(#softShadow)">
      {/* Head base */}
      <circle cx="100" cy="120" r="40" fill={skinColor} />
      
      {/* Hair base */}
      <path d="M70 80 Q100 60 130 80 L130 100 Q100 85 70 100 Z" fill="url(#hairGradient)" />
      
      {/* Ears */}
      <circle cx="60" cy="120" r="10" fill={skinColor} />
      <circle cx="140" cy="120" r="10" fill={skinColor} />
      
      {/* Eyebrows */}
      <path d={getBrowPath('left')} stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={getBrowPath('right')} stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Eyes */}
      <g className="avatar-eyes">
        {/* Left eye */}
        <ellipse cx="80" cy="110" rx={eyeWidth} ry={eyeHeight} fill="white" />
        {!isBlinking && (
          <>
            <circle cx="80" cy="110" r="4" fill={eyeColor} />
            <circle cx="82" cy="108" r="1.5" fill="white" />
          </>
        )}
        
        {/* Right eye */}
        <ellipse cx="120" cy="110" rx={eyeWidth} ry={eyeHeight} fill="white" />
        {!isBlinking && (
          <>
            <circle cx="120" cy="110" r="4" fill={eyeColor} />
            <circle cx="122" cy="108" r="1.5" fill="white" />
          </>
        )}
      </g>
      
      {/* Nose */}
      <path d="M95 125 L100 135 L105 125" stroke="#8B5A2B" strokeWidth="2" fill="none" />
      
      {/* Mouth */}
      {expression === 'smile' && (
        <path d="M85 145 Q100 155 115 145" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {expression === 'neutral' && (
        <path d="M90 145 L110 145" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {expression === 'thinking' && (
        <path d="M85 150 Q100 145 115 150" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {expression === 'surprised' && (
        <circle cx="100" cy="145" r="5" fill="#E11D48" />
      )}
    </g>
  );
});

Head.displayName = 'Head';

const Body = memo(({ outfitColor, style = 'casual', isActive }) => {
  const outfitColors = getOutfitColors(style, outfitColor);
  
  return (
    <g className="avatar-body">
      {/* Torso */}
      <rect x="70" y="160" width="60" height="80" rx="15" fill={outfitColors[0]} filter="url(#softShadow)" />
      
      {/* Shirt detail */}
      <path d="M85 160 L100 175 L115 160" fill={outfitColors[1]} opacity="0.3" />
      
      {/* Collar */}
      <path d="M90 165 L100 175 L110 165" fill="white" opacity="0.5" />
      
      {/* Arms */}
      <g className={`left-arm ${isActive ? 'avatar-gesture' : ''}`}>
        <rect x="45" y="165" width="25" height="60" rx="12" fill={outfitColors[0]} />
        <circle cx="57" cy="230" r="10" fill={getSkinColor('default')} />
      </g>
      
      <g className={`right-arm ${isActive ? 'avatar-gesture' : ''}`}>
        <rect x="130" y="165" width="25" height="60" rx="12" fill={outfitColors[0]} />
        <circle cx="142" cy="230" r="10" fill={getSkinColor('default')} />
      </g>
      
      {/* Accessory pocket or design */}
      <rect x="95" y="185" width="10" height="15" rx="3" fill={outfitColors[2]} opacity="0.5" />
    </g>
  );
});

Body.displayName = 'Body';

const Accessories = memo(({ type = 'none', primaryColor }) => {
  if (type === 'glasses') {
    return (
      <g className="avatar-accessories">
        <rect x="70" y="100" width="25" height="10" rx="5" fill="#333" opacity="0.8" />
        <rect x="105" y="100" width="25" height="10" rx="5" fill="#333" opacity="0.8" />
        <path d="M95 105 L105 105" stroke="#333" strokeWidth="2" />
      </g>
    );
  }
  
  if (type === 'headphones') {
    return (
      <g className="avatar-accessories">
        <circle cx="60" cy="100" r="15" fill="#333" opacity="0.8" />
        <circle cx="140" cy="100" r="15" fill="#333" opacity="0.8" />
        <path d="M75 95 L125 95" stroke="#333" strokeWidth="8" strokeLinecap="round" />
      </g>
    );
  }
  
  if (type === 'cap') {
    return (
      <g className="avatar-accessories">
        <path d="M70 75 Q100 60 130 75 L130 85 Q100 70 70 85 Z" fill={primaryColor || '#E11D48'} />
        <circle cx="100" cy="75" r="5" fill="white" />
      </g>
    );
  }
  
  return null;
});

Accessories.displayName = 'Accessories';

// ==================== MAIN AVATAR COMPONENT ====================
const GameAvatar = memo(({ 
  avatar,
  state = 'idle',
  isActive = false,
  size = 'md',
  interactive = false,
  onClick,
  className = '',
  priority = false,
  showNameplate = true,
  showStatus = true
}) => {
  const avatarSeed = getAvatarSeed(avatar);
  const skinColor = getSkinColor(avatar?.skinTone || 'default');
  const hairColor = getHairColor(avatar?.hairColor || 'brown');
  const eyeColor = getEyeColor(avatar?.eyeColor || 'brown');
  const outfitColor = avatar?.outfitColor;
  const style = avatar?.style || 'casual';
  const accessory = avatar?.accessory || 'none';
  
  const { currentState, expression, transitionTo } = useAvatarState(state);
  const isBlinking = useBlinkAnimation();
  const idleMotion = useIdleAnimation(isActive && currentState === 'idle');
  
  const { isHovered, handlers } = useMemo(() => {
    if (!interactive) return { isHovered: false, handlers: {} };
    
    return {
      isHovered: false,
      handlers: {
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        onFocus: () => {},
        onBlur: () => {}
      }
    };
  }, [interactive]);

  // Sync with prop state
  useEffect(() => {
    if (state !== currentState) {
      transitionTo(state, AVATAR_CONFIG.animation[state]);
    }
  }, [state, currentState, transitionTo]);

  const sizeStyles = AVATAR_CONFIG.sizes[size];
  const stateClass = `avatar-state-${currentState}`;
  
  const handleKeyDown = useCallback((e) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === 'Space')) {
      e.preventDefault();
      onClick(e);
    }
  }, [interactive, onClick]);

  // Dynamic transforms
  const groupTransform = `
    translate(${idleMotion.translateY * 0.5}px, ${idleMotion.translateY}px)
    rotate(${idleMotion.rotate}deg)
  `;

  return (
    <div 
      className={`
        avatar-game-wrapper
        ${stateClass}
        avatar-size-${size}
        ${isActive ? 'avatar-active' : ''}
        ${isHovered ? 'avatar-hovered' : ''}
        ${className}
      `}
      style={{
        width: sizeStyles.width,
        height: sizeStyles.height
      }}
      {...handlers}
      onClick={interactive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : 'figure'}
      tabIndex={interactive ? 0 : -1}
      aria-label={avatar?.name}
    >
      {/* Background glow when active */}
      {isActive && (
        <div className="avatar-glow" style={{ backgroundColor: outfitColor }} />
      )}
      
      {/* Speaking visual effects */}
      {currentState === 'speaking' && (
        <>
          <div className="avatar-speak-ring" style={{ borderColor: outfitColor || '#4f9eff' }} />
          <div className="avatar-speak-wave" style={{ borderColor: outfitColor || '#4f9eff' }} />
        </>
      )}
      
      {/* Avatar SVG with transforms */}
      <svg
        viewBox="0 0 200 280"
        xmlns="http://www.w3.org/2000/svg"
        className="avatar-svg"
        style={{ transform: groupTransform }}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <AvatarDefs primaryColor={outfitColor} hasGlow={isActive} />
        
        {/* Shadow */}
        <ellipse cx="100" cy="260" rx="50" ry="15" fill="rgba(0,0,0,0.2)" />
        
        {/* Avatar layers */}
        <g clipPath="url(#avatarClip)">
          <Body 
            outfitColor={outfitColor}
            style={style}
            isActive={currentState === 'gesturing' || currentState === 'speaking'}
          />
          
          <Head 
            skinColor={skinColor}
            eyeColor={eyeColor}
            expression={expression}
            isBlinking={isBlinking}
            isActive={isActive}
          />
          
          <Accessories type={accessory} primaryColor={outfitColor} />
        </g>
      </svg>

      {/* Nameplate */}
      {showNameplate && (
        <div className="avatar-nameplate" style={{ borderColor: outfitColor }}>
          <span className="avatar-name">{avatar?.name}</span>
          {avatar?.role && (
            <span className="avatar-role">{avatar.role}</span>
          )}
        </div>
      )}

      {/* Status indicator */}
      {showStatus && (
        <div className={`avatar-status ${isActive ? 'status-active' : 'status-idle'}`}>
          <span className="status-dot" />
          <span className="status-text">{isActive ? 'Online' : 'Away'}</span>
        </div>
      )}

      {/* State indicator for accessibility */}
      {currentState !== 'idle' && (
        <div className="sr-only">Currently {currentState}</div>
      )}
    </div>
  );
});

GameAvatar.displayName = 'GameAvatar';

// ==================== EXPORT COMPONENT ====================
const AvatarFigure = ({ isSpeaking, posture, state, ...props }) => {
  // Convert legacy props (isSpeaking, posture) to the new state prop
  const avatarState = isSpeaking !== undefined 
    ? (isSpeaking ? 'speaking' : (posture || 'idle'))
    : (state || posture || 'idle');
  
  return <GameAvatar {...props} state={avatarState} />;
};

AvatarFigure.propTypes = {
  ...AvatarPropTypes,
  isSpeaking: PropTypes.bool,
  posture: PropTypes.oneOf(['idle', 'speaking', 'listening', 'thinking', 'nodding', 'gesturing'])
};

export default memo(AvatarFigure);