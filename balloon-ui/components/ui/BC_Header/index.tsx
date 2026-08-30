"use client";

import React, { JSX } from "react";
import "./BC_Header.scss";
import { IconSearch, IconMenu } from '@tabler/icons-react';
import BC_Button from "@/components/design/BC_Button";

const BC_Header = (): JSX.Element => {

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
            <div>
              <BC_Button variant="transparent">
                <IconSearch className="icon-search"/>
              </BC_Button>
            </div>

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