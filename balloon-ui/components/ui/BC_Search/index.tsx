"use client";

import './BC_Search.scss';
import { JSX } from "react";
import { IconSearch } from '@tabler/icons-react';
import BC_Button from "@/components/design/BC_Button";
import useViewport from '@/hooks/useViewport';
import BC_Input from '@/components/design/BC_Input';

const BCSearch = (): JSX.Element => {
  
  const { isMobileView } = useViewport();

  return (
    <>
      <div className="bc-search">
        { isMobileView() &&
          <BC_Button variant="transparent">
            <IconSearch className="icon-search"/>
          </BC_Button>
        }

        { !isMobileView() &&
          <BC_Input
            type="text"
            placeholder="Busque por quadrinhos, autores ou gêneros"
            width="300px"
            suffix={true}
          />
        }
      </div>
    </>
  );
}

export default BCSearch;