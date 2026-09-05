import "./BC_SocialMediaLinks.scss";
import BC_Select from "@/components/design/BC_Select";
import { BCSocialMediaLinksEnum } from "./bc-social-media-links.enum";
import BC_Input from "@/components/design/BC_Input";
import BC_Button from "@/components/design/BC_Button";

const BCSocialMediaLinks = () => {
  const options = [
    { key: '', value: '', label: 'Selecione uma opção' },
    { key: BCSocialMediaLinksEnum.FACEBOOK, value: BCSocialMediaLinksEnum.FACEBOOK, label: BCSocialMediaLinksEnum.FACEBOOK },
    { key: BCSocialMediaLinksEnum.TWITTER, value: BCSocialMediaLinksEnum.TWITTER, label: BCSocialMediaLinksEnum.TWITTER },
    { key: BCSocialMediaLinksEnum.INSTAGRAM, value: BCSocialMediaLinksEnum.INSTAGRAM, label: BCSocialMediaLinksEnum.INSTAGRAM },
    { key: BCSocialMediaLinksEnum.LINKEDIN, value: BCSocialMediaLinksEnum.LINKEDIN, label: BCSocialMediaLinksEnum.LINKEDIN }
  ]

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
                  selected={{ value: '', label: 'Selecione uma opção' }}
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
                 />
              </div>
            </div>

            <div className="button-area">
              <BC_Button
                type="button"
                variant="secondary"
                size="small"
              >
                Adicionar
              </BC_Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default BCSocialMediaLinks;