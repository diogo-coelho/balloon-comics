import "./BC_SocialMediaLinks.scss";
import React from "react";
import { BCSocialMediaLinksEnum } from "./bc-social-media-links.enum";
import { IconTrash } from '@tabler/icons-react';
import BC_Select from "@/components/design/BC_Select";
import BC_Input from "@/components/design/BC_Input";
import BC_Button from "@/components/design/BC_Button";

const BCSocialMediaLinks = () => {
  const [selectedOption, setSelectedOption] = React.useState({ value: '', label: 'Selecione uma opção' });
  const [url, setUrl] = React.useState('');
  const [links, setLinks] = React.useState<{ value: string, label: string, url: string }[]>([]);

  const options = [
    { key: '', value: '', label: 'Selecione uma opção' },
    { key: BCSocialMediaLinksEnum.FACEBOOK, value: BCSocialMediaLinksEnum.FACEBOOK, label: BCSocialMediaLinksEnum.FACEBOOK },
    { key: BCSocialMediaLinksEnum.TWITTER, value: BCSocialMediaLinksEnum.TWITTER, label: BCSocialMediaLinksEnum.TWITTER },
    { key: BCSocialMediaLinksEnum.INSTAGRAM, value: BCSocialMediaLinksEnum.INSTAGRAM, label: BCSocialMediaLinksEnum.INSTAGRAM },
    { key: BCSocialMediaLinksEnum.LINKEDIN, value: BCSocialMediaLinksEnum.LINKEDIN, label: BCSocialMediaLinksEnum.LINKEDIN }
  ]

  const handleOptionChange = (event: any) => {
    const selectedValue = event.args;
    const selectedLabel = options.find(option => option.value === selectedValue)?.label || 'Selecione uma opção';
    setSelectedOption({ value: selectedValue, label: selectedLabel });
  }

  const handleUrlChange = (event: any) => {
    setUrl(event.args);
  }

  const handleAddLink = () => {
    if (selectedOption.value && url) {
      setLinks([...links, { value: selectedOption.value, label: selectedOption.label, url }]);
      setSelectedOption({ value: '', label: 'Selecione uma opção' });
      setUrl('');
    }
  }

  return (
    <>
    <div className="social-media-links-container">
      <section className="social-media-links-section">          
        <div className="social-media-links-segment">
          <h3>Links</h3>

          <div className="select-segment">
            <div className="select-area">
              <div className="input-group">
                <BC_Select 
                  name="social-media-links"
                  options={options}
                  selected={selectedOption}
                  handleOnChange={(e) => handleOptionChange(e)}
                />
              </div>
            </div>

            <div className="input-area">
              <div className="input-group">
                <BC_Input 
                  id="url" 
                  name="url" 
                  type="url"
                  placeholder="Insira a URL"
                  currentValue={url}
                  handleOnChange={(e) => handleUrlChange(e)}
                />
              </div>
            </div>

            <div className="button-area">
              <BC_Button
                type="button"
                variant="secondary"
                size="small"
                handleOnClick={(e) => handleAddLink()}
              >
                Adicionar
              </BC_Button>
            </div>
          </div>
        </div>

        <div className="social-media-links-segment">
          <div className="links-list">
            {links.map((link, index) => (
              <div key={index} className="link-item">
                <div>
                <p>{link.label}</p>
                <p>{link.url}</p>
                </div>

                <BC_Button
                  type="button"
                  variant="transparent"
                  size="small"
                  handleOnClick={() => {
                    const updatedLinks = links.filter((_, i) => i !== index);
                    setLinks(updatedLinks);
                  }}
                >
                  <IconTrash className="icon" width={16} height={16} />
                </BC_Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default BCSocialMediaLinks;