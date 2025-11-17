// src/TagBarrelSelect.jsx
import React, { useState, useMemo, useEffect } from 'react';

import VanillaImg from './assets/Vanilla.png';
import CreamImg from './assets/Cream.png';
import JudyImg from './assets/Judy.png';
import RougeImg from './assets/Rouge.png';
import TorielImg from './assets/Toriel.png';

import CreamBio from './bios/BIO/_Cream.txt?raw';
import JudyBio from './bios/BIO/_Judy.txt?raw';
import RougeBio from './bios/BIO/_Rouge.txt?raw';
import TorielBio from './bios/BIO/_Toriel.txt?raw';
import VanillaBio from './bios/BIO/_Vanilla.txt?raw';

import CreamStats from './bios/STATS/_Cream.txt?raw';
import JudyStats from './bios/STATS/_Judy.txt?raw';
import RougeStats from './bios/STATS/_Rouge.txt?raw';
import TorielStats from './bios/STATS/_Toriel.txt?raw';
import VanillaStats from './bios/STATS/_Vanilla.txt?raw';

import CreamAbility from './bios/ABILITY/_Cream.txt?raw';
import JudyAbility from './bios/ABILITY/_Judy.txt?raw';
import RougeAbility from './bios/ABILITY/_Rouge.txt?raw';
import TorielAbility from './bios/ABILITY/_Toriel.txt?raw';
import VanillaAbility from './bios/ABILITY/_Vanilla.txt?raw';

import CreamDesc from './bios/DESC/_Cream.txt?raw';
import JudyDesc from './bios/DESC/_Judy.txt?raw';
import RougeDesc from './bios/DESC/_Rouge.txt?raw';
import TorielDesc from './bios/DESC/_Toriel.txt?raw';
import VanillaDesc from './bios/DESC/_Vanilla.txt?raw';

import CreamTitle from './bios/TITLE/_Cream.txt?raw';
import JudyTitle from './bios/TITLE/_Judy.txt?raw';
import RougeTitle from './bios/TITLE/_Rouge.txt?raw';
import TorielTitle from './bios/TITLE/_Toriel.txt?raw';
import VanillaTitle from './bios/TITLE/_Vanilla.txt?raw';

import CreamRadar from './bios/radar charts/_CREAM.png';
import JudyRadar from './bios/radar charts/_JUDY.png';
import RougeRadar from './bios/radar charts/_ROUGE.png';
import TorielRadar from './bios/radar charts/_TORIEL.png';
import VanillaRadar from './bios/radar charts/_VANILLA.png';

const toParagraphs = (text) =>
  text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const parseStats = (text) => {
  const out = {};
  text
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const m = line.match(/^([^:]+):\s*(.+)$/);
      if (m) {
        out[m[1].trim()] = m[2].trim();
      }
    });
  return out;
};

const parseAbilityName = (text) => {
  const m = text.match(/Ability Name:\s*(.+)/i);
  return m ? m[1].trim() : text.trim();
};

const cleanTitle = (text) => text.trim();
const cleanDesc = (text) => text.trim();

const characterProfiles = {
  Rouge: {
    radarImg: RougeRadar,
    title: cleanTitle(RougeTitle),
    bioParagraphs: toParagraphs(RougeBio),
    stats: parseStats(RougeStats),
    abilityName: parseAbilityName(RougeAbility),
    desc: cleanDesc(RougeDesc),
  },
  Cream: {
    radarImg: CreamRadar,
    title: cleanTitle(CreamTitle),
    bioParagraphs: toParagraphs(CreamBio),
    stats: parseStats(CreamStats),
    abilityName: parseAbilityName(CreamAbility),
    desc: cleanDesc(CreamDesc),
  },
  Judy: {
    radarImg: JudyRadar,
    title: cleanTitle(JudyTitle),
    bioParagraphs: toParagraphs(JudyBio),
    stats: parseStats(JudyStats),
    abilityName: parseAbilityName(JudyAbility),
    desc: cleanDesc(JudyDesc),
  },
  Toriel: {
    radarImg: TorielRadar,
    title: cleanTitle(TorielTitle),
    bioParagraphs: toParagraphs(TorielBio),
    stats: parseStats(TorielStats),
    abilityName: parseAbilityName(TorielAbility),
    desc: cleanDesc(TorielDesc),
  },
  Vanilla: {
    radarImg: VanillaRadar,
    title: cleanTitle(VanillaTitle),
    bioParagraphs: toParagraphs(VanillaBio),
    stats: parseStats(VanillaStats),
    abilityName: parseAbilityName(VanillaAbility),
    desc: cleanDesc(VanillaDesc),
  },
};

const characters = [
  { name: 'Vanilla', img: VanillaImg },
  { name: 'Cream', img: CreamImg },
  { name: 'Judy', img: JudyImg },
  { name: 'Rouge', img: RougeImg },
  { name: 'Toriel', img: TorielImg },
];

const MOBILE_BREAKPOINT = 900;
const BASE_RADIUS = 650;
const STEP_DEG = 360 / characters.length;

export default function TagBarrelSelect() {
  // Start on Rouge
  const initialIndex = useMemo(() => {
    const i = characters.findIndex((c) => c.name === 'Rouge');
    return i === -1 ? 0 : i;
  }, []);

  const [index, setIndex] = useState(initialIndex);
  const [angle, setAngle] = useState(-initialIndex * STEP_DEG);

  // null = ring mode, number = focused character index
  const [focusIndex, setFocusIndex] = useState(null);
  const isFocus = focusIndex !== null;

  // Determine whether we're on a mobile-sized viewport. This uses a simple breakpoint
  // and listens for resize events to update the state. On the server (where `window`
  // is undefined) we default to desktop.
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const current = characters[index];

  const prev = () => {
    if (isFocus) return;
    setIndex((i) => (i - 1 + characters.length) % characters.length);
    setAngle((a) => a + STEP_DEG);
  };

  const next = () => {
    if (isFocus) return;
    setIndex((i) => (i + 1) % characters.length);
    setAngle((a) => a - STEP_DEG);
  };

  const handleKeyDown = (e) => {
    if (isFocus) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  const enterFocus = (i) => {
    if (isFocus) return;
    setFocusIndex(i);
  };

  const exitFocus = () => {
    setFocusIndex(null);
  };

  const focusChar = focusIndex !== null ? characters[focusIndex] : null;
  const focusProfile = focusChar ? characterProfiles[focusChar.name] : null;
  const focusStats = focusProfile ? focusProfile.stats : {};

  // Choose the ring radius based on whether the layout is mobile or desktop. A smaller
  // radius compresses the 3D carousel on narrow screens so characters remain visible.
  const radius = isMobile ? 420 : BASE_RADIUS;

  return (
    <div
      className={`tag-root ${isFocus ? 'tag-root--focus' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="tag-stage">
        <div className="tag-spotlight" />


{/* Top-left name + subtitle when focused */}
{focusChar && focusProfile && (
          <div className="tag-bio-header">
            <div className="tag-bio-name">{focusChar.name}</div>
            <div className="tag-bio-subtitle">{focusProfile.title}</div>
          </div>
        )}

        {/* 3D ring of characters (always rendered) */}
        <div
          className="tag-ring"
          style={{
            transform: `translateZ(-${radius}px) rotateY(${angle}deg)`,
          }}
        >
          {characters.map((c, i) => {
            const worldYaw = angle + i * STEP_DEG;
            const selected = focusIndex === i;

            // Base billboard transform: always face the camera.
            let imgTransform = `rotateY(${-worldYaw}deg)`;

            // When focused:
// - on desktop: slide left to make room for the bio panel
// - on mobile: keep centered and zoom in a bit
// When focused on desktop: slide left to make room for the bio panel.
// On mobile, we hide the ring and show a flat hero instead.
if (isFocus && selected && !isMobile) {
  imgTransform += ' translateX(-700px) scale(1.05)';
}

            return (
              <div
                key={c.name}
                className="tag-panel"
                style={{
                  transform: `rotateY(${i * STEP_DEG}deg) translateZ(${radius}px) translateY(80px)`,
                }}
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className={
                    'tag-panel-image' + (selected ? ' tag-panel-image--selected' : '')
                  }
                  style={{ transform: imgTransform }}
                  onClick={() => enterFocus(i)}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Arrows disabled while in focus mode */}
        <button
          className="tag-arrow tag-arrow-left"
          onClick={prev}
          aria-label="Previous character"
          disabled={isFocus}
        >
          ‹
        </button>
        <button
          className="tag-arrow tag-arrow-right"
          onClick={next}
          aria-label="Next character"
          disabled={isFocus}
        >
          ›
        </button>

        {/* Right-side bio overlay – fades in/out via CSS */}
        <div className="tag-focus-overlay">
          {focusChar && focusProfile && (
            <>
              {/* Mobile-only hero image at the top of the profile page */}
              {isMobile && (
                <div className="tag-mobile-hero">
                  <img
                    src={focusChar.img}
                    alt={focusChar.name}
                    className="tag-mobile-hero-image"
                    draggable={false}
                  />
                </div>
              )}

              {/* Top row: biography + radar chart */}
              <div className="tag-bio-top-row">
                <div className="tag-bio-main">
                  {focusProfile.bioParagraphs.map((para, idx) => (
                    <p key={idx} className="tag-bio-text">
                      {para}
                    </p>
                  ))}
                </div>
                {focusProfile.radarImg && (
                  <div className="tag-bio-radar">
                    <img
                      src={focusProfile.radarImg}
                      alt={focusChar.name + ' stat radar'}
                    />
                  </div>
                )}
              </div>

              {/* Bottom card with name/ability, stats, and ability description */}
              <div className="tag-bio-bottom">
                <div className="tag-bio-card">
                  {/* Header row: NAME / ABILITY */}
                  <div className="tag-bio-strip tag-bio-strip--header">
                    <div className="tag-bio-header-cell">
                      <span className="tag-bio-strip-label">NAME:</span>
                      <span className="tag-bio-strip-value">
                        {focusChar.name}
                      </span>
                    </div>
                    <div className="tag-bio-header-cell">
                      <span className="tag-bio-strip-label">ABILITY:</span>
                      <span className="tag-bio-strip-value">
                        {focusProfile.abilityName}
                      </span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="tag-bio-strip tag-bio-strip--stats">
                    <div className="tag-bio-stat-row">
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">SIZE:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Size}
                        </span>
                      </div>
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">SOFTNESS:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Softness}
                        </span>
                      </div>
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">SKILL:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Skill}
                        </span>
                      </div>
                    </div>
                    <div className="tag-bio-stat-row">
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">RHYTHM:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Rhythm}
                        </span>
                      </div>
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">MOMMY:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Mommy}
                        </span>
                      </div>
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">SPECIAL:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Special}
                        </span>
                      </div>
                    </div>
                    <div className="tag-bio-stat-row tag-bio-stat-row--single">
                      <div className="tag-bio-stat-cell">
                        <span className="tag-bio-strip-label">HYPNO:</span>
                        <span className="tag-bio-strip-value">
                          {focusStats.Hypno}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="tag-bio-strip tag-bio-strip--desc">
                    <p className="tag-bio-strip-desc">
                      {focusProfile.desc}
                    </p>
                  </div>
                </div>

                <button className="tag-focus-back" onClick={exitFocus}>
                  ← Back to selection
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
