"use client";

import BC_Container from "@/components/ui/BC_Container";
import BC_Register from "@/components/ui/BC_Register";

export default function Register() {
  return (
    <div>
      <BC_Container hasHeader={false}>
        <BC_Register />
      </BC_Container>
    </div>
  );
}