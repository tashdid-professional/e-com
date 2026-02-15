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
    <div style={{ position: 'relative', height: '600px', overflow: 'hidden', backgroundColor: '#111' }}>
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '1rem', zIndex: 10 }}>
            <div style={{ maxWidth: '48rem' }}>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {slide.title}
              </h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
                {slide.subtitle}
              </p>
              <button style={{ backgroundColor: 'white', color: 'black', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', zIndex: 20 }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', zIndex: 20 }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 20 }}>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: index === currentSlide ? '2rem' : '0.75rem',
              height: '0.75rem',
              borderRadius: '9999px',
              backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
