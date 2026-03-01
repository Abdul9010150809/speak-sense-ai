import React from 'react';

/**
 * AvatarFigure - An animated SVG human-like avatar with posture animations.
 * Props:
 *  - avatar: { name, gender, role, color, bgColor }
 *  - isSpeaking: boolean - triggers speaking animation (jaw, body bob)
 *  - posture: 'idle' | 'thinking' | 'speaking' | 'nodding'
 */
export default function AvatarFigure({ avatar, isSpeaking, posture = 'idle' }) {
    const isFemale = avatar?.gender === 'female';
    const isAnimal = avatar?.species === 'animal';
    const skinColor = isFemale ? '#FDDBB4' : '#FCCDA4';
    const hairColor = isFemale ? '#5C3A1E' : '#2E1A0E';
    const suiteColor = avatar?.color || '#4f9eff';
    const suiteShade = isFemale ? '#be185d' : '#1e3a5f';

    const postureClass = isSpeaking
        ? 'avatar-speaking'
        : posture === 'thinking'
            ? 'avatar-thinking'
            : posture === 'nodding'
                ? 'avatar-nodding'
                : posture === 'listening'
                    ? 'avatar-listening'
                : 'avatar-idle';

    if (isAnimal) {
        return (
            <div className={`avatar-figure-wrapper ${postureClass}`}>
                <div className="animal-avatar" aria-label={`${avatar?.name} avatar`}>
                    <div className="animal-emoji">{avatar?.avatar || '🐾'}</div>
                    <div className="animal-nameplate">{avatar?.name}</div>
                </div>

                {isSpeaking && (
                    <div className="avatar-speak-ring" style={{ borderColor: suiteColor }} />
                )}
            </div>
        );
    }

    return (
        <div className={`avatar-figure-wrapper ${postureClass}`}>
            <svg
                viewBox="0 0 200 350"
                xmlns="http://www.w3.org/2000/svg"
                className="avatar-svg"
                aria-label={`${avatar?.name} avatar`}
            >
                {/* Ambient glow behind avatar */}
                <defs>
                    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={suiteColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={suiteColor} stopOpacity="0" />
                    </radialGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>
                <ellipse cx="100" cy="340" rx="65" ry="12" fill="rgba(0,0,0,0.25)" />

                {/* ========= BODY / TORSO ========== */}
                {/* Jacket */}
                <rect x="52" y="185" width="96" height="130" rx="20" fill={suiteShade} filter="url(#softShadow)" />

                {/* Shirt / collar area */}
                <polygon points="85,185 100,210 115,185" fill="white" opacity="0.85" />

                {/* Left lapel */}
                <polygon points="85,185 70,200 85,215 100,210" fill={suiteShade} />
                {/* Right lapel */}
                <polygon points="115,185 130,200 115,215 100,210" fill={suiteShade} />

                {/* Tie for male, necklace hint for female */}
                {!isFemale && (
                    <>
                        <polygon points="100,205 106,225 100,260 94,225" fill="#c53030" />
                        <polygon points="100,205 106,215 100,225 94,215" fill="#9b2c2c" />
                    </>
                )}
                {isFemale && (
                    <ellipse cx="100" cy="215" rx="5" ry="5" fill={suiteColor} opacity="0.9" />
                )}

                {/* Button row */}
                {!isFemale && (
                    <>
                        <circle cx="100" cy="240" r="3" fill="rgba(255,255,255,0.3)" />
                        <circle cx="100" cy="258" r="3" fill="rgba(255,255,255,0.3)" />
                        <circle cx="100" cy="276" r="3" fill="rgba(255,255,255,0.3)" />
                    </>
                )}

                {/* ========= ARMS ========= */}
                {/* Left arm */}
                <g className="avatar-left-arm">
                    <rect x="20" y="188" width="32" height="90" rx="14" fill={suiteShade} />
                    {/* Left hand */}
                    <ellipse cx="36" cy="285" rx="14" ry="12" fill={skinColor} />
                </g>
                {/* Right arm */}
                <g className="avatar-right-arm">
                    <rect x="148" y="188" width="32" height="90" rx="14" fill={suiteShade} />
                    {/* Right hand (gesturing up slightly) */}
                    <ellipse cx="164" cy="285" rx="14" ry="12" fill={skinColor} />
                </g>

                {/* ========= NECK ========= */}
                <rect x="89" y="165" width="22" height="28" rx="6" fill={skinColor} />

                {/* ========= HEAD ========= */}
                <g className="avatar-head">
                    {/* Head shape */}
                    <ellipse cx="100" cy="140" rx="44" ry="50" fill={skinColor} filter="url(#softShadow)" />

                    {/* Hair */}
                    {isFemale ? (
                        <>
                            {/* Long hair sides */}
                            <ellipse cx="60" cy="145" rx="18" ry="45" fill={hairColor} />
                            <ellipse cx="140" cy="145" rx="18" ry="45" fill={hairColor} />
                            {/* Top hair */}
                            <ellipse cx="100" cy="100" rx="44" ry="28" fill={hairColor} />
                            {/* Hair highlight */}
                            <ellipse cx="90" cy="98" rx="10" ry="6" fill="#7a4f2e" opacity="0.5" />
                        </>
                    ) : (
                        <>
                            {/* Short male hair */}
                            <ellipse cx="100" cy="97" rx="44" ry="20" fill={hairColor} />
                            {/* Hair texture */}
                            <ellipse cx="80" cy="95" rx="12" ry="8" fill={hairColor} />
                            <ellipse cx="115" cy="93" rx="10" ry="7" fill={hairColor} />
                        </>
                    )}

                    {/* Ears */}
                    <ellipse cx="56" cy="143" rx="7" ry="10" fill={skinColor} />
                    <ellipse cx="144" cy="143" rx="7" ry="10" fill={skinColor} />
                    {/* Inner ear detail */}
                    <ellipse cx="56" cy="143" rx="4" ry="6" fill="#e8a886" opacity="0.5" />
                    <ellipse cx="144" cy="143" rx="4" ry="6" fill="#e8a886" opacity="0.5" />

                    {/* Eyebrows */}
                    <path d="M75 118 Q82 113 90 117" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M110 117 Q118 113 125 118" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* Eyes */}
                    {/* Left eye */}
                    <ellipse cx="82" cy="128" rx="10" ry="9" fill="white" />
                    <ellipse cx="82" cy="129" rx="6" ry="6" fill={isFemale ? '#7c3aed' : '#1e40af'} />
                    <ellipse cx="82" cy="129" rx="3.5" ry="3.5" fill="#111" />
                    <circle cx="84" cy="127" r="1.5" fill="white" />

                    {/* Right eye */}
                    <ellipse cx="118" cy="128" rx="10" ry="9" fill="white" />
                    <ellipse cx="118" cy="129" rx="6" ry="6" fill={isFemale ? '#7c3aed' : '#1e40af'} />
                    <ellipse cx="118" cy="129" rx="3.5" ry="3.5" fill="#111" />
                    <circle cx="120" cy="127" r="1.5" fill="white" />

                    {/* Eye lashes for female */}
                    {isFemale && (
                        <>
                            <path d="M74 120 Q78 116 82 119" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            <path d="M110 119 Q114 116 118 120" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </>
                    )}

                    {/* Nose */}
                    <ellipse cx="100" cy="142" rx="5" ry="7" fill="transparent" stroke="#c8946a" strokeWidth="1.2" opacity="0.6" />
                    <path d="M95 149 Q100 152 105 149" stroke="#c8946a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Mouth / jaw area - Animates when speaking */}
                    <g className="avatar-mouth">
                        <path
                            d="M85 160 Q100 168 115 160"
                            stroke="#b5734c"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Lips */}
                        <path d="M85 160 Q92 155 100 156 Q108 155 115 160 Q107 163 100 164 Q93 163 85 160 Z"
                            fill="#dd8a6c" />
                    </g>

                    {/* Cheeks blush */}
                    <ellipse cx="69" cy="148" rx="10" ry="7" fill="#f9a8d4" opacity="0.25" />
                    <ellipse cx="131" cy="148" rx="10" ry="7" fill="#f9a8d4" opacity="0.25" />
                </g>
            </svg>

            {/* Speaking glow ring */}
            {isSpeaking && (
                <div className="avatar-speak-ring" style={{ borderColor: suiteColor }} />
            )}
        </div>
    );
}
