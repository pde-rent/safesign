import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate, formatCurrency, formatNumberToWords } from '../../common/utils.js';
import { Currency } from '../../common/types.js';

export class RentReceiptFrTemplate extends DocumentTemplate {
  type = 'rentReceiptFr';
  title = 'Quittance de Loyer';
  description = 'Quittance de loyer mensuelle (France)';

  render(context: TemplateContext): string {
    const { signers, fields, currentDate } = context;
    const lessor = this.getLessorInfo(signers);
    const tenant = this.getTenantInfo(signers);

    if (!lessor || !tenant) {
      throw new Error('Bailleur et locataire requis');
    }

    const rentAmount = parseFloat(fields.rentAmount || '450');
    const chargesAmount = parseFloat(fields.chargesAmount || '50');
    const totalAmount = rentAmount + chargesAmount;
    const monthYear = fields.monthYear || 'Juillet 2025';
    const periodStart = fields.periodStart || '5 Juillet 2025';
    const periodEnd = fields.periodEnd || '5 Août 2025';
    const paymentDate = fields.paymentDate || '05/07/2025';

    const content = `
      <div class="quittance-container">
        <div class="header-box" style="border: 2px solid black; padding: 10px; margin-bottom: 10px;">
          <div style="text-align: center;">
            <strong style="font-size: 18px;">Quittance de loyer</strong><br>
            <small style="font-size: 10px;">(Soumis au titre Ier bis de la loi du 6 juillet 1989 et portant modification de la loi n° 86-1290 du 23 décembre 1986 – bail type<br>
            conforme aux dispositions de la loi ALUR de 2014, mis en application par le décret du 29 mai 2015)</small><br>
            <strong style="font-size: 12px;">LOCAUX MEUBLÉS À USAGE D'HABITATION</strong>
          </div>
        </div>

        <div class="title-box" style="border: 2px solid black; padding: 15px; margin-bottom: 15px; text-align: center;">
          <h1 class="title" style="font-size: 20px; margin: 0; font-weight: bold;">Quittance du mois de ${monthYear}</h1>
        </div>

        <div style="text-align: right; margin-bottom: 20px; font-size: 14px;">
          <strong>Locataire</strong><br><br>
          <strong>${this.getSignerFullName(tenant)}</strong><br>
          ${tenant.address ? this.formatAddress(tenant.address) : '25 rue Denis Papin<br>Blois (41000)'}
        </div>

        <div class="section" style="margin-bottom: 20px; font-size: 14px; line-height: 1.4;">
          <p>Je soussigné ${this.getSignerFullName(lessor)}, propriétaire bailleur de l'appartement lot ${fields.lotNumber || '5'} du ${fields.propertyAddress || '25 rue Denis Papin à Blois (41000)'}, déclare avoir reçu de ${tenant.organization ? tenant.organization : 'Madame ' + this.getSignerFullName(tenant)}, la somme de ${formatNumberToWords(totalAmount)} euros, soit ${totalAmount} euros, au titre du paiement du loyer et des charges pour la période de location du ${periodStart} (début de la mensualité) au ${periodEnd} (échéance de la mensualité) et lui en donne quittance, sous réserve de tous mes droits.</p>
        </div>

        <div class="detail-section" style="margin-bottom: 30px; font-size: 14px;">
          <p><strong>Détail du règlement</strong></p>
          <p style="line-height: 1.6;">
            Adresse de la location: ${fields.propertyAddress || '25 rue Denis Papin, Blois (41000)'}<br>
            Loyer: ${rentAmount} euros<br>
            Provision pour charges: ${chargesAmount} euros<br>
            Total: ${totalAmount} euros<br>
            Date du paiement: ${paymentDate}
          </p>
        </div>

        <div class="signature-section" style="text-align: right; margin-bottom: 30px; font-size: 14px;">
          <p><strong>Bailleur</strong></p>
          <p style="line-height: 1.4;">
            <strong>${this.getSignerFullName(lessor)}</strong><br>
            ${lessor.address ? this.formatAddress(lessor.address) : '20 An Thuong 38, Ngũ Hành Sơn,<br>Đà Nẵng (550000), Vietnam'}
          </p>
          <p style="margin-top: 15px;">Fait à ${fields.city || 'Da Nang'}, le ${formatDate(currentDate)}</p>
          <div style="margin-top: 40px; text-align: right;">
            <div class="signature-line" style="width: 200px; height: 50px; margin-left: auto;"></div>
          </div>
        </div>

        <div class="footer-note" style="border: 2px solid black; padding: 8px; font-size: 10px; text-align: justify; margin-top: 20px;">
          Cette quittance annule tous les reçus qui auraient pu être établis précédemment en cas de paiement partiel du montant du présent terme. Elle est à conserver pendant trois ans par le locataire (loi n° 89-462 du 6 juillet 1989 : art. 7-1).
        </div>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }

}

function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${random}`;
}