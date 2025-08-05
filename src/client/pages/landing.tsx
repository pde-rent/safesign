import { Link } from '../lib/router.js';
import { Button } from '../components/ui.js';

export const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Gérez vos contrats en toute simplicité
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Créez et faites signer en 5 minutes vos contrats de location, de travail et bien d'autres.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                En savoir plus <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Documents conformes et sécurisés
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Document Types Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Types de documents disponibles
            </h2>
            <p className="mt-4 text-gray-600">
              Générez tous vos documents immobiliers en quelques clics
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {documentTypes.map((doc) => (
              <div key={doc.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{doc.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {doc.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-primary-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à simplifier votre gestion locative ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Créez votre compte gratuitement et commencez à générer vos documents en quelques minutes.
            </p>
            <div className="mt-10">
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Créer mon compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature icons (simplified as components)
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const features = [
  {
    name: 'Documents conformes',
    description: 'Tous nos modèles sont conformes à la législation française et mentionnent les articles de loi pertinents.',
    icon: DocumentIcon,
  },
  {
    name: 'Signature sécurisée',
    description: 'Système de signature électronique sécurisé avec traçabilité complète et valeur légale.',
    icon: ShieldIcon,
  },
  {
    name: 'Génération rapide',
    description: 'Créez vos documents en quelques minutes grâce à nos formulaires intelligents et intuitifs.',
    icon: ClockIcon,
  },
];

const documentTypes = [
  {
    title: 'Contrat de location',
    description: 'Bail de location meublé ou non meublé',
    features: [
      'Conforme à la loi du 6 juillet 1989',
      'Meublé ou non meublé',
      'Court terme ou long terme',
      'Clause résolutoire incluse'
    ]
  },
  {
    title: 'Quittance de loyer',
    description: 'Justificatif de paiement mensuel',
    features: [
      'Génération automatique',
      'Numérotation séquentielle',
      'Détail loyer et charges',
      'Valable comme justificatif'
    ]
  },
  {
    title: 'État des lieux',
    description: 'Document d\'entrée ou de sortie',
    features: [
      'Formulaire détaillé par pièce',
      'Relevé des compteurs',
      'État du mobilier',
      'Photos intégrables'
    ]
  },
  {
    title: 'Acte de cautionnement',
    description: 'Garantie solidaire pour location',
    features: [
      'Mention manuscrite obligatoire',
      'Plafond légal respecté',
      'Articles du Code civil',
      'Engagement clair'
    ]
  },
  {
    title: 'Contrat de sous-location',
    description: 'Autorisation de sous-louer',
    features: [
      'Accord du bailleur principal',
      'Durée limitée au bail',
      'Obligations du sous-locataire',
      'Responsabilité maintenue'
    ]
  },
  {
    title: 'Attestation d\'hébergement',
    description: 'Justificatif de domicile',
    features: [
      'Format officiel',
      'Mentions légales',
      'Pièces à joindre listées',
      'Avertissement pénal'
    ]
  }
];