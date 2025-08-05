import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate, formatCurrency, formatNumberToWords } from '../../common/utils.js';
import { Currency } from '../../common/types.js';

export class SubleaseContractTemplate extends DocumentTemplate {
  type = 'subleaseContract';
  title = 'Contrat de Sous-location';
  description = 'Contrat de sous-location d\'habitation';

  render(context: TemplateContext): string {
    const { signers, settings, fields, currentDate } = context;
    const sublessor = signers.find(s => s.id === 'sublessor');
    const subtenant = signers.find(s => s.id === 'subtenant');

    if (!sublessor || !subtenant) {
      throw new Error('Sous-bailleur et sous-locataire requis');
    }

    const totalRent = settings.rent + settings.charges;

    const content = `
      <div class="header-info">
        Fait à ${fields.city || '[VILLE]'}, le ${formatDate(currentDate)}
      </div>

      <h1>CONTRAT DE SOUS-LOCATION</h1>
      <p class="article-ref">(Article 8 de la loi n°89-462 du 6 juillet 1989)</p>

      <h2>ENTRE LES SOUSSIGNÉS</h2>
      
      <p><strong>Le sous-bailleur (locataire principal) :</strong><br>
      ${this.getSignerFullName(sublessor)}<br>
      ${sublessor.address ? this.formatAddress(sublessor.address) : ''}<br>
      ${sublessor.email ? `Email : ${sublessor.email}` : ''}
      </p>

      <p><strong>Le sous-locataire :</strong><br>
      ${this.getSignerFullName(subtenant)}<br>
      ${subtenant.address ? this.formatAddress(subtenant.address) : ''}<br>
      ${subtenant.email ? `Email : ${subtenant.email}` : ''}
      </p>

      <p>Il a été convenu et arrêté ce qui suit :</p>

      <h2>ARTICLE 1 - AUTORISATION DE SOUS-LOCATION</h2>
      <p>Le sous-bailleur déclare avoir obtenu l'accord écrit du bailleur principal, 
      ${fields.landlordName || '[NOM DU BAILLEUR PRINCIPAL]'}, pour sous-louer le logement objet du présent contrat.</p>
      <p>Une copie de cette autorisation est annexée au présent contrat.</p>

      <h2>ARTICLE 2 - OBJET DE LA SOUS-LOCATION</h2>
      <p>Le sous-bailleur sous-loue au sous-locataire, qui accepte :</p>
      <p>
        <strong>Adresse :</strong> ${fields.propertyAddress || '[ADRESSE DU BIEN]'}<br>
        <strong>Type :</strong> ${fields.propertyType || '[TYPE DE LOGEMENT]'}<br>
        <strong>Surface sous-louée :</strong> ${fields.surface || '[SURFACE]'} m²<br>
        <strong>Pièces sous-louées :</strong> ${fields.subletRooms || '[PIÈCES CONCERNÉES]'}
      </p>

      <h2>ARTICLE 3 - DURÉE</h2>
      <p>La présente sous-location est consentie pour une durée de <strong>${settings.duration} mois</strong>, 
      du <strong>${formatDate(settings.startDate)}</strong> au <strong>${formatDate(settings.endDate)}</strong>.</p>
      <p class="article-ref">La durée de la sous-location ne peut excéder celle du bail principal.</p>

      <h2>ARTICLE 4 - LOYER</h2>
      <p>Le loyer mensuel de la sous-location est fixé à :</p>
      <p>
        <strong>Loyer :</strong> ${formatCurrency(settings.rent, Currency.EUR)}<br>
        <strong>Charges :</strong> ${formatCurrency(settings.charges, Currency.EUR)}<br>
        <strong>Total :</strong> ${formatCurrency(totalRent, Currency.EUR)}
      </p>
      <p class="article-ref">Le loyer de la sous-location ne peut être supérieur au loyer principal au prorata de la surface sous-louée.</p>

      <h2>ARTICLE 5 - DÉPÔT DE GARANTIE</h2>
      <p>Un dépôt de garantie de <strong>${formatCurrency(settings.deposit, Currency.EUR)}</strong> est versé par le sous-locataire.</p>

      <h2>ARTICLE 6 - OBLIGATIONS</h2>
      <p>Le sous-locataire s'engage à respecter toutes les clauses et conditions du bail principal, 
      dont il reconnaît avoir pris connaissance.</p>
      <p>Le sous-bailleur reste responsable vis-à-vis du bailleur principal de toutes les obligations du bail principal.</p>

      <h2>ARTICLE 7 - FIN DE LA SOUS-LOCATION</h2>
      <p>La sous-location prendra fin automatiquement :</p>
      <ul>
        <li>À la date prévue ci-dessus</li>
        <li>En cas de résiliation du bail principal</li>
        <li>En cas de congé donné par l'une des parties selon les modalités légales</li>
      </ul>

      <div class="signatures">
        <div class="signature-block">
          <p>Le Sous-bailleur<br>
          Lu et approuvé</p>
          <div class="signature-line"></div>
          <p>${this.getSignerFullName(sublessor)}</p>
        </div>
        <div class="signature-block">
          <p>Le Sous-locataire<br>
          Lu et approuvé</p>
          <div class="signature-line"></div>
          <p>${this.getSignerFullName(subtenant)}</p>
        </div>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }
}