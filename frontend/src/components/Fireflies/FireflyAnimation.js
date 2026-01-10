import React, { useEffect, useRef } from 'react';
import './FireflyAnimation.css';

const FireflyAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Создаем несколько огоньков
    const fireflies = [];
    const count = 3;

    for (let i = 0; i < count; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'firefly-particle';
      container.appendChild(firefly);
      fireflies.push(firefly);
    }

    // Анимация огоньков
    const animate = () => {
      fireflies.forEach((firefly, index) => {
        const delay = index * 0.3;
        const duration = 2 + Math.random() * 1;
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;

        firefly.style.animationDelay = `${delay}s`;
        firefly.style.animationDuration = `${duration}s`;
        firefly.style.setProperty('--x', `${x}px`);
        firefly.style.setProperty('--y', `${y}px`);
      });
    };

    animate();

    return () => {
      fireflies.forEach(firefly => firefly.remove());
    };
  }, []);

  return <div ref={containerRef} className="firefly-animation" />;
};

export default FireflyAnimation;
