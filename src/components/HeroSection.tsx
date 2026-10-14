import React, { useMemo } from 'react';
import { HeroPunkMascot } from './illustrations/HeroPunkMascot';
import { PunkSticker, FlameBadge, MaskingTapeStrip, SafetyPinDecal } from './illustrations/PunkStickers';
import { useI18n } from '../i18n';

interface HeroSectionProps {
  theme?: 'dark' | 'light';
  currentStreak: number;
  totalHours: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme = 'dark',
  currentStreak,
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('greetings.morning');
    if (hour >= 12 && hour < 18) return t('greetings.afternoon');
    if (hour >= 18 && hour < 23) return t('greetings.evening');
    return t('greetings.night');
  }, [t]);

  return (
    <section className="relative w-full pt-6 pb-10 sm:pt-12 sm:pb-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Huge Stencil & Marker Typography */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Tilted Sticker Tag + Flame Badge (strictly when streak active) */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <PunkSticker
                text={`${currentStreak > 0 ? `DIA ${currentStreak} · ` : ''}${t('stickers.resist')}`}
                variant="red"
                rotation={-3}
                icon={currentStreak > 0 ? <FlameBadge size={16} /> : undefined}
              />
              <span className="font-marker text-xs text-[#DC2626] transform rotate-2">
                #ZINE-01
              </span>
            </div>

            {/* Giant Stencil Title with Ransom / Marker Contrast */}
            <div className="select-none leading-none">
              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black font-stencil tracking-wider uppercase text-stroke">
                <span className={isDark ? 'text-[#F5F2EB]' : 'text-[#111317]'}>
                  {t('app.tagline')}
                </span>
                <br />
                <span className="inline-block px-3 py-1 bg-[#DC2626] text-white border-3 border-black shadow-[4px_4px_0px_#000000] transform -rotate-2 -mt-2">
                  {t('app.taglineEmphasis')}
                </span>
              </h1>
            </div>

            {/* Hand-drawn marker scribble slogan */}
            <div className="mt-5 flex items-center gap-2">
              <span className="font-marker text-base sm:text-lg text-[#DC2626] transform -rotate-1">
                &ldquo;{t('app.subtitle')}&rdquo;
              </span>
            </div>

            {/* Conversational Greeting with personality */}
            <p
              className={`mt-3 text-sm sm:text-base max-w-xl font-medium leading-relaxed ${
                isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]'
              }`}
            >
              {greeting}
            </p>

            {/* Subtext info */}
            <div className="mt-4 flex items-center gap-3 text-xs opacity-70 font-stencil tracking-wider">
              <span>PRODUÇÃO PRÓPRIA</span>
              <span>·</span>
              <span>100% OFFLINE & LIVRE</span>
            </div>
          </div>

          {/* Right Column: Hero Punk Mascot Illustration with Hard Shadows and Decals */}
          <div className="lg:col-span-5 relative flex justify-center items-center mt-2 lg:mt-0">
            {/* Masking tape on top of mascot flyer */}
            <div className="absolute -top-3 right-12 z-20">
              <MaskingTapeStrip width="w-24" rotation={5} />
            </div>
            <div className="absolute bottom-4 left-6 z-20">
              <SafetyPinDecal size={34} rotation={-15} />
            </div>

            <div className="relative w-full max-w-md scale-100 sm:scale-105">
              <HeroPunkMascot theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
