import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate } from '../../common/utils.js';

export class ResidenceCertificateTemplate extends DocumentTemplate {
  type = 'residenceCertificate';
  title = 'Attestation d\'Hébergement';
  description = 'Justificatif de domicile / Attestation d\'hébergement';

  render(context: TemplateContext): string {
    const { signers, fields, currentDate } = context;
    const lessor = this.getLessorInfo(signers);
    const tenant = this.getTenantInfo(signers);
    
    // Pour une attestation d'hébergement, on peut avoir un hébergeur et un hébergé
    const host = signers.find(s => s.id === 'host') || lessor;
    const resident = signers.find(s => s.id === 'resident') || tenant;

    if (!host || !resident) {
      throw new Error('Hébergeur et hébergé requis');
    }

    const isLandlord = fields.certificateType === 'landlord';

    const content = `
      <h1>ATTESTATION ${isLandlord ? 'DE LOCATION' : 'D\'HÉBERGEMENT'}</h1>

      <div style="margin: 60px 0;">
        <p>Je soussigné(e),</p>
        
        <p style="margin: 20px 0;">
          <strong>${this.getSignerFullName(host)}</strong><br>
          Né(e) le ${fields.hostBirthDate || '[DATE DE NAISSANCE]'} à ${fields.hostBirthPlace || '[LIEU DE NAISSANCE]'}<br>
          Demeurant : ${host.address ? this.formatAddress(host.address) : '[ADRESSE]'}
        </p>

        ${isLandlord ? `
        <p style="margin: 30px 0;">
          agissant en qualité de <strong>propriétaire bailleur</strong> du logement situé :<br>
          <strong>${fields.propertyAddress || '[ADRESSE DU BIEN]'}</strong>
        </p>

        <p>atteste par la présente que :</p>
        ` : `
        <p style="margin: 30px 0;">
          atteste sur l'honneur héberger à mon domicile situé à l'adresse ci-dessus :
        </p>
        `}

        <p style="margin: 20px 0; padding: 20px; background: #f5f5f5;">
          <strong>${this.getSignerFullName(resident)}</strong><br>
          ${resident.address && !isLandlord ? `Ancienne adresse : ${resident.address}<br>` : ''}
          ${fields.residentBirthDate ? `Né(e) le ${fields.residentBirthDate}` : ''}
          ${fields.residentBirthPlace ? ` à ${fields.residentBirthPlace}` : ''}
        </p>

        ${isLandlord ? `
        <p>
          est locataire du logement susmentionné depuis le <strong>${formatDate(new Date(fields.leaseStartDate || currentDate))}</strong>
          en vertu d'un bail de location ${fields.leaseType || ''}.
        </p>
        
        <p>
          Cette attestation est établie pour servir et valoir ce que de droit, notamment comme justificatif de domicile.
        </p>
        ` : `
        <p>
          depuis le <strong>${formatDate(new Date(fields.accommodationStartDate || currentDate))}</strong>.
        </p>

        <p>
          Cette attestation est établie pour servir et valoir ce que de droit.
        </p>
        `}
      </div>

      <div style="margin-top: 60px;">
        <p><strong>PIÈCES JOINTES :</strong></p>
        <ul>
          <li>Copie de ma pièce d'identité</li>
          <li>Copie d'un justificatif de domicile à mon nom</li>
          ${isLandlord ? '<li>Copie du bail de location</li>' : ''}
        </ul>
      </div>

      <p style="margin-top: 40px; font-style: italic; font-size: 14px;">
        J'ai connaissance que toute fausse déclaration de ma part m'expose à des sanctions pénales 
        conformément à l'article 441-7 du Code pénal.
      </p>

      <div style="margin-top: 60px;">
        <p>Fait à ${fields.city || '[VILLE]'}, le ${formatDate(currentDate)}</p>
        <p>Pour servir et valoir ce que de droit.</p>
        
        <div style="margin-top: 40px;">
          <p>${isLandlord ? 'Le Bailleur' : 'L\'Hébergeur'}<br>
          Signature</p>
          <div class="signature-line" style="width: 300px;"></div>
          <p>${this.getSignerFullName(host)}</p>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; border: 1px solid #ccc; font-size: 12px;">
        <p><strong>Article 441-7 du Code pénal :</strong></p>
        <p style="font-style: italic;">
          "Est puni d'un an d'emprisonnement et de 15 000 euros d'amende le fait d'établir une attestation 
          ou un certificat faisant état de faits matériellement inexacts."
        </p>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }
}