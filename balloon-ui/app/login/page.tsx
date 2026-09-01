"use client";

import BC_Container from "@/components/ui/BC_Container";
import BC_Login from "@/components/ui/BC_Login";

export default function Login() {
  return (
    <div>
      <BC_Container hasHeader={false}>
        <BC_Login />
      </BC_Container>
    </div>
  );
}