"use client";

import { useState, useEffect } from "react";

const useViewport = () => {
  const TABLET_BREAKPOINT = 720;
  const DESKTOP_BREAKPOINT = 960;
  
  const [screenWidth, setScreenWidth] = useState<number | null>(null);

  const getViewPort = (): string => {
    if ((screenWidth ?? 0) < TABLET_BREAKPOINT)  return 'mobile-view'
    if ((screenWidth ?? 0) < DESKTOP_BREAKPOINT) return 'tablet-view'
    return 'desktop-view'
  }
  const isMobileView = (): boolean => getViewPort() === 'mobile-view'

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { screenWidth, getViewPort, isMobileView };
};

export default useViewport;