import type { Document, Field, Signer, RentalSettings, DocumentTypeConfig } from '../../common/types.js';
import { formatDate, formatCurrency, formatNumberToWords } from '../../common/utils.js';

export interface TemplateContext {
  document: Document;
  settings: RentalSettings;
  fields: Record<string, any>;
  signers: Signer[];
  currentDate: Date;
}

export abstract class DocumentTemplate {
  abstract type: string;
  abstract title: string;
  abstract description: string;
  config?: DocumentTypeConfig; // Document configuration with options and fields

  abstract render(context: TemplateContext): string;

  getDigest(): string {
    // Generate digest based on template class name and type
    const content = `${this.constructor.name}:${this.type}:${this.title}`;
    
    // Create a simple hash of the template identifier
    if (typeof Bun !== 'undefined') {
      return Bun.CryptoHasher.hash('sha256', content, 'hex').substring(0, 16);
    }
    
    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash + char) & 0xffffffff;
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  protected renderField(field: Field): string {
    const value = field.value || '';
    return `<span class="field" data-field-id="${field.id}">${this.escapeHtml(String(value))}</span>`;
  }

  protected escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return text.replace(/[&<>"'\/]/g, s => map[s]);
  }

  protected formatAddress(address: string): string {
    return address.split(',').map(line => line.trim()).join('<br>');
  }

  protected getSignerFullName(signer: Signer): string {
    return `${signer.firstName} ${signer.lastName}`.trim();
  }

  protected getLessorInfo(signers: Signer[]): Signer | undefined {
    return signers.find(s => s.id === 'lessor');
  }

  protected getTenantInfo(signers: Signer[]): Signer | undefined {
    return signers.find(s => s.id === 'tenant');
  }

  protected getGuarantorInfo(signers: Signer[]): Signer | undefined {
    return signers.find(s => s.id === 'guarantor');
  }

  protected wrapDocument(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${content}
</body>
</html>`;
  }
}