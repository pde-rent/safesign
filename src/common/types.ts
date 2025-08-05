// Core Data Models

interface User {
  id: string;
  walletAddress?: string;          // Adresse compte | Wallet address (optional for email users)
  email?: string;                  // E-mail | Email (optional for wallet users)
  passwordHash?: string;           // Hash mot de passe | Password hash (Backend only)
  salt?: string;                   // Salt pour dérivation clé | Salt for key derivation (Backend only, hex string)
  firstName?: string;              // Prénom | First Name
  lastName?: string;               // Nom | Last Name
  title?: string;                  // Titre | Title
  organization?: string;           // Société | Organization
  address?: string;                // Adresse physique | Physical address
  createdAt: Date;                 // Créé le | Created at
  lastLoginAt?: Date;              // Dernière connexion | Last login
  isActive: boolean;               // Actif | Is active (Backend only)
  role: UserRole;                  // Rôle | Role (Backend only)
}

// Signer extends User for document contexts
interface Signer extends User {
  jwt?: string;                    // Backend only | Côté serveur seulement
}

// Enums for field attributes
enum Unit {
  // Percentage
  PERCENT = '%',                    // Pourcentage | Percentage
  
  // Temperature
  CELSIUS = '°C',                   // Celsius | Celsius
  FAHRENHEIT = '°F',                // Fahrenheit | Fahrenheit
  KELVIN = 'K',                     // Kelvin | Kelvin
  
  // Pressure
  BAR = 'bar',                      // Bar | Bar
  PSI = 'PSI',                      // PSI | PSI
  PASCAL = 'Pa',                    // Pascal | Pascal
  
  // Power
  KILOWATT = 'kW',                  // Kilowatt | Kilowatt
  HORSEPOWER_METRIC = 'CV',         // Cheval-vapeur | Metric horsepower
  HORSEPOWER_IMPERIAL = 'HP',       // Cheval-vapeur impérial | Imperial horsepower
  
  // Data
  BIT = 'b',                        // Bit | Bit
  KILOBIT = 'Kb',                   // Kilobit | Kilobit
  GIGABIT = 'Gb',                   // Gigabit | Gigabit
  BYTE = 'B',                       // Octet | Byte
  KILOBYTE = 'KB',                  // Kilooctet | Kilobyte
  MEGABYTE = 'MB',                  // Mégaoctet | Megabyte
  GIGABYTE = 'GB',                  // Gigaoctet | Gigabyte
  
  // Area
  SQUARE_METER = 'm²',              // Mètre carré | Square meter
  HECTARE = 'hectares',             // Hectare | Hectare
  ACRE = 'acres',                   // Acre | Acre
  
  // Volume
  CUBIC_METER = 'm³',               // Mètre cube | Cubic meter
  LITER = 'litres',                 // Litre | Liter
  GALLON = 'gallons',               // Gallon | Gallon
  
  // Weight
  KILOGRAM = 'kg',                  // Kilogramme | Kilogram
  TONNE = 'tonnes',                 // Tonne | Tonne
  POUND = 'livres',                 // Livre | Pound
  
  // Distance
  KILOMETER = 'km',                 // Kilomètre | Kilometer
  MILE = 'miles',                   // Mile | Mile
  METER = 'mètres',                 // Mètre | Meter
  
  // Time
  YEAR = 'années',                  // Année | Year
  MONTH = 'mois',                   // Mois | Month
  DAY = 'jours',                    // Jour | Day
  HOUR = 'heures',                  // Heure | Hour
  MINUTE = 'minutes',               // Minute | Minute
  SECOND = 'secondes',              // Seconde | Second
  MILLISECOND = 'ms',               // Milliseconde | Millisecond
  MICROSECOND = 'us',               // Microseconde | Microsecond
  PICOSECOND = 'ps'                 // Picoseconde | Picosecond
}

enum Currency {
  // Fiat currencies
  EUR = 'EUR',                      // Euro | Euro
  USD = 'USD',                      // Dollar américain | US Dollar
  GBP = 'GBP',                      // Livre sterling | British Pound
  JPY = 'JPY',                      // Yen japonais | Japanese Yen
  CHF = 'CHF',                      // Franc suisse | Swiss Franc
  CAD = 'CAD',                      // Dollar canadien | Canadian Dollar
  AUD = 'AUD',                      // Dollar australien | Australian Dollar
  
  // Cryptocurrencies
  BTC = 'BTC',                      // Bitcoin | Bitcoin
  ETH = 'ETH',                      // Ethereum | Ethereum
  SOL = 'SOL',                      // Solana | Solana
  USDC = 'USDC',                    // USD Coin | USD Coin
  USDT = 'USDT'                     // Tether | Tether
}

// Base Field Interface
interface BaseField {
  id: string;
  type: FieldType;
  label: string;                    // Libellé | Label
  required: boolean;                // Obligatoire | Required
  readonly: boolean;                // Lecture seule | Read-only
  validator?: (value: any) => boolean;  // Validateur | Validator
  rounding?: number;                // Décimales | Decimal places
  unit?: Unit;                      // Unité | Unit
  value?: any;                      // Valeur | Value
  position?: { x: number; y: number }; // Position | Position
  size?: { width: number; height: number }; // Taille | Size
  signerId?: string;                // ID signataire | Signer ID
}

enum FieldType {
  // Text Fields
  TEXT = 'text',                    // Texte | Text
  EMAIL = 'email',                  // E-mail | Email
  ADDRESS = 'address',              // Adresse | Address
  SIGNER_NAME = 'signerName',       // Nom signataire | Signer name
  SIGNER_FIRST_NAME = 'signerFirstName',  // Prénom signataire | Signer first name
  SIGNER_TITLE = 'signerTitle',     // Titre signataire | Signer title
  SIGNER_EMAIL = 'signerEmail',     // E-mail signataire | Signer email
  SIGNER_ORG = 'signerOrg',         // Société signataire | Signer organization
  SIGNER_ADDRESS = 'signerAddress', // Adresse signataire | Signer address
  
  // Numeric Fields
  PHONE = 'phone',                  // Téléphone | Phone
  NUMBER = 'number',                // Chiffres | Numbers
  AMOUNT = 'amount',                // Montant | Amount
  COORDINATES = 'coordinates',      // Coordonnées | Coordinates
  TAX_ID = 'taxId',                 // Identifiant fiscal | Tax ID/TIN
  BUSINESS_REG = 'businessReg',     // SIRET/SIREN | Business registration
  VAT_NUMBER = 'vatNumber',         // TVA intracommunautaire | EU VAT number
  IBAN = 'iban',                    // IBAN | IBAN
  BIC = 'bic',                      // BIC/SWIFT | BIC/SWIFT
  ACTIVITY_CODE = 'activityCode',   // Code APE/NAF | Activity code
  SSN = 'ssn',                      // Sécurité sociale | Social security number
  PASSPORT = 'passport',            // Passeport | Passport number
  DRIVERS_LICENSE = 'driversLicense', // Permis de conduire | Driver's license
  
  // Date Fields
  DATE = 'date',                    // Date | Date
  SIGNATURE_DATE = 'signatureDate', // Date de signature | Signature date
  
  // Selection Fields
  MULTI_SELECT = 'multiSelect',     // Multi sélection | Multi selection
  TOGGLE = 'toggle',                // Toggle | Toggle
  
  // Dynamic Fields
  FREE_FIELD = 'freeField',         // Champ libre | Free field
  SIGNATURE = 'signature',          // Signature | Signature
  FUNCTION = 'function'             // Fonction | Function
}

interface TextField extends BaseField {
  type: FieldType.TEXT | FieldType.EMAIL | FieldType.ADDRESS | 
        FieldType.SIGNER_NAME | FieldType.SIGNER_FIRST_NAME | 
        FieldType.SIGNER_TITLE | FieldType.SIGNER_EMAIL | 
        FieldType.SIGNER_ORG | FieldType.SIGNER_ADDRESS;
  maxLength?: number;               // Longueur max | Max length
  placeholder?: string;             // Texte d'aide | Placeholder
  regex?: string;                   // Expression régulière | Regular expression
}

interface NumField extends BaseField {
  type: FieldType.PHONE | FieldType.NUMBER | FieldType.AMOUNT | 
        FieldType.COORDINATES | FieldType.TAX_ID | FieldType.BUSINESS_REG |
        FieldType.VAT_NUMBER | FieldType.IBAN | FieldType.BIC | 
        FieldType.ACTIVITY_CODE | FieldType.SSN | FieldType.PASSPORT | 
        FieldType.DRIVERS_LICENSE;
  min?: number;                     // Minimum | Minimum
  max?: number;                     // Maximum | Maximum
  currency?: Currency;              // Devise | Currency
  countryCode?: string;             // Code pays | Country code
  step?: number;                    // Pas | Step
}

interface DateField extends BaseField {
  type: FieldType.DATE | FieldType.SIGNATURE_DATE;
  minDate?: Date;                   // Date min | Min date
  maxDate?: Date;                   // Date max | Max date
  format?: string;                  // Format | Format
  defaultToCurrent?: boolean;       // Par défaut actuelle | Default to current
}

interface SelectField extends BaseField {
  type: FieldType.MULTI_SELECT | FieldType.TOGGLE;
  options: SelectOption[];          // Options | Options
  maxSelections?: number;           // Sélections max | Max selections
  minSelections?: number;           // Sélections min | Min selections
}

interface SelectOption {
  id: string;
  label: string;                    // Libellé | Label
  value: string;                    // Valeur | Value
  selected?: boolean;               // Sélectionné | Selected
}

interface DynaField extends BaseField {
  type: FieldType.FREE_FIELD | FieldType.SIGNATURE | FieldType.FUNCTION;
  dataType?: 'text' | 'drawing' | 'image';  // Type données | Data type
  functionExpression?: string;      // Expression fonction | Function expression
  dependsOn?: string[];             // Dépend de | Depends on (field IDs)
  signerId?: string;                // ID signataire | Signer ID (for signature fields)
}

type Field = TextField | NumField | DateField | SelectField | DynaField;

enum DocumentStatus {
  DRAFT = 'draft',                  // Brouillon | Draft
  ACTIVE = 'active',                // Actif | Active
  COMPLETED = 'completed',          // Terminé | Completed
  CANCELLED = 'cancelled',          // Annulé | Cancelled
  EXPIRED = 'expired'               // Expiré | Expired
}

enum DocumentType {
  RENTAL_CONTRACT = 'rentalContract',       // Contrat de location | Rental contract
  SUBLEASE_CONTRACT = 'subleaseContract',   // Contrat de sous-location | Sublease contract
  GUARANTEE_ACT = 'guaranteeAct',           // Acte de cautionnement | Guarantee act
  INVENTORY = 'inventory',                  // État des lieux | Inventory
  RENT_RECEIPT = 'rentReceipt',            // Quittance de loyer | Rent receipt
  RESIDENCE_CERTIFICATE = 'residenceCertificate', // Justificatif de domicile | Residence certificate
}

interface Document {
  id: string;                       // Identifiant | ID
  envelopeId: string;              // ID enveloppe | Envelope ID
  title: string;                   // Titre | Title
  type: DocumentType;              // Type | Type
  status: DocumentStatus;          // Statut | Status
  createdAt: Date;                 // Créé le | Created at
  updatedAt: Date;                 // Modifié le | Updated at
  createdBy: string;               // Créé par | Created by (User ID)
  signers: Signer[];               // Signataires | Signers
  fields: Field[];                 // Champs | Fields
  shareLink?: string;              // Lien partage | Share link
  shareLinkActive: boolean;        // Lien actif | Link active
  expiresAt?: Date;                // Expire le | Expires at
  completedAt?: Date;              // Terminé le | Completed at
  signatures: Signature[];         // Signatures | Signatures
  templateDigest: string;          // Template content digest | Empreinte du template
  settings: DocumentSettings;      // Paramètres | Settings
}

interface DocumentSettings {
  requireSignatureOrder: boolean;   // Ordre signature obligatoire | Require signature order
  reminderEnabled: boolean;         // Rappels activés | Reminder enabled
  reminderDays: number;            // Jours rappel | Reminder days
  allowPrint: boolean;             // Autoriser impression | Allow print
  allowDownload: boolean;          // Autoriser téléchargement | Allow download
  watermarkText?: string;          // Texte filigrane | Watermark text
}

interface Signature {
  id: string;
  signerId: string;                // ID signataire | Signer ID
  documentId: string;              // ID document | Document ID
  signedAt: Date;                  // Signé le | Signed at
  ipAddress: string;               // Adresse IP | IP address (Backend only)
  userAgent: string;               // Agent utilisateur | User agent (Backend only)
  signatureData?: string;          // Données signature | Signature data (base64)
  fieldValues: Record<string, any>; // Valeurs champs | Field values
  isValid: boolean;                // Valide | Is valid
}


enum UserRole {
  USER = 'user',                   // Utilisateur | User
  ADMIN = 'admin'                  // Administrateur | Admin
}

interface AuthToken {
  jwt: string;
  userId: string;                  // ID utilisateur | User ID
  expiresAt: Date;                 // Expire le | Expires at
  issuedAt: Date;                  // Émis le | Issued at
  tokenHash: string;               // Hash token | Token hash (Backend only)
}

interface ApiResponse<T = any> {
  success: boolean;                // Succès | Success
  data?: T;                        // Données | Data
  error?: string;                  // Erreur | Error
  message?: string;                // Message | Message
}

interface PaginatedResponse extends ApiResponse {
  pagination: {
    page: number;                  // Page | Page
    limit: number;                 // Limite | Limit
    total: number;                 // Total | Total
    totalPages: number;            // Pages totales | Total pages
  };
}

// Frontend-only interfaces (not stored in DB)
interface FormState {
  currentStep: number;             // Étape actuelle | Current step
  isValid: boolean;                // Valide | Is valid
  isDirty: boolean;                // Modifié | Is dirty
  errors: Record<string, string>;  // Erreurs | Errors
}

interface UISettings {
  theme: 'light' | 'dark';         // Thème | Theme
  language: 'fr' | 'en';           // Langue | Language
  timezone: string;                // Fuseau horaire | Timezone
}

// Rental-specific types
enum RentalType {
  FURNISHED = 'furnished',          // Meublé | Furnished
  UNFURNISHED = 'unfurnished',      // Non meublé | Unfurnished
  SHORT_TERM = 'shortTerm',         // Court terme | Short term
  LONG_TERM = 'longTerm'            // Long terme | Long term
}

interface RentalSettings {
  rentalType: RentalType;
  duration: number;                 // Durée en mois | Duration in months
  startDate: Date;
  endDate: Date;
  rent: number;                     // Loyer | Rent
  charges: number;                  // Charges | Charges
  deposit: number;                  // Dépôt de garantie | Security deposit
  furnished: boolean;
  shortTerm: boolean;
}

// Document configuration types
interface DocumentOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'signature';
  required: boolean;
  signerId: string; // specific signer ID, not 'both'
  placeholder?: string;
  min?: number;
  max?: number;
  validation?: string; // regex pattern
}

interface DefaultSigner {
  id: string;
  role: string;
  required: boolean;
  order: number;
}

interface DocumentTypeConfig {
  type: string;
  title: string;
  description: string;
  options: DocumentOption[]; // Document-specific configuration options
  fieldDefinitions: FieldDefinition[]; // Field definitions (reference for Document.fields)
  defaultSigners: DefaultSigner[]; // Default signers for this document type
}

// Export all types
export type {
  Signer, User, BaseField, TextField, NumField,
  DateField, SelectField, SelectOption, DynaField, Field,
  Document, DocumentSettings, Signature, AuthToken, ApiResponse,
  PaginatedResponse, FormState, UISettings, RentalSettings,
  DocumentOption, FieldDefinition, DefaultSigner, DocumentTypeConfig
};

export {
  Unit, Currency, FieldType, DocumentStatus, DocumentType, 
  UserRole, RentalType
};
