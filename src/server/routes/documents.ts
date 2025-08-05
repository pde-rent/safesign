import { auth } from '../auth.js';
import { storage } from '../storage.js';
import { generateId, generateEnvelopeId } from '../../common/utils.js';
import { getTemplate, getAllTemplates } from '../templates/index.js';
import type { ApiResponse, Document, DocumentStatus, DocumentType, RentalSettings, Signer, Field } from '../../common/types.js';

export const documentRoutes = {
  'GET /api/templates': async (req: Request): Promise<Response> => {
    try {
      const templates = getAllTemplates();
      return Response.json({
        success: true,
        data: templates
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  },

  'GET /api/templates/:type/config': async (req: Request, params: Record<string, string>): Promise<Response> => {
    try {
      const { type } = params;
      const template = getTemplate(type);
      
      if (!template.config) {
        return Response.json({
          success: false,
          error: 'Configuration non disponible pour ce type de document'
        } as ApiResponse<null>, { status: 404 });
      }

      return Response.json({
        success: true,
        data: template.config
      } as ApiResponse<typeof template.config>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  },

  'GET /api/documents': async (req: Request): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const documents = storage.getUserDocuments(user.id);
      
      return Response.json({
        success: true,
        data: documents
      } as ApiResponse<Document[]>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 401 });
    }
  },

  'POST /api/documents': async (req: Request): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const { type, title } = await req.json();
      
      if (!type || !title) {
        return Response.json({
          success: false,
          error: 'Type et titre requis'
        } as ApiResponse<null>, { status: 400 });
      }

      const template = getTemplate(type);
      const document: Document = {
        id: await generateId(),
        envelopeId: await generateEnvelopeId([], title),
        title,
        type: type as DocumentType,
        status: 'draft' as DocumentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id,
        signers: [],
        fields: [],
        shareLinkActive: false,
        signatures: [],
        templateDigest: template.getDigest(),
        settings: {
          requireSignatureOrder: false,
          reminderEnabled: true,
          reminderDays: 7,
          allowPrint: true,
          allowDownload: true
        }
      };

      storage.setDocument(document.id, document);
      
      return Response.json({
        success: true,
        data: document
      } as ApiResponse<Document>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'GET /api/documents/:id': async (req: Request, params: { id: string }): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const document = storage.getDocument(params.id);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (document.createdBy !== user.id && user.role !== 'admin') {
        return Response.json({
          success: false,
          error: 'Accès non autorisé'
        } as ApiResponse<null>, { status: 403 });
      }
      
      return Response.json({
        success: true,
        data: document
      } as ApiResponse<Document>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 401 });
    }
  },

  'PUT /api/documents/:id': async (req: Request, params: { id: string }): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const document = storage.getDocument(params.id);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (document.createdBy !== user.id) {
        return Response.json({
          success: false,
          error: 'Accès non autorisé'
        } as ApiResponse<null>, { status: 403 });
      }

      if (document.status !== 'draft') {
        return Response.json({
          success: false,
          error: 'Impossible de modifier un document actif'
        } as ApiResponse<null>, { status: 400 });
      }

      const updates = await req.json();
      const updatedDocument: Document = {
        ...document,
        ...updates,
        id: document.id, // Prevent ID change
        envelopeId: document.envelopeId, // Prevent envelope ID change
        createdBy: document.createdBy, // Prevent owner change
        createdAt: document.createdAt, // Preserve creation date
        updatedAt: new Date()
      };

      storage.setDocument(params.id, updatedDocument);
      
      return Response.json({
        success: true,
        data: updatedDocument
      } as ApiResponse<Document>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'POST /api/documents/:id/share': async (req: Request, params: { id: string }): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const document = storage.getDocument(params.id);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (document.createdBy !== user.id) {
        return Response.json({
          success: false,
          error: 'Accès non autorisé'
        } as ApiResponse<null>, { status: 403 });
      }

      // Generate share link if not exists
      const shareLink = document.shareLink || await generateId();
      
      const updatedDocument: Document = {
        ...document,
        shareLink,
        shareLinkActive: true,
        status: 'active' as DocumentStatus,
        updatedAt: new Date()
      };

      storage.setDocument(params.id, updatedDocument);
      
      return Response.json({
        success: true,
        data: {
          shareLink: `/sign/${shareLink}`,
          fullUrl: `${req.headers.get('origin') || ''}/sign/${shareLink}`
        }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'DELETE /api/documents/:id': async (req: Request, params: { id: string }): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const document = storage.getDocument(params.id);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (document.createdBy !== user.id) {
        return Response.json({
          success: false,
          error: 'Accès non autorisé'
        } as ApiResponse<null>, { status: 403 });
      }

      if (document.status === 'completed') {
        return Response.json({
          success: false,
          error: 'Impossible de supprimer un document terminé'
        } as ApiResponse<null>, { status: 400 });
      }

      storage.deleteDocument(params.id);
      
      return Response.json({
        success: true,
        message: 'Document supprimé'
      } as ApiResponse<null>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'GET /api/documents/:id/preview': async (req: Request, params: { id: string }): Promise<Response> => {
    try {
      const user = await auth.requireAuth(req);
      const document = storage.getDocument(params.id);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (document.createdBy !== user.id) {
        return Response.json({
          success: false,
          error: 'Accès non autorisé'
        } as ApiResponse<null>, { status: 403 });
      }

      // Get rental settings from request or document
      const url = new URL(req.url);
      const rentalSettings: RentalSettings = {
        rentalType: url.searchParams.get('rentalType') as any || 'longTerm',
        duration: parseInt(url.searchParams.get('duration') || '12'),
        startDate: new Date(url.searchParams.get('startDate') || new Date()),
        endDate: new Date(url.searchParams.get('endDate') || new Date()),
        rent: parseFloat(url.searchParams.get('rent') || '0'),
        charges: parseFloat(url.searchParams.get('charges') || '0'),
        deposit: parseFloat(url.searchParams.get('deposit') || '0'),
        furnished: url.searchParams.get('furnished') === 'true',
        shortTerm: url.searchParams.get('shortTerm') === 'true'
      };

      // Generate preview
      const template = getTemplate(document.type);
      const html = template.render({
        document,
        settings: rentalSettings,
        fields: document.fields.reduce((acc, field) => {
          acc[field.id] = field.value;
          return acc;
        }, {} as Record<string, any>),
        signers: document.signers,
        currentDate: new Date()
      });

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  }
};