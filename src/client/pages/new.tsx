import { useState, useEffect } from 'preact/hooks';
import { useRouter } from '../lib/router.js';
import { api } from '../lib/api.js';
import { useTemplates, useStore, useIsAuthenticated } from '../lib/store.js';
import { Layout, PageContainer, PageHeader } from '../components/layout.js';
import { Button, Card, CardContent, Input, Select } from '../components/ui.js';

export const NewDocumentPage = () => {
  const { navigate } = useRouter();
  const templates = useTemplates();
  const isAuthenticated = useIsAuthenticated();
  const setLoading = useStore(state => state.setLoading);
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTemplates();
  }, [isAuthenticated]);

  // Also load templates on component mount regardless of auth state (for debugging)
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      await api.getTemplates();
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedType || !title.trim()) {
      setError('Veuillez sélectionner un type et saisir un titre');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const document = await api.createDocument(selectedType, title.trim());
      navigate(`/edit/${document.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const templateOptions = templates.map(template => ({
    value: template.type,
    label: template.title
  }));

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Nouveau Document"
          description="Créez un nouveau document de location"
        />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document
                  </label>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType((e.target as HTMLSelectElement).value)}
                    options={[
                      { value: '', label: 'Sélectionnez un type...' },
                      ...templateOptions
                    ]}
                  />
                  {selectedType && (
                    <p className="mt-2 text-sm text-gray-600">
                      {templates.find(t => t.type === selectedType)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    label="Titre du document"
                    value={title}
                    onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                    placeholder="Ex: Contrat location appartement Rue des Fleurs"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleCreate}
                    disabled={!selectedType || !title.trim()}
                  >
                    Créer le document
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/browse')}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template previews */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Types de documents disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card 
                  key={template.type} 
                  className={`cursor-pointer transition-colors ${
                    selectedType === template.type ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedType(template.type)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900">{template.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
};