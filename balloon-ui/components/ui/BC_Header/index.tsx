"use client";

import "./BC_Header.scss";
import React, { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import BC_Search from "@/components/ui/BC_Search";
import BC_Drawer from "@/components/ui/BC_Drawer";
import useViewport from "@/hooks/useViewport";

const BC_Header: React.FC = (): JSX.Element => {
  const { isMobileView } = useViewport();

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-area">
            <Link href="/">
              <figure>
                <Image
                  src="/images/balloon-logo.png"
                  alt="Header Image"
                  width={120}
                  height={40}
                  loading="eager"
                />
              </figure>
            </Link>
          </div>

          <nav className="header-area">
            {!isMobileView() && <BC_Search />}
            <BC_Drawer />
          </nav>
        </div>
      </header>
    </>
  );
};

export default BC_Header;
