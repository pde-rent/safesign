import { DocumentTemplate } from './engine.js';
import { RentalContractTemplate } from './rental-contract.js';
import { SubleaseContractTemplate } from './sublease-contract.js';
import { GuaranteeActFrTemplate } from './guarantee-act-fr.js';
import { InventoryTemplate } from './inventory.js';
import { RentReceiptFrTemplate } from './rent-receipt-fr.js';
import { ResidenceCertificateTemplate } from './residence-certificate.js';
import type { DocumentType } from '../../common/types.js';

// Template registry
const templates = new Map<string, DocumentTemplate>();

// Register all templates
templates.set('rentalContract', new RentalContractTemplate());
templates.set('subleaseContract', new SubleaseContractTemplate());
templates.set('guaranteeAct', new GuaranteeActFrTemplate());
templates.set('inventory', new InventoryTemplate());
templates.set('rentReceipt', new RentReceiptFrTemplate());
templates.set('residenceCertificate', new ResidenceCertificateTemplate());

export function getTemplate(type: DocumentType | string): DocumentTemplate {
  const template = templates.get(type);
  if (!template) {
    throw new Error(`Template non trouvé pour le type: ${type}`);
  }
  return template;
}

export function getAllTemplates(): Array<{ type: string; title: string; description: string }> {
  return Array.from(templates.entries()).map(([type, template]) => ({
    type,
    title: template.title,
    description: template.description
  }));
}

export { DocumentTemplate } from './engine.js';
export type { TemplateContext } from './engine.js';