"use client";

import BC_Container from "@/components/ui/BC_Container";
import BC_Reader from "@/components/ui/BC_Reader";

export default function ReaderPage() {
  return (
    <div>
      <BC_Container hasHeader={false}>
        <BC_Reader />
      </BC_Container>
    </div>
  );
}
