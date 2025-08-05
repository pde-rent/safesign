import { storage } from '../storage.js';
import { generateId } from '../../common/utils.js';
import { getTemplate } from '../templates/index.js';
import type { ApiResponse, Document, Signature, RentalSettings } from '../../common/types.js';
import { DocumentStatus } from '../../common/types.js';

export const signingRoutes = {
  'GET /api/sign/:shareLink': async (req: Request, params: { shareLink: string }): Promise<Response> => {
    try {
      const document = storage.getDocumentByShareLink(params.shareLink);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (!document.shareLinkActive) {
        return Response.json({
          success: false,
          error: 'Lien de partage désactivé'
        } as ApiResponse<null>, { status: 403 });
      }

      if (document.status === 'cancelled' || document.status === 'expired') {
        return Response.json({
          success: false,
          error: `Document ${document.status === 'cancelled' ? 'annulé' : 'expiré'}`
        } as ApiResponse<null>, { status: 400 });
      }

      // Return document with limited info for signing
      const publicDocument = {
        id: document.id,
        envelopeId: document.envelopeId,
        title: document.title,
        type: document.type,
        status: document.status,
        signers: document.signers.map(s => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          organization: s.organization
        })),
        fields: document.fields.filter(f => !f.readonly),
        signatures: document.signatures.map(s => ({
          signerId: s.signerId,
          signedAt: s.signedAt
        }))
      };
      
      return Response.json({
        success: true,
        data: publicDocument
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 500 });
    }
  },

  'POST /api/sign/:shareLink': async (req: Request, params: { shareLink: string }): Promise<Response> => {
    try {
      const document = storage.getDocumentByShareLink(params.shareLink);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      if (!document.shareLinkActive || document.status !== 'active') {
        return Response.json({
          success: false,
          error: 'Document non disponible pour signature'
        } as ApiResponse<null>, { status: 403 });
      }

      const { signerId, fieldValues, signatureData } = await req.json();
      
      // Verify signer exists
      const signer = document.signers.find(s => s.id === signerId);
      if (!signer) {
        return Response.json({
          success: false,
          error: 'Signataire non trouvé'
        } as ApiResponse<null>, { status: 400 });
      }

      // Check if already signed
      if (document.signatures.some(s => s.signerId === signerId)) {
        return Response.json({
          success: false,
          error: 'Document déjà signé par ce signataire'
        } as ApiResponse<null>, { status: 400 });
      }

      // Create signature
      const signature: Signature = {
        id: await generateId(),
        signerId,
        documentId: document.id,
        signedAt: new Date(),
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        signatureData,
        fieldValues,
        isValid: true
      };

      // Update document
      const updatedDocument: Document = {
        ...document,
        signatures: [...document.signatures, signature],
        updatedAt: new Date()
      };

      // Update fields with signer values
      if (fieldValues) {
        updatedDocument.fields = document.fields.map(field => {
          if (field.signerId === signerId && fieldValues[field.id] !== undefined) {
            return { ...field, value: fieldValues[field.id] };
          }
          return field;
        });
      }

      // Check if all signers have signed
      const allSigned = document.signers.every(s => 
        updatedDocument.signatures.some(sig => sig.signerId === s.id)
      );

      if (allSigned) {
        updatedDocument.status = DocumentStatus.COMPLETED;
        updatedDocument.completedAt = new Date();
      }

      storage.setDocument(document.id, updatedDocument);
      
      return Response.json({
        success: true,
        data: {
          signed: true,
          allSigned,
          redirectUrl: `/view/${document.envelopeId}`
        }
      } as ApiResponse<any>);
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      } as ApiResponse<null>, { status: 400 });
    }
  },

  'GET /api/view/:envelopeId': async (req: Request, params: { envelopeId: string }): Promise<Response> => {
    try {
      const document = storage.getDocumentByEnvelopeId(params.envelopeId);
      
      if (!document) {
        return Response.json({
          success: false,
          error: 'Document non trouvé'
        } as ApiResponse<null>, { status: 404 });
      }

      // Get rental settings (mock for now, should be stored with document)
      const rentalSettings: RentalSettings = {
        rentalType: 'longTerm' as any,
        duration: 12,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        rent: 800,
        charges: 50,
        deposit: 800,
        furnished: false,
        shortTerm: false
      };

      // Generate final document
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