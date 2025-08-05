import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate, formatCurrency, formatNumberToWords } from '../../common/utils.js';
import { Currency } from '../../common/types.js';

export class GuaranteeActFrTemplate extends DocumentTemplate {
  type = 'guaranteeActFr';
  title = 'Acte de Cautionnement';
  description = 'Acte de cautionnement solidaire pour location (France)';

  render(context: TemplateContext): string {
    const { signers, settings, fields, currentDate } = context;
    const guarantor = this.getGuarantorInfo(signers);
    const tenant = this.getTenantInfo(signers);
    const lessor = this.getLessorInfo(signers);

    if (!guarantor || !tenant || !lessor) {
      throw new Error('Caution, locataire et bailleur requis');
    }

    const rent = settings.rent || 480;
    const totalEngagement = parseFloat(fields.maxEngagement || '7100');
    const rentStartDate = fields.rentStartDate || '5 Octobre';
    const duration = fields.duration || '12 mois';

    const content = `
      <div class="cautionnement-container">
        <div class="header-box">
          <strong>Acte de cautionnement solidaire</strong><br>
          <small>(Soumis au titre Ier bis de la loi du 6 juillet 1989 et portant modification de la loi n° 86-1290 du 23 décembre 1986 – bail type conforme<br>
          aux dispositions de la loi ALUR de 2014, mis en application par le décret du 29 mai 2015)</small><br>
          <strong>LOCAUX MEUBLES A USAGE D'HABITATION</strong>
        </div>

        <div class="section">
          <p>Je soussignée ${this.getSignerFullName(guarantor)}, née le ${fields.guarantorBirthDate || '21 février 1970'} à ${fields.guarantorBirthPlace || 'LINSELLES'}, résidant au ${guarantor.address || '32 RUE JEAN-FRANCOIS CHAMPOLLION, 49300 à CHOLET'}, déclare me porter caution solidaire de ${this.getSignerFullName(tenant)} pour les obligations résultant du bail qui a été consenti par le bailleur ${this.getSignerFullName(lessor)}, demeurant ${fields.propertyAddress || '25 rue Denis Papin, 41000 BLOIS'}, pour la location du logement situé ${fields.propertyAddress || '25 rue Denis Papin, 41000 BLOIS'}.</p>

          <p>J'ai pris connaissance du montant du loyer de Quatre-cent-quatre-vingts, soit ${rent} € hors charges par mois. Il sera révisé annuellement tous les ${rentStartDate} selon la variation de l'indice de référence des loyers publié par l'INSEE au 3e trimestre 2024.</p>

          <p>Cet engagement vaut pour le paiement, en cas de défaillance du locataire, des loyers, des indemnités d'occupation, des charges, des réparations et des dégradations locatives pouvant excéder le dépôt de garantie, des impôts et taxes, des frais et dépens de procédure, des coûts des actes dus, soit un total minimum de sept-mille-cent, soit ${totalEngagement} €, en principal et accessoires.</p>

          <p>Cet engagement est valable pour une durée déterminée (${duration}), définie par le contrat de location ci-joint.</p>

          <p>Je reconnais avoir pris connaissance de l'avant-dernier alinéa de l'article 22-1 de la loi du 6 juillet 1989, selon lequel :</p>

          <div class="legal-quote">
            <p>« Lorsque le cautionnement d'obligations résultant d'un contrat de location conclu en application du présent titre ne comporte aucune indication de durée ou lorsque la durée du cautionnement est stipulée indéterminée, la caution peut le résilier unilatéralement. La résiliation prend effet au terme du contrat de location, qu'il s'agisse du contrat initial ou d'un contrat reconduit ou renouvelé au cours duquel le bailleur reçoit notification de la résiliation. »</p>
          </div>

          <p>Je reconnais également avoir pris connaissance de l'article 2297 du code civil, selon lequel :</p>

          <div class="legal-quote">
            <p>« Si la caution est privée des bénéfices de discussion ou de division, elle reconnaît ne pouvoir exiger du créancier qu'il poursuive d'abord le débiteur ou qu'il divise ses poursuites entre les cautions. À défaut, elle conserve le droit de se prévaloir de ces bénéfices. »</p>
          </div>
        </div>

        <div class="signature-section">
          <p>Fait à ________________________, le _______________________</p>
          
          <div style="margin-top: 100px; text-align: right;">
            <p>Signature</p>
            <div style="margin-top: 100px;">
              <p>${this.getSignerFullName(guarantor).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div class="footer-link">
          <p>Acte de cautionnement généré par l'outil https://www.service-public.fr/simulateur/calcul/ActeCautionnement de France Services.</p>
        </div>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }
}