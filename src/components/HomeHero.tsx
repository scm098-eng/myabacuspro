"use client"

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import placeholderImages from '@/lib/placeholder-images.json';

const HERO_IMAGES = [
  {
    ...placeholderImages.homeHero,
    alt: "Mental math training hero"
  },
  {
    ...placeholderImages.abhi,
    alt: "Student Abhi practicing"
  },
  {
    ...placeholderImages.superAbhi,
    alt: "Student Super Abhi"
  }
];

export function HomeHero() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  return (
    <section className="w-full" aria-label="Visual Preview">
      <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-muted">
        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent className="h-full ml-0">
            {HERO_IMAGES.map((image, index) => (
              <CarouselItem key={index} className="h-full pl-0 basis-full relative flex-shrink-0">
                <div className="relative w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    data-ai-hint={image.hint}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
