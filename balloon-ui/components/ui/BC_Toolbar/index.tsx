"use client";

import "./BC_Toolbar.scss";
import { JSX } from "react";
import { useRouter } from "next/navigation";
import { IconHome, IconSearch, IconBook2, IconUser } from '@tabler/icons-react';
import { useAuthStore } from "@/store/auth.store";
import BC_Button from "@/components/design/BC_Button";
import useViewport from "@/hooks/useViewport";

const BCToolbar = (): JSX.Element => {
  const router = useRouter();
  const { isMobileView } = useViewport();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  
  const gotoHome = () => {
    router.push("/");
  }

  const gotoSearch = () => {
    // Implement navigation to search page
  }

  const gotoLibrary = () => {
    // Implement navigation to library page
  }

  const gotoProfile = () => {
    if (isAuthenticated) {
      router.push("/reader");
    } else {
      router.push("/login");
    }
  }

  return (
    <>
      { isMobileView() && ( 
      <div className="toolbar-container">
        <div className="toolbar-content">
          <div className="toolbar-item">
            <BC_Button 
              className="toolbar-button"
              variant="transparent"
              size="small"
              align="center"
              handleOnClick={gotoHome}
            >
              <IconHome stroke={2} className="icon"/>
              <span>Início</span>
            </BC_Button>
          </div>

          <div className="toolbar-item">
            <BC_Button 
              variant="transparent"
              className="toolbar-button"
              size="small"
              align="center"
              handleOnClick={gotoSearch}
            >
              <IconSearch stroke={2} className="icon"/>
              <span>Buscar</span>
            </BC_Button>
          </div>

          <div className="toolbar-item">
            <BC_Button               
              className="toolbar-button"
              variant="transparent"
              size="small"
              align="center"
              handleOnClick={gotoLibrary}
            >
              <IconBook2 stroke={2} className="icon"/>
              <span>Biblioteca</span>
            </BC_Button>
          </div>

          <div className="toolbar-item">
            <BC_Button 
              className="toolbar-button"
              variant="transparent"
              size="small"
              align="center" 
              handleOnClick={gotoProfile}
            >
              <IconUser stroke={2} className="icon" />
              <span>Perfil</span>
            </BC_Button>
          </div>      
        </div>
      </div>
      )}
    </>
  );
};

export default BCToolbar;