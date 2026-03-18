'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '@/datas/heroSlides';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="relative h-[250px] sm:h-[400px] md:h-[600px] overflow-hidden bg-gray-900">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 md:px-8">
            <div className="max-w-3xl w-full">
              <h1 className="text-xl sm:text-3xl md:text-6xl font-bold mb-2 sm:mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-lg md:text-2xl mb-4 sm:mb-8 opacity-90 line-clamp-1 sm:line-clamp-none">
                {slide.subtitle}
              </p>
              <button className="bg-white text-black px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg text-xs sm:text-base md:text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Hidden on small mobile for cleaner UI, shown from sm up */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full z-20 backdrop-blur-sm transition-all hidden sm:block"
      >
        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full z-20 backdrop-blur-sm transition-all hidden sm:block"
      >
        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-3 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
