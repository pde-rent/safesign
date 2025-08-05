import { useEffect, useState } from 'preact/hooks';
import { Link, useRouter } from '../lib/router.js';
import { api } from '../lib/api.js';
import { useDocuments, useStore, useIsAuthenticated } from '../lib/store.js';
import { Layout, PageContainer, PageHeader } from '../components/layout.js';
import { Button, Card, CardContent, Badge, Input, Select } from '../components/ui.js';
import { formatDate } from '../../common/utils.js';
import { getDocumentTypeLabel, getDocumentStatusLabel } from '../../common/translations.js';
import type { Document, DocumentStatus, DocumentType } from '../../common/types.js';

export const BrowsePage = () => {
  const { navigate } = useRouter();
  const documents = useDocuments();
  const isAuthenticated = useIsAuthenticated();
  const setLoading = useStore(state => state.setLoading);
  const [filter, setFilter] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDocuments();
  }, [isAuthenticated]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      await api.getDocuments();
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter.search && !doc.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.status !== 'all' && doc.status !== filter.status) {
      return false;
    }
    if (filter.type !== 'all' && doc.type !== filter.type) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, 'default' | 'warning' | 'success' | 'danger'> = {
      draft: 'default',
      active: 'warning',
      completed: 'success',
      cancelled: 'danger',
      expired: 'danger'
    };
    
    
    return <Badge variant={variants[status]}>{getDocumentStatusLabel(status)}</Badge>;
  };


  const handleDocumentAction = (doc: Document) => {
    if (doc.status === 'draft') {
      navigate(`/edit/${doc.id}`);
    } else {
      navigate(`/view/${doc.envelopeId}`);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title="Mes Documents"
          description="Gérez tous vos documents de location"
          actions={
            <Link href="/new">
              <Button>Nouveau Document</Button>
            </Link>
          }
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Rechercher..."
                value={filter.search}
                onInput={(e) => setFilter(prev => ({ 
                  ...prev, 
                  search: (e.target as HTMLInputElement).value 
                }))}
              />
              <Select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  status: (e.target as HTMLSelectElement).value 
                }))}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'draft', label: 'Brouillons' },
                  { value: 'active', label: 'Actifs' },
                  { value: 'completed', label: 'Terminés' },
                  { value: 'cancelled', label: 'Annulés' }
                ]}
              />
              <Select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  type: (e.target as HTMLSelectElement).value 
                }))}
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'rentalContract', label: 'Contrats de location' },
                  { value: 'subleaseContract', label: 'Contrats de sous-location' },
                  { value: 'guaranteeAct', label: 'Actes de cautionnement' },
                  { value: 'inventory', label: 'États des lieux' },
                  { value: 'rentReceipt', label: 'Quittances de loyer' },
                  { value: 'residenceCertificate', label: 'Justificatifs de domicile' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {documents.length === 0 
                  ? 'Aucun document créé' 
                  : 'Aucun document ne correspond à vos critères'}
              </p>
              {documents.length === 0 && (
                <Link href="/new">
                  <Button>Créer votre premier document</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map(doc => (
              <Card 
                key={doc.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDocumentAction(doc)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doc.title}
                        </h3>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getDocumentTypeLabel(doc.type)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Créé le {formatDate(new Date(doc.createdAt))}</span>
                        {doc.signers.length > 0 && (
                          <span>{doc.signers.length} signataire(s)</span>
                        )}
                        {doc.signatures.length > 0 && (
                          <span>{doc.signatures.length} signature(s)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {doc.status === 'draft' ? (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit/${doc.id}`);
                          }}
                        >
                          Modifier
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/view/${doc.envelopeId}`);
                          }}
                        >
                          Voir
                        </Button>
                      )}
                      {doc.status === 'active' && doc.shareLink && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/sign/${doc.shareLink}`;
                            await navigator.clipboard.writeText(url);
                            alert('Lien copié !');
                          }}
                        >
                          Copier lien
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </Layout>
  );
};