import "./BC_SocialMediaLinks.scss";
import React from "react";
import options from "./BC_SocialMediaLinks.const";
import { SocialMediaLinksProps } from "./bc-social-media-links";
import { IconTrash } from '@tabler/icons-react';
import BC_Select from "@/components/design/BC_Select";
import BC_Input from "@/components/design/BC_Input";
import BC_Button from "@/components/design/BC_Button";

const BCSocialMediaLinks = (props: SocialMediaLinksProps) => {
  const [selectedOption, setSelectedOption] = React.useState({ name: '', label: 'Selecione uma opção' });
  const [url, setUrl] = React.useState('');

  const handleOptionChange = (event: any) => {
    const selectedValue = event.args;
    const selectedLabel = options.find(option => option.name === selectedValue)?.label || 'Selecione uma opção';
    setSelectedOption({ name: selectedValue, label: selectedLabel });
  }

  const handleUrlChange = (event: any) => {
    setUrl(event.args);
  }

  const handleAddLink = () => {
    if (selectedOption.name && url) {



      props.setLinks([
        ...props.links, 
        { name: selectedOption.name, label: selectedOption.label, url }
      ]);
      setSelectedOption({ name: '', label: 'Selecione uma opção' });
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
              <div className="select-group">
                <BC_Select 
                  name="social-media-links"
                  options={options.map(option => ({ 
                    key: option.key, 
                    value: option.name, 
                    label: option.label 
                  }))}
                  selected={{
                    value: selectedOption.name,
                    label: selectedOption.label
                  }}
                  error={props.errorLinks}
                  handleOnChange={(e) => handleOptionChange(e)}
                  handleOnClick={() => props.onClick("links")}
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
                  error={props.errorLinks}
                  handleOnChange={(e) => handleUrlChange(e)}
                  handleOnClick={() => props.onClick("links")}
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

        { props.links.length > 0 && (
        <div className="social-media-links-segment">
          <div className="links-list">
            {props.links.map((link, index) => (
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
                    const updatedLinks = props.links.filter((_, i) => i !== index);
                    props.setLinks(updatedLinks);
                  }}
                >
                  <IconTrash className="icon" width={16} height={16} />
                </BC_Button>
              </div>
            ))}
          </div>
        </div>
        )}
      </section>
    </div>
    </>
  )
}

export default BCSocialMediaLinks;