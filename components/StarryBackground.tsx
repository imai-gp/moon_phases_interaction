import React, { useEffect, useState } from 'react';

const StarryBackground: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 3}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay
          }}
        />
      ))}
    </div>
  );
};

export default StarryBackground;