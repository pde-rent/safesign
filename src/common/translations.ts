import type { DocumentType, DocumentStatus } from './types.js';

// Document type translations
export const documentTypeLabels: Record<string, string> = {
  'rentalContract': 'Contrat de Location',
  'subleaseContract': 'Contrat de Sous-location',
  'guaranteeAct': 'Acte de Cautionnement',
  'inventory': 'État des Lieux',
  'rentReceipt': 'Quittance de Loyer',
  'residenceCertificate': 'Attestation d\'Hébergement'
};

// Document status translations
export const documentStatusLabels: Record<string, string> = {
  'draft': 'Brouillon',
  'active': 'Actif',
  'completed': 'Terminé',
  'cancelled': 'Annulé',
  'expired': 'Expiré'
};

// Utility functions
export const getDocumentTypeLabel = (type: string): string => {
  return documentTypeLabels[type] || type;
};

export const getDocumentStatusLabel = (status: string): string => {
  return documentStatusLabels[status] || status;
};