'use client';

import React from 'react';
import { FlamyBackground } from '@/components/ui/flamy-background';

/**
 * High-performance 60fps Black & White Flamy Background with Organic Blur Effects for Auth Pages.
 * Replaces colored orbs with rising monochrome flame plumes, swirling smoke wisps,
 * floating white embers, and deep obsidian Gaussian blur.
 */
export function AuthBackground() {
  return <FlamyBackground theme="dark" intensity="medium" />;
}

export { FlamyBackground };
