import type { DocumentTypeConfig } from '../../../common/types.js';

export const rentalContractConfig: DocumentTypeConfig = {
  type: 'rentalContract',
  title: 'Contrat de Location Meublée',
  description: 'Contrat de location de logement meublé à usage d\'habitation (France)',
  
  // Document-specific options
  options: [
    {
      id: 'logementType',
      label: 'Type de logement',
      type: 'radio',
      required: true,
      options: [
        { value: 'meuble', label: 'Logement meublé' },
        { value: 'non_meuble', label: 'Logement non meublé' }
      ],
      defaultValue: 'meuble'
    },
    {
      id: 'bailleurQualite',
      label: 'Qualité du bailleur',
      type: 'radio',
      required: true,
      options: [
        { value: 'physique', label: 'Personne physique' },
        { value: 'morale', label: 'Personne morale' }
      ],
      defaultValue: 'physique'
    },
    {
      id: 'habitatType',
      label: 'Type d\'habitat',
      type: 'checkbox',
      required: true,
      options: [
        { value: 'collectif', label: 'Collectif' },
        { value: 'individuel', label: 'Individuel' }
      ]
    },
    {
      id: 'habitatPropriete',
      label: 'Type de propriété',
      type: 'checkbox',
      required: true,
      options: [
        { value: 'mono', label: 'Mono propriété' },
        { value: 'copro', label: 'Copropriété' }
      ]
    },
    {
      id: 'constructionPeriode',
      label: 'Période de construction',
      type: 'radio',
      required: true,
      options: [
        { value: '<1949', label: 'Avant 1949' },
        { value: '1949-1974', label: 'De 1949 à 1974' },
        { value: '1975-1989', label: 'De 1975 à 1989' },
        { value: '1989-2005', label: 'De 1989 à 2005' },
        { value: '>2005', label: 'Depuis 2005' }
      ]
    },
    {
      id: 'chauffageMode',
      label: 'Modalité de chauffage',
      type: 'radio',
      required: true,
      options: [
        { value: 'individuel', label: 'Individuel' },
        { value: 'collectif', label: 'Collectif' }
      ],
      defaultValue: 'individuel'
    },
    {
      id: 'eauChaudeMode',
      label: 'Modalité d\'eau chaude sanitaire',
      type: 'radio',
      required: true,
      options: [
        { value: 'individuel', label: 'Individuel' },
        { value: 'collectif', label: 'Collectif' }
      ],
      defaultValue: 'individuel'
    },
    {
      id: 'destinationLocaux',
      label: 'Destination des locaux',
      type: 'radio',
      required: true,
      options: [
        { value: 'habitation', label: 'Usage d\'habitation' },
        { value: 'mixte', label: 'Usage mixte professionnel et d\'habitation' }
      ],
      defaultValue: 'habitation'
    }
  ],

  // Field definitions (reference for Document.fields)
  fieldDefinitions: [
    { id: 'bailleur_name', label: 'Nom et prénom du bailleur', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'bailleur_address', label: 'Adresse du bailleur', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'bailleur_email', label: 'Email du bailleur', type: 'email', required: false, signerId: 'bailleur' },
    { id: 'locataire_name', label: 'Nom et prénom du locataire', type: 'text', required: true, signerId: 'locataire' },
    { id: 'locataire_email', label: 'Email du locataire', type: 'email', required: false, signerId: 'locataire' },
    { id: 'logement_address', label: 'Adresse du logement', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'logement_fiscal_id', label: 'Identifiant fiscal du logement', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'surface_privative', label: 'Surface habitable privative (m²)', type: 'number', required: true, signerId: 'bailleur' },
    { id: 'surface_collective', label: 'Surface habitable collective (m²)', type: 'number', required: false, signerId: 'bailleur' },
    { id: 'pieces_principales', label: 'Nombre de pièces principales', type: 'number', required: true, signerId: 'bailleur' },
    { id: 'dpe_classe', label: 'Classe DPE', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'loyer_mensuel', label: 'Montant du loyer mensuel (€)', type: 'number', required: true, signerId: 'bailleur' },
    { id: 'charges_mensuelles', label: 'Charges mensuelles (€)', type: 'number', required: false, signerId: 'bailleur' },
    { id: 'depot_garantie', label: 'Dépôt de garantie (€)', type: 'number', required: false, signerId: 'bailleur' },
    { id: 'date_effet', label: 'Date de prise d\'effet', type: 'date', required: true, signerId: 'bailleur' },
    { id: 'duree_contrat', label: 'Durée du contrat', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'equip_privatif', label: 'Équipements de la partie privative', type: 'textarea', required: false, signerId: 'bailleur' },
    { id: 'equip_collectif', label: 'Équipements de la partie collective', type: 'textarea', required: false, signerId: 'bailleur' },
    { id: 'signature_date_bailleur', label: 'Date de signature (Bailleur)', type: 'date', required: true, signerId: 'bailleur' },
    { id: 'signature_lieu_bailleur', label: 'Lieu de signature (Bailleur)', type: 'text', required: true, signerId: 'bailleur' },
    { id: 'signature_date_locataire', label: 'Date de signature (Locataire)', type: 'date', required: true, signerId: 'locataire' },
    { id: 'signature_lieu_locataire', label: 'Lieu de signature (Locataire)', type: 'text', required: true, signerId: 'locataire' }
  ],

  // Default signers for rental contracts
  defaultSigners: [
    {
      id: 'bailleur',
      role: 'Bailleur',
      required: true,
      order: 1
    },
    {
      id: 'locataire', 
      role: 'Locataire',
      required: true,
      order: 2
    }
  ]
};