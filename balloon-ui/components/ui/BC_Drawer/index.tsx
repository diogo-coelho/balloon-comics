"use client";

import "./BC_Drawer.scss";
import React, { JSX } from "react";
import { IconMenu, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import BC_Button from "@/components/design/BC_Button";
import useViewport from "@/hooks/useViewport";
import { useAuthStore } from "@/store/auth.store";

const DCDrawer = (): JSX.Element => {
  const router = useRouter();
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const [ isDrawerOpen, setIsDrawerOpen ] = React.useState(false);
  const { isMobileView } = useViewport();

  const navigateToLogin = () => {
    router.push("/login");
  }
  
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
                { !isAuthenticated && (<a href="/login"><li>Login</li></a>) }
              </ul>
            </div>
          </aside>
        </>
      )}
      {!isMobileView() && (
        <div className="drawer-desktop">
          { !isAuthenticated && (
            <BC_Button
              type="button"
              variant="primary"
              handleOnClick={(event) => navigateToLogin()}
            >
              Login
            </BC_Button>
          )}          
        </div>
      )}
    </>
  );
}

export default DCDrawer;