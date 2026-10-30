"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export function RoboticSpotlightHero() {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for 60fps direct DOM transforms (zero React re-render lag)
  const spotlightRef = useRef<HTMLDivElement>(null);
  const headGroupRef = useRef<SVGGElement>(null);
  const visorGroupRef = useRef<SVGGElement>(null);
  const eyesGroupRef = useRef<SVGGElement>(null);
  const bodyGroupRef = useRef<SVGGElement>(null);
  const flagGroupRef = useRef<SVGGElement>(null);

  const [isBlinking, setIsBlinking] = useState(false);

  // Smooth 60fps Lerp Cursor Tracking
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;


    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize cursor position to [-1, 1] with soft clamping
      const rawX = (e.clientX - centerX) / (window.innerWidth * 0.45);
      const rawY = (e.clientY - centerY) / (window.innerHeight * 0.45);
      targetX = Math.max(-1, Math.min(1, rawX));
      targetY = Math.max(-1, Math.min(1, rawY));
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      // Smooth spring-like damping (0.085)
      currentX += (targetX - currentX) * 0.085;
      currentY += (targetY - currentY) * 0.085;

      // 1. Inverse parallax on the Molten Amber Spotlight orb
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX * -18}px, ${currentY * -18}px, 0)`;
      }

      // 2. 3D Head tilt & translation
      if (headGroupRef.current) {
        const rotY = currentX * 18;
        const rotX = currentY * -14;
        const shiftX = currentX * 14;
        const shiftY = currentY * 10;
        headGroupRef.current.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      // 3. Recessed black visor deeper parallax
      if (visorGroupRef.current) {
        visorGroupRef.current.style.transform = `translate3d(${currentX * 8}px, ${currentY * 6}px, 0)`;
      }

      // 4. Glowing eyes look directly at the cursor
      if (eyesGroupRef.current) {
        eyesGroupRef.current.style.transform = `translate3d(${currentX * 18}px, ${currentY * 14}px, 0)`;
      }

      // 5. Subtle torso counter-sway
      if (bodyGroupRef.current) {
        bodyGroupRef.current.style.transform = `translate3d(${currentX * 4}px, ${currentY * 2}px, 0) rotate(${currentX * 2}deg)`;
      }

      // 6. Subtle flag parallax
      if (flagGroupRef.current) {
        flagGroupRef.current.style.transform = `translate3d(${currentX * -3}px, ${currentY * -2}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };


    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Organic Randomized Eye Blinking Loop
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let blinkResetId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const nextBlinkDelay = 2400 + Math.random() * 2800; // 2.4s to 5.2s
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        blinkResetId = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, nextBlinkDelay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkResetId);
    };
  }, []);

  const triggerManualBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  };

  return (
    <div
      ref={containerRef}
      onClick={triggerManualBlink}
      className="relative flex w-full items-center justify-center select-none cursor-pointer py-4"
      style={{
        minHeight: "500px",
        perspective: "1100px",
      }}
      aria-label="Interactive Trce Operational Robot"
    >
      {/* LAYER 1: Molten Tungsten Amber Eclipse Spotlight (Unclipped, Diffuses into Landing Page) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute h-[440px] w-[440px] sm:h-[500px] sm:w-[500px] rounded-full transition-transform duration-75 ease-out"
        style={{
          background:
            "radial-gradient(circle, #FBBF24 0%, #F59E0B 30%, #EA580C 52%, rgba(154, 52, 18, 0.45) 68%, rgba(5, 5, 5, 0) 82%)",
          filter: "blur(32px)",
          boxShadow: "0 0 160px 45px rgba(245, 158, 11, 0.22)",
        }}
      />

      {/* Glassmorphic Orbital Halo Diffuser (Frosted Glass Lens with Specular Rim & Amber Refraction) */}
      <div
        className="pointer-events-none absolute h-[380px] w-[380px] sm:h-[440px] sm:w-[440px] rounded-full border border-white/[0.09] backdrop-blur-[14px] shadow-[0_12px_40px_0_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.18),inset_0_0_35px_rgba(245,158,11,0.08)]"
        style={{
          background:
            "radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.05) 0%, rgba(245, 158, 11, 0.03) 42%, rgba(5, 5, 5, 0.28) 85%)",
        }}
      />

      {/* Subtle Ambient Bokeh / Telemetry Dust Particles */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(251, 191, 36, 0.4) 0px, transparent 2px), radial-gradient(circle at 82% 28%, rgba(16, 185, 129, 0.4) 0px, transparent 2.5px), radial-gradient(circle at 76% 74%, rgba(6, 182, 212, 0.35) 0px, transparent 2px), radial-gradient(circle at 24% 68%, rgba(245, 158, 11, 0.3) 0px, transparent 3px)",
        }}
      />

      {/* LAYER 2: 3D Sculpted Robot, Trce Flag & Lunar Mound SVG Rig */}
      <svg
        viewBox="0 0 600 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full max-w-[560px]"
        style={{ transformStyle: "preserve-3d" }}
      >


        <defs>
          {/* Official Trce Logo Emerald-to-Cyan Gradient */}
          <linearGradient
            id={`trce-logo-grad-${uid}`}
            x1="20"
            y1="20"
            x2="105"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* 3D Matte Metallic Robot Helmet Shading (Backlit by Amber Spotlight) */}
          <radialGradient
            id={`helmet-3d-${uid}`}
            cx="32%"
            cy="22%"
            r="78%"
            fx="28%"
            fy="18%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="32%" stopColor="#D4D8E2" />
            <stop offset="68%" stopColor="#7A8296" />
            <stop offset="90%" stopColor="#2B303C" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.65" />
          </radialGradient>

          {/* Warm Amber Backlight Rim Glow for Silhouette */}
          <linearGradient id={`amber-rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.3" />
          </linearGradient>

          {/* Robot Torso 3D Cylindrical Shading */}
          <radialGradient id={`torso-3d-${uid}`} cx="38%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="45%" stopColor="#94A3B8" />
            <stop offset="82%" stopColor="#334155" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
          </radialGradient>

          {/* Side Ear-Pods Cyan/Teal Metallic Accent */}
          <linearGradient id={`ear-pod-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Deep Glossy Black Recessed Visor */}
          <linearGradient id={`visor-glass-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#11131A" />
            <stop offset="35%" stopColor="#050508" />
            <stop offset="100%" stopColor="#020203" />
          </linearGradient>

          {/* Textured Foreground Crater Mound */}
          <radialGradient id={`mound-grad-${uid}`} cx="50%" cy="10%" r="85%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="42%" stopColor="#334155" />
            <stop offset="78%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          {/* Soft Drop Shadow for Head onto Body */}
          <filter id={`drop-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000000" floodOpacity="0.65" />
          </filter>

          {/* Glowing White Eyes Filter */}
          <filter id={`eye-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ============================================================
            1. PLANTED FLAG WITH OFFICIAL TRCE LOGO (LEFT OF ROBOT)
           ============================================================ */}
        <g
          ref={flagGroupRef}
          style={{
            transformOrigin: "175px 415px",
            transition: "transform 60ms linear",
          }}
        >
          {/* Flag Ground Shadow */}
          <ellipse cx="178" cy="422" rx="18" ry="5" fill="#030305" opacity="0.7" />

          {/* Tilted Metallic Flagpole */}
          <g transform="rotate(-10 175 415)">
            <rect
              x="171"
              y="292"
              width="6.5"
              height="130"
              rx="3.2"
              fill="#CBD5E1"
              stroke="#1E293B"
              strokeWidth="1.2"
            />
            {/* Top Rounded Cap */}
            <circle cx="174.2" cy="292" r="5" fill="#F8FAFC" />

            {/* Flag Mounting Rings */}
            <rect x="169" y="302" width="11" height="5" rx="2.5" fill="#94A3B8" />
            <rect x="169" y="346" width="11" height="5" rx="2.5" fill="#94A3B8" />

            {/* Dark Waving Flag Cloth */}
            <path
              d="M178 300 C202 297, 224 303, 248 299 L248 353 C224 357, 202 351, 178 354 Z"
              fill="#080A10"
              stroke="rgba(245, 158, 11, 0.35)"
              strokeWidth="1.5"
              filter={`url(#drop-shadow-${uid})`}
            />

            {/* Official Trce Circuit Logo Inside Flag (120x120 scaled cleanly) */}
            <g transform="translate(185, 299) scale(0.46)">
              <path
                d="M27 40H51L65 26H93"
                stroke={`url(#trce-logo-grad-${uid})`}
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27 62H77L93 78"
                stroke={`url(#trce-logo-grad-${uid})`}
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M51 40V80L65 94H93"
                stroke={`url(#trce-logo-grad-${uid})`}
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="27" cy="40" r="6.5" fill="#0B0D13" stroke="#10B981" strokeWidth="4" />
              <circle cx="93" cy="26" r="6.5" fill="#06B6D4" />
              <circle cx="27" cy="62" r="6.5" fill="#10B981" />
              <circle cx="93" cy="78" r="6.5" fill="#0B0D13" stroke="#06B6D4" strokeWidth="4" />
              <circle cx="93" cy="94" r="6.5" fill="#06B6D4" />
            </g>
          </g>
        </g>

        {/* ============================================================
            2. ROBOT BODY, ARMS & STUBBY LEGS
           ============================================================ */}
        <g
          ref={bodyGroupRef}
          style={{
            transformOrigin: "310px 350px",
            transition: "transform 60ms linear",
          }}
        >
          {/* Robot Contact Shadow on Mound */}
          <ellipse cx="310" cy="412" rx="58" ry="12" fill="#020204" opacity="0.82" />

          {/* Left Arm */}
          <path
            d="M262 310 C240 318, 232 345, 238 364 C241 372, 253 372, 256 362 C258 350, 263 335, 272 326 Z"
            fill={`url(#torso-3d-${uid})`}
            stroke={`url(#amber-rim-${uid})`}
            strokeWidth="1.2"
          />

          {/* Right Arm */}
          <path
            d="M358 310 C380 318, 388 345, 382 364 C379 372, 367 372, 364 362 C362 350, 357 335, 348 326 Z"
            fill={`url(#torso-3d-${uid})`}
            stroke={`url(#amber-rim-${uid})`}
            strokeWidth="1.2"
          />

          {/* Left Stubby Leg */}
          <path
            d="M270 375 L274 405 C275 412, 290 412, 293 404 L298 382 Z"
            fill={`url(#torso-3d-${uid})`}
          />

          {/* Right Stubby Leg */}
          <path
            d="M350 375 L346 405 C345 412, 330 412, 327 404 L322 382 Z"
            fill={`url(#torso-3d-${uid})`}
          />

          {/* Central Rounded Torso */}
          <rect
            x="262"
            y="296"
            width="96"
            height="92"
            rx="36"
            fill={`url(#torso-3d-${uid})`}
            stroke={`url(#amber-rim-${uid})`}
            strokeWidth="1.5"
            filter={`url(#drop-shadow-${uid})`}
          />
        </g>

        {/* ============================================================
            3. 3D CURSOR-TRACKING ROBOT HEAD & BLINKING VISOR EYES
           ============================================================ */}
        <g
          ref={headGroupRef}
          style={{
            transformOrigin: "310px 210px",
            transformBox: "fill-box",
          }}
        >
          {/* Left Acoustic Ear-Pod */}
          <g transform="translate(182, 178)">
            <ellipse
              cx="18"
              cy="36"
              rx="18"
              ry="34"
              fill={`url(#ear-pod-${uid})`}
              stroke="#38BDF8"
              strokeWidth="1.5"
            />
            <ellipse cx="14" cy="36" rx="8" ry="16" fill="#1E293B" stroke="#0284C7" strokeWidth="2" />
          </g>

          {/* Right Acoustic Ear-Pod */}
          <g transform="translate(402, 178)">
            <ellipse
              cx="18"
              cy="36"
              rx="18"
              ry="34"
              fill={`url(#ear-pod-${uid})`}
              stroke="#F59E0B"
              strokeWidth="1.2"
            />
          </g>

          {/* Main 3D Rounded TV Helmet Shell */}
          <rect
            x="196"
            y="108"
            width="228"
            height="196"
            rx="56"
            fill={`url(#helmet-3d-${uid})`}
            stroke={`url(#amber-rim-${uid})`}
            strokeWidth="2.2"
            filter={`url(#drop-shadow-${uid})`}
          />

          {/* Top Specular Crown Highlight */}
          <path
            d="M242 116 Q310 110 378 116"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Inner Bevel Rim */}
          <rect
            x="214"
            y="126"
            width="192"
            height="160"
            rx="42"
            fill="#0D1017"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />

          {/* Deep Glossy Black Recessed Visor Screen */}
          <g ref={visorGroupRef}>
            <rect
              x="220"
              y="132"
              width="180"
              height="148"
              rx="38"
              fill={`url(#visor-glass-${uid})`}
            />

            {/* Visor Top-Left Curved Glass Reflection */}
            <path
              d="M236 146 C265 138, 315 138, 355 144"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* ========================================================
                BLINKING & CURSOR-TRACKING GLOWING PILL EYES
               ======================================================== */}
            <g ref={eyesGroupRef}>
              <g
                style={{
                  transformOrigin: "310px 204px",
                  transform: isBlinking ? "scaleY(0.06)" : "scaleY(1)",
                  transition: "transform 95ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                filter={`url(#eye-glow-${uid})`}
              >
                {/* Left Vertical Rounded Pill Eye */}
                <rect
                  x="268"
                  y="174"
                  width="32"
                  height="58"
                  rx="14"
                  fill="#FFFFFF"
                />

                {/* Right Vertical Rounded Pill Eye */}
                <rect
                  x="320"
                  y="174"
                  width="32"
                  height="58"
                  rx="14"
                  fill="#FFFFFF"
                />
              </g>
            </g>
          </g>
        </g>

        {/* ============================================================
            4. FOREGROUND LUNAR / INDUSTRIAL CRATER MOUND & DETAILS
           ============================================================ */}
        <g>
          {/* Main Curved Planet Mound */}
          <path
            d="M20 490 Q175 390 325 405 Q465 415 585 485 L600 540 L0 540 Z"
            fill={`url(#mound-grad-${uid})`}
            stroke="rgba(245, 158, 11, 0.28)"
            strokeWidth="1.5"
          />

          {/* Secondary Left Crater Ridge */}
          <ellipse cx="105" cy="468" rx="68" ry="14" fill="#090D16" opacity="0.75" />

          {/* Small Stylized Low-Poly Sprouts & Rocks */}
          <path
            d="M235 418 L229 398 L237 408 L243 394 L242 418 Z"
            fill="#10B981"
            opacity="0.85"
          />
          <path
            d="M412 418 L404 396 L414 406 L420 392 L426 406 L432 398 L424 418 Z"
            fill="#10B981"
            opacity="0.9"
          />

          {/* Foreground Rounded Moon Pebbles (Bottom Right) */}
          <path
            d="M448 472 C452 442, 496 440, 506 472 Z"
            fill="#94A3B8"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <path
            d="M482 480 C486 464, 514 464, 518 480 Z"
            fill="#64748B"
          />
        </g>
      </svg>
    </div>
  );
}


export default RoboticSpotlightHero;

