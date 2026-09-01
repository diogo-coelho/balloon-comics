"use client";

import "./BC_Drawer.scss";
import React, { JSX } from "react";
import BC_Button from "@/components/design/BC_Button";
import useViewport from "@/hooks/useViewport";
import { IconMenu, IconX } from "@tabler/icons-react";

const DCDrawer = (): JSX.Element => {

  const [ isDrawerOpen, setIsDrawerOpen ] = React.useState(false);
  const { isMobileView } = useViewport();
  
  return (
    <>
      { isMobileView() && (
        <>
          <aside className="drawer">
            <BC_Button 
              variant="transparent" 
              handleOnClick={() => { setIsDrawerOpen(true) }}
            >
              <IconMenu className="icon-menu"/>
            </BC_Button>
          </aside>

          <div className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`}></div>
          
          <aside className={`drawer-content ${isDrawerOpen ? 'active' : ''}`}>
            <div className="drawer-header">
              <BC_Button 
                variant="transparent" 
                handleOnClick={() => setIsDrawerOpen(false)}
              >
                <IconX className="icon-close"/>
              </BC_Button>
            </div>

            <div className="drawer-body">
              <ul>
                <a href="/login"><li>Login</li></a>
              </ul>
            </div>
          </aside>
        </>
      ) }
    </>
  );
}

export default DCDrawer;