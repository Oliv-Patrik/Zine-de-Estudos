import React, { useMemo } from 'react';
import { HeroDeskMascot } from './illustrations/HeroDeskMascot';
import { StickerTag, StarburstStar, SparkleDecal } from './illustrations/Stickers';
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

  // Greeting by hour of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('greetings.morning');
    if (hour >= 12 && hour < 18) return t('greetings.afternoon');
    if (hour >= 18 && hour < 23) return t('greetings.evening');
    return t('greetings.night');
  }, [t]);

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-16 overflow-hidden">
      {/* Decorative Starbursts & Decals in Background */}
      <div className="absolute top-2 left-6 opacity-30 select-none pointer-events-none">
        <SparkleDecal size={32} color="#0E7490" />
      </div>
      <div className="absolute top-1/2 right-4 opacity-25 select-none pointer-events-none">
        <StarburstStar size={28} color="#4A7A96" rotation={15} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center Typography Column */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Tilted Sticker Tag */}
            <div className="mb-4">
              <StickerTag
                text={`${currentStreak > 0 ? `DIA ${currentStreak} · ` : ''}${t('stickers.openBook')}`}
                variant="teal"
                rotation={-4}
                icon={<StarburstStar size={12} color="#FFFFFF" />}
              />
            </div>

            {/* Giant Authorial Title with Intertwined Serif Italic */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight uppercase leading-[0.88] select-none">
              <span>{t('app.tagline')}</span>
              <br />
              <span className="font-serif-italic font-normal lowercase tracking-normal text-[#0E7490] sm:-ml-2 inline-block transform -rotate-1">
                {t('app.taglineEmphasis')}
              </span>
            </h1>

            {/* Conversational Greeting with personality */}
            <p
              className={`mt-6 text-base sm:text-lg max-w-xl font-medium leading-relaxed ${
                isDark ? 'text-[#94A3B8]' : 'text-[#475569]'
              }`}
            >
              {greeting}
            </p>

            {/* Subtext info */}
            <div className="mt-4 flex items-center gap-2 text-xs opacity-60">
              <span>{t('app.subtitle')}</span>
              <span>·</span>
              <span>100% offline & seguro</span>
            </div>
          </div>

          {/* Right Column: Hero Mascot with Organic Depth and Layering */}
          <div className="lg:col-span-5 relative flex justify-center items-center mt-4 lg:mt-0">
            <div className="relative w-full max-w-md scale-105 sm:scale-110">
              <HeroDeskMascot theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
