import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Maximize2, Move } from 'lucide-react';

interface Props {
  imageUrl: string;
}

const ThreeSixtyViewer: React.FC<Props> = ({ imageUrl }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - position;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.pageX - startX.current;
    setPosition(x);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div >
      <div >
        <Sparkles size={14}  /> 360° Ko'rinish
      </div>
      
      <div 
        ref={containerRef}
        
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          
          
        />
        
        <div ></div>
      </div>

      <div >
        <div >
          <Move size={14} /> Suring
        </div>
      </div>
    </div>
  );
};

export default ThreeSixtyViewer;
