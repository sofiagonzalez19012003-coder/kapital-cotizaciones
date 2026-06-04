import React, { useState, useEffect } from 'react';

export default function Carousel3D({ imgs }) {
  const [current, setCurrent] = useState(0);
  const [scale, setScale] = useState(1);
  const [zoomIn, setZoomIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setZoomIn(false);
      setTimeout(() => {
        setCurrent(c => (c + 1) % imgs.length);
        setScale(0.8);
        setZoomIn(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [imgs.length]);

  useEffect(() => {
    if (zoomIn) {
      const t = setTimeout(() => setScale(1.05), 50);
      const t2 = setTimeout(() => setScale(1), 600);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [zoomIn, current]);

  return (
    <div className="relative h-[200px] flex items-center justify-center pointer-events-auto" style={{ perspective: '600px', margin: '10px 0' }}>
      {imgs.map((url, i) => {
        const isActive = i === current;
        const isPrev = i === (current - 1 + imgs.length) % imgs.length;
        const isNext = i === (current + 1) % imgs.length;
        
        let transform = "translateX(0) rotateY(0deg) scale(0)";
        let opacity = 0;
        let zIndex = 0;
        
        if (isActive) { 
          transform = `translateX(0) rotateY(0deg) scale(${scale})`; 
          opacity = 1; 
          zIndex = 3; 
        } else if (isPrev) { 
          transform = "translateX(-110px) rotateY(35deg) scale(0.7)"; 
          opacity = 0.5; 
          zIndex = 2; 
        } else if (isNext) { 
          transform = "translateX(110px) rotateY(-35deg) scale(0.7)"; 
          opacity = 0.5; 
          zIndex = 2; 
        }
        
        return (
          <img 
            key={i} 
            src={url} 
            alt={"prod " + i} 
            style={{
              transform, 
              opacity, 
              zIndex, 
              transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
              boxShadow: isActive ? "0 12px 40px rgba(89,7,7,.6)" : "0 4px 16px rgba(0,0,0,.4)",
              border: isActive ? "1px solid rgba(89,7,7,.6)" : "1px solid rgba(255,255,255,.1)",
            }} 
            className="absolute w-[140px] h-[160px] object-cover rounded-xl"
            onError={e => { e.target.style.display = "none"; }} 
          />
        );
      })}
      
      <div className="absolute bottom-0 flex gap-1.5">
        {imgs.map((_, i) => (
          <div 
            key={i} 
            onClick={() => setCurrent(i)} 
            style={{ width: i === current ? 16 : 6 }}
            className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
              i === current ? 'bg-[#590707]' : 'bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
