import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../button/Button';
import arrowIcon from '../../assets/arrow-up.svg';

interface ScrollbarProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

// Source: https://www.thisdot.co/blog/creating-custom-scrollbars-with-react
const Scrollbar: React.FC<ScrollbarProps> = ({ children, className, ...props }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const [thumbHeight, setThumbHeight] = useState(20);
  const [thumbTop, setThumbTop] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      const newHasOverflow = scrollHeight > clientHeight;
      if (newHasOverflow !== hasOverflow) {
        setHasOverflow(newHasOverflow);
      }
    }
  }, [hasOverflow]);

  const handleResize = useCallback((ref: HTMLDivElement, trackSize: number) => {
    const { clientHeight, scrollHeight } = ref;
    setThumbHeight(Math.max((clientHeight / scrollHeight) * trackSize, 20));
    checkOverflow();
  }, [checkOverflow]);

  const handleThumbPosition = useCallback(() => {
    if (!contentRef.current || !scrollTrackRef.current || !scrollThumbRef.current) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const trackHeight = scrollTrackRef.current.clientHeight;
    const thumbHeight = scrollThumbRef.current.clientHeight;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    const thumbTop = Math.min(
      scrollPercentage * (trackHeight - thumbHeight),
      trackHeight - thumbHeight
    );
    setThumbTop(thumbTop);
  }, []);

  const handleScrollButtonClick = useCallback((direction: 'up' | 'down') => {
    if (!contentRef.current) return;
    
    const scrollAmount = 100; // pixels to scroll
    const currentScroll = contentRef.current.scrollTop;
    const newScroll = direction === 'up' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    
    contentRef.current.scrollTo({
      top: newScroll,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      // Set up ResizeObserver
      const ref = contentRef.current;
      observer.current = new ResizeObserver(() => {
        if (scrollTrackRef.current) {
          const { clientHeight: trackSize } = scrollTrackRef.current;
          handleResize(ref, trackSize);
        }
      });
      observer.current.observe(ref);

      // Set up MutationObserver to watch for content changes
      mutationObserver.current = new MutationObserver(() => {
        checkOverflow();
      });
      mutationObserver.current.observe(ref, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Initial check
      checkOverflow();

      return () => {
        observer.current?.unobserve(ref);
        mutationObserver.current?.disconnect();
      };
    }
  }, [handleResize, checkOverflow]);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleThumbPosition);
      return () => {
        content.removeEventListener('scroll', handleThumbPosition);
      };
    }
  }, [handleThumbPosition]);

  return (
    <div className={`relative flex flex-col w-full h-full min-h-0 ${className || ''}`}>
      <div className="flex flex-1 min-h-0">
        <div 
          className="flex-1 overflow-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0" 
          ref={contentRef} 
          {...props}
        >
          {children}
        </div>
        {hasOverflow && (
          <div className="flex flex-col w-4 bg-slate-100 flex-shrink-0">
            <div 
              className="relative flex-1 w-full min-h-0" 
              ref={scrollTrackRef}
            >
              <div className="absolute w-full h-full"></div>
              <div
                className="absolute w-full bg-slate-400 rounded"
                ref={scrollThumbRef}
                style={{
                  height: `${thumbHeight}px`,
                  top: `${thumbTop}px`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {hasOverflow && (
        <div className="flex gap-2" >
          <Button 
            type="tertiary"
            onClick={() => handleScrollButtonClick('up')}
            className="w-1/2"
          >
            <img src={arrowIcon} alt="Scroll up" className="rotate-180 w-4 h-4" />
          </Button>
          <Button 
            type="tertiary"
            onClick={() => handleScrollButtonClick('down')}
            className="w-1/2"
          >
            <img src={arrowIcon} alt="Scroll down" className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Scrollbar; 