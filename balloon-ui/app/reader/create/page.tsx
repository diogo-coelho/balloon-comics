"use client";

import { useCurrentReader } from "@/hooks/queries/useReader";
import BC_Card from "@/components/ui/BC_Card";
import BC_Container from "@/components/ui/BC_Container";
import BC_Header from "@/components/ui/BC_Header";
import BC_CreateReader from "@/components/ui/BC_CreateReader";
import BC_SocialMediaLinks from "@/components/ui/BC_SocialMediaLinks";

export default function CreateReaderPage() {
  const { isLoading, isError, data } = useCurrentReader();
  const readerData = data?.data;

  return (
    <div>
      <BC_Header />
      <BC_Container hasHeader={true}>
        <BC_Card
          title="Complete seu perfil"
          subtitle="E melhore ainda mais a sua experiência na plataforma Balloon Comics."
        >
          <BC_CreateReader 
            isLoading={isLoading}
            readerData={readerData}
          />
          <BC_SocialMediaLinks />
        </BC_Card>
      </BC_Container>
    </div>
  );
}
