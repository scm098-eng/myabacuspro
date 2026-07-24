'use client';

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const HERO_IMAGES = [
  {
    src: "https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media",
    alt: "Mental math training hero"
  },
  {
    src: "https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Abhi.webp?alt=media&token=f604be25-f0d9-48d8-82c2-5ee714842f0a",
    alt: "Student Abhi practicing"
  },
  {
    src: "https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Super%20Abhi.webp?alt=media&token=8bda6d23-bc82-4efb-b402-8007e05f71fc",
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
              <CarouselItem key={index} className="h-full pl-0 basis-full">
                <div className="relative h-full w-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
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
