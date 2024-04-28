'use client';

import * as React from 'react';
import '@/lib/env';

import NextImage from '@/components/NextImage';

export default function HomePage() {
  return (
    <main>
      <NextImage
        classNames={{ image: 'grayscale' }}
        src='/images/me.jpg'
        alt='Me'
        width={250}
        height={100}
      />
    </main>
  );
}
