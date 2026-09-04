"use client";

import BC_Container from "@/components/ui/BC_Container";
import BC_Header from "@/components/ui/BC_Header";
import BC_Reader from "@/components/ui/BC_Reader";
import { useCurrentReader } from "@/hooks/queries/useReader";

export default function CreateReaderPage() {
  const { isLoading, isError, data } = useCurrentReader();
  const readerData = data?.data;

  return (
    <div>
      <BC_Header />
      <BC_Container hasHeader={true}>
        <BC_Reader 
          isLoading={isLoading} 
          readerData={readerData} 
        />
      </BC_Container>
    </div>
  );
}
