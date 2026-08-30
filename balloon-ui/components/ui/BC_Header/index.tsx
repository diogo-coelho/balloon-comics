"use client";

import "./BC_Header.scss";
import React, { JSX } from "react";
import { IconSearch, IconMenu } from '@tabler/icons-react';
import BC_Button from "@/components/design/BC_Button";
import BC_Search from "@/components/ui/BC_Search";

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

            <div>
              <BC_Button variant="transparent">
                <IconMenu className="icon-menu"/>
              </BC_Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default BC_Header;