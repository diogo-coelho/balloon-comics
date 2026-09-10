export interface SocialMediaLinksProps {
  links: { 
    name: string, 
    label: string, 
    url: string 
  }[];
  setLinks: React.Dispatch<React.SetStateAction<{ name: string, label: string, url: string }[]>>;
  errorLinks: string | undefined;
  onClick: (args: string) => void;
}