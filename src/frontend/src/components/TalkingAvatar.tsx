/**
 * TalkingAvatar — SVG-based animated talking head.
 * Mouth animates open/closed based on `isSpeaking`.
 * Each companion gets a distinct color palette and face shape.
 */

import { useEffect, useRef, useState } from "react";

interface TalkingAvatarProps {
  companionId: string;
  companionName: string;
  companionColor: string;
  isSpeaking: boolean;
  size?: number;
}

// Companion-specific visual themes
const AVATAR_THEMES: Record<
  string,
  {
    skinLight: string;
    skinDark: string;
    hairColor: string;
    lipColor: string;
    eyeColor: string;
    blushColor: string;
    accentColor: string;
    hairStyle: "long" | "short" | "wavy";
  }
> = {
  sofia: {
    skinLight: "#f5c5a3",
    skinDark: "#e8a97e",
    hairColor: "#3d1f0e",
    lipColor: "#e0527a",
    eyeColor: "#5b3a8c",
    blushColor: "#f4a0b0",
    accentColor: "#d63af9",
    hairStyle: "long",
  },
  ethan: {
    skinLight: "#d4a882",
    skinDark: "#b8895a",
    hairColor: "#1a1008",
    lipColor: "#c27a5e",
    eyeColor: "#3a6bc4",
    blushColor: "#c89a7a",
    accentColor: "#4a90e2",
    hairStyle: "short",
  },
  luna: {
    skinLight: "#e8d0f0",
    skinDark: "#cda8e0",
    hairColor: "#2d0a4a",
    lipColor: "#b040e0",
    eyeColor: "#9b30d0",
    blushColor: "#e0b0f0",
    accentColor: "#a040f0",
    hairStyle: "wavy",
  },
};

const DEFAULT_THEME = {
  skinLight: "#f0c8a0",
  skinDark: "#d9a878",
  hairColor: "#2c1810",
  lipColor: "#d05070",
  eyeColor: "#4a7ab5",
  blushColor: "#f0a8b8",
  accentColor: "#c060e0",
  hairStyle: "long" as const,
};

// Mouth path data: closed vs open states
function getMouthPath(openAmount: number): string {
  // openAmount: 0 = neutral smile, 1 = wide open
  const cy = 185;
  const width = 22;
  const curveUp = 6 + openAmount * 14; // bottom lip drop
  const curveDown = -3 + openAmount * 6; // upper lip lift

  return `M ${100 - width} ${cy - curveDown} Q 100 ${cy - curveDown - curveUp} ${100 + width} ${cy - curveDown}`;
}

function getMouthFillPath(openAmount: number): string {
  const cy = 185;
  const width = 22;
  const curveUp = 6 + openAmount * 14;
  const curveDown = -3 + openAmount * 6;

  if (openAmount < 0.05) return "";

  return `M ${100 - width} ${cy - curveDown} 
    Q 100 ${cy - curveDown - curveUp} ${100 + width} ${cy - curveDown} 
    Q 100 ${cy - curveDown + openAmount * 8} ${100 - width} ${cy - curveDown}
    Z`;
}

function HairLong({
  hairColor,
  accentColor,
}: {
  hairColor: string;
  accentColor: string;
}) {
  return (
    <>
      {/* Back hair */}
      <ellipse cx="100" cy="88" rx="55" ry="60" fill={hairColor} />
      {/* Side falls */}
      <path
        d="M 50 100 Q 30 140 38 200 Q 44 230 52 240"
        fill={hairColor}
        stroke="none"
      />
      <path
        d="M 150 100 Q 170 140 162 200 Q 156 230 148 240"
        fill={hairColor}
        stroke="none"
      />
      {/* Hair highlight */}
      <ellipse
        cx="85"
        cy="60"
        rx="14"
        ry="8"
        fill={accentColor}
        opacity="0.25"
        transform="rotate(-20,85,60)"
      />
    </>
  );
}

function HairShort({
  hairColor,
  accentColor,
}: {
  hairColor: string;
  accentColor: string;
}) {
  return (
    <>
      <ellipse cx="100" cy="84" rx="52" ry="52" fill={hairColor} />
      <ellipse cx="100" cy="60" rx="38" ry="22" fill={hairColor} />
      {/* Fade sides short */}
      <path d="M 52 85 Q 46 100 50 118" fill={hairColor} strokeWidth="12" />
      <path d="M 148 85 Q 154 100 150 118" fill={hairColor} strokeWidth="12" />
      <ellipse
        cx="90"
        cy="56"
        rx="12"
        ry="7"
        fill={accentColor}
        opacity="0.2"
        transform="rotate(-15,90,56)"
      />
    </>
  );
}

function HairWavy({
  hairColor,
  accentColor,
}: {
  hairColor: string;
  accentColor: string;
}) {
  return (
    <>
      <ellipse cx="100" cy="88" rx="56" ry="62" fill={hairColor} />
      {/* Wavy side hair */}
      <path
        d="M 48 96 Q 30 120 36 150 Q 28 170 34 200 Q 40 220 46 240"
        fill={hairColor}
      />
      <path
        d="M 152 96 Q 170 120 164 150 Q 172 170 166 200 Q 160 220 154 240"
        fill={hairColor}
      />
      {/* Wave lines */}
      <path
        d="M 50 130 Q 42 138 50 146 Q 58 154 50 162"
        fill="none"
        stroke={hairColor}
        strokeWidth="8"
        opacity="0.8"
      />
      <path
        d="M 150 130 Q 158 138 150 146 Q 142 154 150 162"
        fill="none"
        stroke={hairColor}
        strokeWidth="8"
        opacity="0.8"
      />
      {/* Shimmer */}
      <ellipse
        cx="82"
        cy="58"
        rx="15"
        ry="8"
        fill={accentColor}
        opacity="0.3"
        transform="rotate(-25,82,58)"
      />
    </>
  );
}

export default function TalkingAvatar({
  companionId,
  companionName,
  isSpeaking,
  size = 320,
}: TalkingAvatarProps) {
  const theme = AVATAR_THEMES[companionId] ?? DEFAULT_THEME;

  // Smooth mouth open amount: 0..1
  const [mouthOpen, setMouthOpen] = useState(0);
  const frameRef = useRef<number>(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;

      if (isSpeaking) {
        // Oscillate mouth while speaking — natural talking rhythm
        phaseRef.current += 0.08;
        // Combine two frequencies for natural variation
        const base =
          0.5 +
          0.35 * Math.sin(phaseRef.current) +
          0.15 * Math.sin(phaseRef.current * 2.3);
        targetRef.current = Math.max(0.05, base);
      } else {
        targetRef.current = 0; // close
      }

      // Smooth lerp toward target
      currentRef.current += (targetRef.current - currentRef.current) * 0.18;
      setMouthOpen(currentRef.current);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [isSpeaking]);

  const openAmt = mouthOpen;
  const mouthStroke = getMouthPath(openAmt);
  const mouthFill = getMouthFillPath(openAmt);

  const hairProps = {
    hairColor: theme.hairColor,
    accentColor: theme.accentColor,
  };

  return (
    <svg
      viewBox="0 0 200 280"
      width={size}
      height={size * (280 / 200)}
      aria-label={`${companionName} animated avatar`}
      role="img"
      style={{ display: "block" }}
    >
      <defs>
        {/* Neck shadow */}
        <radialGradient
          id={`neck-shadow-${companionId}`}
          cx="50%"
          cy="0%"
          r="80%"
        >
          <stop offset="0%" stopColor={theme.skinDark} stopOpacity="0.5" />
          <stop offset="100%" stopColor={theme.skinDark} stopOpacity="0" />
        </radialGradient>
        {/* Face ambient */}
        <radialGradient
          id={`face-ambient-${companionId}`}
          cx="40%"
          cy="30%"
          r="65%"
        >
          <stop offset="0%" stopColor={theme.skinLight} />
          <stop offset="100%" stopColor={theme.skinDark} />
        </radialGradient>
        {/* Eye gradient */}
        <radialGradient
          id={`eye-grad-${companionId}`}
          cx="35%"
          cy="35%"
          r="65%"
        >
          <stop offset="0%" stopColor={theme.eyeColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.eyeColor} stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* ── Shoulder / body base ── */}
      <ellipse
        cx="100"
        cy="290"
        rx="72"
        ry="60"
        fill={theme.skinDark}
        opacity="0.6"
      />
      <ellipse
        cx="100"
        cy="295"
        rx="80"
        ry="65"
        fill={theme.skinLight}
        opacity="0.4"
      />

      {/* ── Hair (back layer, behind face) ── */}
      {theme.hairStyle === "long" && <HairLong {...hairProps} />}
      {theme.hairStyle === "short" && <HairShort {...hairProps} />}
      {theme.hairStyle === "wavy" && <HairWavy {...hairProps} />}

      {/* ── Neck ── */}
      <rect
        x="84"
        y="210"
        width="32"
        height="35"
        rx="10"
        fill={`url(#face-ambient-${companionId})`}
      />
      <rect
        x="84"
        y="210"
        width="32"
        height="35"
        rx="10"
        fill={`url(#neck-shadow-${companionId})`}
        opacity="0.4"
      />

      {/* ── Face ── */}
      <ellipse
        cx="100"
        cy="138"
        rx="48"
        ry="57"
        fill={`url(#face-ambient-${companionId})`}
      />

      {/* Face side shadow */}
      <ellipse
        cx="62"
        cy="138"
        rx="12"
        ry="48"
        fill={theme.skinDark}
        opacity="0.18"
      />
      <ellipse
        cx="138"
        cy="138"
        rx="12"
        ry="48"
        fill={theme.skinDark}
        opacity="0.18"
      />

      {/* ── Blush ── */}
      <ellipse
        cx="68"
        cy="162"
        rx="12"
        ry="8"
        fill={theme.blushColor}
        opacity="0.35"
      />
      <ellipse
        cx="132"
        cy="162"
        rx="12"
        ry="8"
        fill={theme.blushColor}
        opacity="0.35"
      />

      {/* ── Eyebrows ── */}
      <path
        d="M 74 116 Q 83 111 92 114"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 108 114 Q 117 111 126 116"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* ── Eyes ── */}
      {/* Left eye white */}
      <ellipse cx="83" cy="130" rx="10" ry="8" fill="white" opacity="0.95" />
      {/* Left iris */}
      <ellipse
        cx="83"
        cy="131"
        rx="7"
        ry="6.5"
        fill={`url(#eye-grad-${companionId})`}
      />
      {/* Left pupil */}
      <circle cx="83" cy="132" r="3.5" fill="#0d0a14" />
      {/* Left catchlight */}
      <circle cx="85" cy="129.5" r="1.5" fill="white" opacity="0.9" />
      {/* Left eyelid line */}
      <path
        d="M 73 130 Q 83 122 93 130"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="1.2"
        opacity="0.6"
      />
      {/* Left lashes */}
      <path
        d="M 73 129 L 70 125 M 77 124 L 75 120 M 83 122 L 82 118 M 89 124 L 91 120 M 93 128 L 96 125"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Right eye white */}
      <ellipse cx="117" cy="130" rx="10" ry="8" fill="white" opacity="0.95" />
      {/* Right iris */}
      <ellipse
        cx="117"
        cy="131"
        rx="7"
        ry="6.5"
        fill={`url(#eye-grad-${companionId})`}
      />
      {/* Right pupil */}
      <circle cx="117" cy="132" r="3.5" fill="#0d0a14" />
      {/* Right catchlight */}
      <circle cx="119" cy="129.5" r="1.5" fill="white" opacity="0.9" />
      {/* Right eyelid line */}
      <path
        d="M 107 130 Q 117 122 127 130"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="1.2"
        opacity="0.6"
      />
      {/* Right lashes */}
      <path
        d="M 107 129 L 104 125 M 111 124 L 109 120 M 117 122 L 116 118 M 123 124 L 125 120 M 127 128 L 130 125"
        fill="none"
        stroke={theme.hairColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── Nose ── */}
      <path
        d="M 97 148 Q 93 162 95 167 Q 100 170 105 167 Q 107 162 103 148"
        fill="none"
        stroke={theme.skinDark}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <ellipse
        cx="96"
        cy="166"
        rx="4"
        ry="2.5"
        fill={theme.skinDark}
        opacity="0.25"
      />
      <ellipse
        cx="104"
        cy="166"
        rx="4"
        ry="2.5"
        fill={theme.skinDark}
        opacity="0.25"
      />

      {/* ── Mouth — animated ── */}
      {/* Mouth fill (open cavity) */}
      {openAmt > 0.05 && <path d={mouthFill} fill="#1a0520" opacity="0.9" />}
      {/* Teeth when open */}
      {openAmt > 0.2 && (
        <path
          d={`M ${100 - 16} ${185 + 3 - openAmt * 4} Q 100 ${185 - openAmt * 4} ${100 + 16} ${185 + 3 - openAmt * 4}`}
          fill="white"
          opacity={Math.min(1, (openAmt - 0.2) * 2.5)}
        />
      )}
      {/* Lip outline */}
      <path
        d={mouthStroke}
        fill="none"
        stroke={theme.lipColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Upper lip cupid's bow */}
      <path
        d={`M ${100 - 18} 183 Q ${100 - 8} 180 100 182 Q ${100 + 8} 180 ${100 + 18} 183`}
        fill="none"
        stroke={theme.lipColor}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* ── Front hair (top layer, over face top) ── */}
      <ellipse cx="100" cy="84" rx="52" ry="35" fill={theme.hairColor} />
      {/* Hairline curve */}
      <path
        d="M 56 95 Q 70 72 100 68 Q 130 72 144 95"
        fill={theme.hairColor}
        stroke="none"
      />

      {/* Ear left */}
      <ellipse cx="52" cy="138" rx="8" ry="10" fill={theme.skinLight} />
      <ellipse
        cx="52"
        cy="138"
        rx="5"
        ry="7"
        fill={theme.skinDark}
        opacity="0.3"
      />

      {/* Ear right */}
      <ellipse cx="148" cy="138" rx="8" ry="10" fill={theme.skinLight} />
      <ellipse
        cx="148"
        cy="138"
        rx="5"
        ry="7"
        fill={theme.skinDark}
        opacity="0.3"
      />

      {/* Subtle face highlight */}
      <ellipse cx="86" cy="112" rx="8" ry="10" fill="white" opacity="0.06" />
    </svg>
  );
}
