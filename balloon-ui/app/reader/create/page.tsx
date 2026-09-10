"use client";

import { useRouter } from "next/navigation";
import { useCurrentReader } from "@/hooks/queries/useReader";
import { useUpdateCurrentReader } from "@/hooks/queries/useReader";
import BC_Card from "@/components/ui/BC_Card";
import BC_Container from "@/components/ui/BC_Container";
import BC_Header from "@/components/ui/BC_Header";
import BC_CreateReader from "@/components/ui/BC_CreateReader";
import BC_SocialMediaLinks from "@/components/ui/BC_SocialMediaLinks";
import BC_AgeVerification from "@/components/ui/BC_AgeVerification";
import BC_Button from "@/components/design/BC_Button";
import useReader from "@/hooks/useReader";
import BC_Spinning from "@/components/design/BC_Spinning";

export default function CreateReaderPage() {
  const router = useRouter();
  const { 
    fullName, 
    biography, 
    links,
    dateOfBirth,
    errorFullName,
    errorBiography,
    errorLinks,
    errorDateOfBirth,
    setFullName,
    setBiography,
    setLinks,
    setDateOfBirth,
    validateRequiredFields,
    onClick,
  } = useReader(["fullName", "biography", "links", "dateOfBirth"]);

  const { isLoading, isError, data } = useCurrentReader();
  const readerData = data?.data;

  const mutation = useUpdateCurrentReader();
  const { isPending } = mutation;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) return
   
    /** 
    try {
      await mutation.mutateAsync({
        name: fullName,
        description: biography.trim() ? biography : undefined,
        socialMediaLinks: links.length > 0 ? 
          links.map(link => ({ name: link.name, url: link.url})) : 
          undefined,
        ageVerification: dateOfBirth.trim() !== "" ? {
          dateOfBirth: dateOfBirth
        } : undefined
      });  
      router.push("/reader"); 
           
    } catch (error: Error | unknown) {
      console.error(error);
    }*/
  };

  return (
    <div>
      <BC_Header />
      <BC_Container hasHeader={true}>
        <BC_Card
          title="Complete seu perfil"
          subtitle="E melhore ainda mais a sua experiência na plataforma Balloon Comics."
        >
          <form onSubmit={(e) => onSubmit(e)}>
            <BC_CreateReader 
              isLoading={isLoading}
              readerData={readerData}
              fullName={fullName}
              setFullName={setFullName}
              biography={biography}
              setBiography={setBiography}
              errorFullName={errorFullName}
              errorBiography={errorBiography}
              onClick={onClick}
            />
            <BC_AgeVerification 
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              errorDateOfBirth={errorDateOfBirth}
              onClick={onClick}
            />
            <BC_SocialMediaLinks 
              links={links} 
              setLinks={setLinks}
              errorLinks={errorLinks}
              onClick={onClick}
            />

            <div className="flex flex-end">
              <BC_Button
                type="submit" 
                variant="primary" 
                handleOnClick={(e) => onSubmit(e.event)}
              >
                { isPending && 
                  <BC_Spinning width="14px" height="14px" borderWidth="2px" />
                }
                Cadastrar
              </BC_Button>
            </div>
          </form>
        </BC_Card>
      </BC_Container>
    </div>
  );
}
