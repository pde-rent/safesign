import { useState, useEffect } from 'preact/hooks';
import { useRouter } from '../lib/router.js';
import { api } from '../lib/api.js';
import { useCurrentDocument, useStore, useIsAuthenticated } from '../lib/store.js';
import { Layout, PageContainer, PageHeader } from '../components/layout.js';
import { Button, Card, CardContent } from '../components/ui.js';
import { getDocumentTypeLabel, getDocumentStatusLabel } from '../../common/translations.js';
import type { DocumentTypeConfig, FieldDefinition } from '../../common/types.js';

interface EditDocumentPageProps {
  id: string;
}

export const EditDocumentPage = ({ id }: EditDocumentPageProps) => {
  const { navigate } = useRouter();
  const currentDocument = useCurrentDocument();
  const isAuthenticated = useIsAuthenticated();
  const setLoading = useStore(state => state.setLoading);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<DocumentTypeConfig | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDocument();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (currentDocument) {
      loadDocumentConfig();
      // Initialize field values from document fields
      const values: Record<string, any> = {};
      currentDocument.fields.forEach(field => {
        values[field.id] = field.value || '';
      });
      setFieldValues(values);
    }
  }, [currentDocument]);

  const loadDocument = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      await api.getDocument(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Document non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentConfig = async () => {
    if (!currentDocument) return;
    
    try {
      const response = await fetch(`/api/templates/${currentDocument.type}/config`);
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error loading document config:', error);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (fieldDef: FieldDefinition) => {
    const value = fieldValues[fieldDef.id] || '';
    
    switch (fieldDef.type) {
      case 'text':
        return (
          <input
            key={fieldDef.id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, (e.target as HTMLInputElement).value)}
            placeholder={fieldDef.placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
      
      case 'email':
        return (
          <input
            key={fieldDef.id}
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, (e.target as HTMLInputElement).value)}
            placeholder={fieldDef.placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
      
      case 'number':
        return (
          <input
            key={fieldDef.id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, Number((e.target as HTMLInputElement).value))}
            placeholder={fieldDef.placeholder}
            min={fieldDef.min}
            max={fieldDef.max}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
      
      case 'date':
        return (
          <input
            key={fieldDef.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, (e.target as HTMLInputElement).value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            key={fieldDef.id}
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, (e.target as HTMLTextAreaElement).value)}
            placeholder={fieldDef.placeholder}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
      
      default:
        return (
          <input
            key={fieldDef.id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(fieldDef.id, (e.target as HTMLInputElement).value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={fieldDef.required}
          />
        );
    }
  };

  const handleShare = async () => {
    if (!currentDocument) return;
    
    try {
      const result = await api.shareDocument(currentDocument.id);
      alert(`Lien de partage créé: ${result.fullUrl}`);
    } catch (error) {
      alert('Erreur lors de la création du lien de partage');
    }
  };

  if (error) {
    return (
      <Layout>
        <PageContainer>
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/browse')}>
                Retour aux documents
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
      </Layout>
    );
  }

  if (!currentDocument) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <p>Chargement...</p>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<any>(null);

  const handleSignerClick = (signer: any) => {
    setSelectedSigner(signer);
    setShowSignerModal(true);
  };

  return (
    <Layout>
      <PageContainer>
        {/* Header with document info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 -mx-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{currentDocument.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Type: {getDocumentTypeLabel(currentDocument.type)}</span>
                <span>•</span>
                <span>Statut: {getDocumentStatusLabel(currentDocument.status)}</span>
                <span>•</span>
                <span>Créé le: {new Date(currentDocument.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Modifié le: {new Date(currentDocument.updatedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Signatures: {currentDocument.signatures.length}/{currentDocument.signers.length}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {currentDocument.status === 'draft' && (
                <Button onClick={handleShare}>
                  Partager pour signature
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/browse')}>
                Retour
              </Button>
            </div>
          </div>
        </div>

        {/* Top section - Signers and Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Signers - 1/3 width */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Signataires</h3>
            <div className="space-y-2">
              {config?.defaultSigners.map((signer, index) => {
                const signerData = currentDocument?.signers.find(s => s.id === signer.id);
                return (
                  <button
                    key={signer.id}
                    onClick={() => handleSignerClick({ ...signer, ...signerData })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${index === 0 ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                        <span className={`${index === 0 ? 'text-blue-600' : 'text-green-600'} font-semibold text-sm`}>
                          {signer.role.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{signer.role}</p>
                        <p className="text-xs text-gray-600">
                          {signerData?.firstName && signerData?.lastName 
                            ? `${signerData.firstName} ${signerData.lastName}` 
                            : signerData?.email || 'Non configuré'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Options - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Options du document</h3>
              <Button variant="outline" onClick={() => setShowOptionsModal(true)}>
                Modifier
              </Button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {config?.options.slice(0, 6).map((option) => (
                  <div key={option.id}>
                    <span className="font-medium text-gray-700">{option.label}:</span>
                    <span className="ml-2 text-gray-600">
                      {option.defaultValue || 'Non défini'}
                    </span>
                  </div>
                ))}
                {config && config.options.length > 6 && (
                  <div className="text-gray-500">
                    +{config.options.length - 6} autres options...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content - Document preview and Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview - 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Aperçu du document</h3>
            </div>
            <div className="overflow-y-auto max-h-96 p-6 bg-gray-50">
              <div className="bg-white p-8 shadow-sm text-sm">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold mb-2">Contrat de location individuel</h4>
                  <p className="text-xs text-gray-600 mb-1">(Soumis au titre Ier bis de la loi du 6 juillet 1989)</p>
                  <p className="font-semibold">LOCAUX MEUBLÉS À USAGE D'HABITATION</p>
                </div>
                
                <div className="mb-6">
                  <h5 className="font-semibold mb-3 text-base">I. Désignation des parties</h5>
                  <p className="mb-3">Le présent contrat est conclu entre les soussignés :</p>
                  
                  <div className="ml-4 mb-4 space-y-1">
                    <p><strong>Bailleur :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Nom du bailleur]</span></p>
                    <p><strong>Adresse :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Adresse du bailleur]</span></p>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    <p><strong>Locataire :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Nom du locataire]</span></p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold mb-3 text-base">II. Objet du contrat</h5>
                  <div className="space-y-2">
                    <p><strong>Adresse du logement :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Adresse du logement]</span></p>
                    <p><strong>Surface :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Surface m²]</span> m²</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold mb-3 text-base">IV. Conditions financières</h5>
                  <div className="space-y-2">
                    <p><strong>Loyer mensuel :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Montant]</span> €</p>
                    <p><strong>Date d'effet :</strong> <span className="bg-yellow-100 px-2 py-1 rounded">[Date]</span></p>
                  </div>
                </div>

                <div className="text-center mt-12 pt-8 border-t border-gray-200">
                  <p className="mb-6 font-semibold">Signatures :</p>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="font-medium">Le Bailleur</p>
                      <div className="mt-4 w-32 h-16 border-2 border-dashed border-gray-300 rounded"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Le Locataire</p>
                      <div className="mt-4 w-32 h-16 border-2 border-dashed border-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fields Panel - 1/3 width */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Champs du document</h3>
            </div>
            <div className="overflow-y-auto max-h-96 p-4">
              <div className="space-y-4">
                {config?.fieldDefinitions.map((fieldDef) => (
                  <div key={fieldDef.id} className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fieldDef.label}
                      {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-xs text-blue-600 ml-2">({fieldDef.signerId})</span>
                    </label>
                    {renderField(fieldDef)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signer Modal */}
        {showSignerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedSigner ? `Modifier ${selectedSigner.role}` : 'Ajouter un signataire'}
                </h3>
                <button
                  onClick={() => {setShowSignerModal(false); setSelectedSigner(null);}}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={selectedSigner?.firstName || ''}
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={selectedSigner?.lastName || ''}
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    defaultValue={selectedSigner?.email || ''}
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="hasOrganization" className="mr-2" />
                  <label htmlFor="hasOrganization" className="text-sm">Représentant d'une organisation</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    defaultValue={selectedSigner?.organization || ''}
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre/Fonction</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    defaultValue={selectedSigner?.title || ''}
                    placeholder="Directeur, Gérant..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    defaultValue={selectedSigner?.address || ''}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {setShowSignerModal(false); setSelectedSigner(null);}}
                >
                  Annuler
                </Button>
                <Button onClick={() => {setShowSignerModal(false); setSelectedSigner(null);}}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </Layout>
  );
};