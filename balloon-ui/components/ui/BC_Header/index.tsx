"use client";

import "./BC_Header.scss";
import React, { JSX } from "react";
import BC_Search from "@/components/ui/BC_Search";
import BC_Drawer from "@/components/ui/BC_Drawer";

const BC_Header: React.FC<{}> = (): JSX.Element => {
  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-area">
            <a href="/">
              <figure>
                <img src="../images/balloon-logo.png" alt="Header Image" />
              </figure>
            </a>
          </div>

          <nav className="header-area">
            <BC_Search />
            <BC_Drawer />
          </nav>
        </div>
      </header>
    </>
  );
}

export default BC_Header;