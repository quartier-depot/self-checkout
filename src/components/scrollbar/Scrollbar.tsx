import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Scrollbar.css';
import { Button } from '../button/Button';

interface ScrollbarProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ children, className, ...props }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const [thumbHeight, setThumbHeight] = useState(20);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleThumbMousedown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleThumbMouseup = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleThumbMousemove = useCallback((e: MouseEvent) => {
    if (!isDragging || !contentRef.current || !scrollTrackRef.current || !scrollThumbRef.current) {
      return;
    }
    const { clientHeight, scrollHeight } = contentRef.current;
    const trackHeight = scrollTrackRef.current.clientHeight;
    const thumbHeight = scrollThumbRef.current.clientHeight;
    const clickPosition = e.clientY - scrollTrackRef.current.getBoundingClientRect().top;
    const scrollPercentage = clickPosition / (trackHeight - thumbHeight);
    const scrollPosition = scrollPercentage * (scrollHeight - clientHeight);
    contentRef.current.scrollTop = scrollPosition;
  }, [isDragging]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!contentRef.current || !scrollTrackRef.current || !scrollThumbRef.current) {
      return;
    }
    const { clientHeight, scrollHeight } = contentRef.current;
    const trackHeight = scrollTrackRef.current.clientHeight;
    const thumbHeight = scrollThumbRef.current.clientHeight;
    const clickPosition = e.clientY - scrollTrackRef.current.getBoundingClientRect().top;
    const scrollPercentage = clickPosition / (trackHeight - thumbHeight);
    const scrollPosition = scrollPercentage * (scrollHeight - clientHeight);
    contentRef.current.scrollTop = scrollPosition;
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

  useEffect(() => {
    document.addEventListener('mouseup', handleThumbMouseup);
    document.addEventListener('mousemove', handleThumbMousemove);
    return () => {
      document.removeEventListener('mouseup', handleThumbMouseup);
      document.removeEventListener('mousemove', handleThumbMousemove);
    };
  }, [handleThumbMouseup, handleThumbMousemove]);

  return (
    <div className={`custom-scrollbars__container ${className || ''}`}>
      <div className="custom-scrollbars__main">
        <div className="custom-scrollbars__content" ref={contentRef} {...props}>
          {children}
        </div>
        {hasOverflow && (
          <div className="custom-scrollbars__scrollbar">
            <div className="custom-scrollbars__track-and-thumb" ref={scrollTrackRef} onClick={handleTrackClick}>
              <div className="custom-scrollbars__track"></div>
              <div
                className="custom-scrollbars__thumb"
                ref={scrollThumbRef}
                style={{
                  height: `${thumbHeight}px`,
                  top: `${thumbTop}px`,
                }}
                onMouseDown={handleThumbMousedown}
              ></div>
            </div>
          </div>
        )}
      </div>
      {hasOverflow && (
        <div className="custom-scrollbars__buttons">
          <Button 
            type="secondary"
            onClick={() => handleScrollButtonClick('up')}
            className="w-1/2 ml-0"
          >
            ⇑
          </Button>
          <Button 
            type="secondary"
            onClick={() => handleScrollButtonClick('down')}
            className="w-1/2"
          >
            ⇓
          </Button>
        </div>
      )}
    </div>
  );
};

export default Scrollbar; 