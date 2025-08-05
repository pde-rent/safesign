import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate } from '../../common/utils.js';

export class InventoryTemplate extends DocumentTemplate {
  type = 'inventory';
  title = 'État des Lieux';
  description = 'État des lieux d\'entrée ou de sortie';

  render(context: TemplateContext): string {
    const { signers, fields, currentDate } = context;
    const lessor = this.getLessorInfo(signers);
    const tenant = this.getTenantInfo(signers);

    if (!lessor || !tenant) {
      throw new Error('Bailleur et locataire requis');
    }

    const isEntry = fields.inventoryType === 'entry';

    const content = `
      <div class="header-info">
        Fait à ${fields.city || '[VILLE]'}, le ${formatDate(currentDate)}
      </div>

      <h1>ÉTAT DES LIEUX ${isEntry ? 'D\'ENTRÉE' : 'DE SORTIE'}</h1>
      <p class="article-ref">(Article 3-2 de la loi n°89-462 du 6 juillet 1989)</p>

      <h2>PARTIES PRÉSENTES</h2>
      
      <p><strong>Bailleur :</strong> ${this.getSignerFullName(lessor)}</p>
      <p><strong>Locataire :</strong> ${this.getSignerFullName(tenant)}</p>

      <h2>LOGEMENT</h2>
      <p>
        <strong>Adresse :</strong> ${fields.propertyAddress || '[ADRESSE DU BIEN]'}<br>
        <strong>Type :</strong> ${fields.propertyType || '[TYPE]'}<br>
        <strong>Surface :</strong> ${fields.surface || '[SURFACE]'} m²
      </p>

      <h2>RELEVÉS DES COMPTEURS</h2>
      <p>
        <strong>Électricité :</strong> ${fields.electricityMeter || '[RELEVÉ]'} kWh<br>
        <strong>Gaz :</strong> ${fields.gasMeter || '[RELEVÉ]'} m³<br>
        <strong>Eau :</strong> ${fields.waterMeter || '[RELEVÉ]'} m³
      </p>

      <h2>CLÉS REMISES</h2>
      <p>
        <strong>Porte d'entrée :</strong> ${fields.entranceKeys || '0'} clé(s)<br>
        <strong>Boîte aux lettres :</strong> ${fields.mailboxKeys || '0'} clé(s)<br>
        <strong>Cave/Garage :</strong> ${fields.otherKeys || '0'} clé(s)<br>
        <strong>Autres :</strong> ${fields.otherKeysDesc || 'Néant'}
      </p>

      <h2>ÉTAT DÉTAILLÉ PAR PIÈCE</h2>

      <h3>ENTRÉE</h3>
      <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Élément</th>
          <th>État</th>
          <th>Observations</th>
        </tr>
        <tr>
          <td>Sol</td>
          <td>${fields.entryFloor || 'Bon'}</td>
          <td>${fields.entryFloorObs || '-'}</td>
        </tr>
        <tr>
          <td>Murs</td>
          <td>${fields.entryWalls || 'Bon'}</td>
          <td>${fields.entryWallsObs || '-'}</td>
        </tr>
        <tr>
          <td>Plafond</td>
          <td>${fields.entryCeiling || 'Bon'}</td>
          <td>${fields.entryCeilingObs || '-'}</td>
        </tr>
        <tr>
          <td>Éclairage</td>
          <td>${fields.entryLighting || 'Bon'}</td>
          <td>${fields.entryLightingObs || '-'}</td>
        </tr>
      </table>

      <h3>SÉJOUR</h3>
      <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Élément</th>
          <th>État</th>
          <th>Observations</th>
        </tr>
        <tr>
          <td>Sol</td>
          <td>${fields.livingFloor || 'Bon'}</td>
          <td>${fields.livingFloorObs || '-'}</td>
        </tr>
        <tr>
          <td>Murs</td>
          <td>${fields.livingWalls || 'Bon'}</td>
          <td>${fields.livingWallsObs || '-'}</td>
        </tr>
        <tr>
          <td>Plafond</td>
          <td>${fields.livingCeiling || 'Bon'}</td>
          <td>${fields.livingCeilingObs || '-'}</td>
        </tr>
        <tr>
          <td>Fenêtres</td>
          <td>${fields.livingWindows || 'Bon'}</td>
          <td>${fields.livingWindowsObs || '-'}</td>
        </tr>
      </table>

      <h3>CUISINE</h3>
      <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Élément</th>
          <th>État</th>
          <th>Observations</th>
        </tr>
        <tr>
          <td>Sol</td>
          <td>${fields.kitchenFloor || 'Bon'}</td>
          <td>${fields.kitchenFloorObs || '-'}</td>
        </tr>
        <tr>
          <td>Murs/Crédence</td>
          <td>${fields.kitchenWalls || 'Bon'}</td>
          <td>${fields.kitchenWallsObs || '-'}</td>
        </tr>
        <tr>
          <td>Meubles</td>
          <td>${fields.kitchenCabinets || 'Bon'}</td>
          <td>${fields.kitchenCabinetsObs || '-'}</td>
        </tr>
        <tr>
          <td>Équipements</td>
          <td>${fields.kitchenAppliances || 'Bon'}</td>
          <td>${fields.kitchenAppliancesObs || '-'}</td>
        </tr>
      </table>

      <h3>SALLE DE BAIN</h3>
      <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Élément</th>
          <th>État</th>
          <th>Observations</th>
        </tr>
        <tr>
          <td>Sol</td>
          <td>${fields.bathroomFloor || 'Bon'}</td>
          <td>${fields.bathroomFloorObs || '-'}</td>
        </tr>
        <tr>
          <td>Murs/Faïence</td>
          <td>${fields.bathroomWalls || 'Bon'}</td>
          <td>${fields.bathroomWallsObs || '-'}</td>
        </tr>
        <tr>
          <td>Sanitaires</td>
          <td>${fields.bathroomFixtures || 'Bon'}</td>
          <td>${fields.bathroomFixturesObs || '-'}</td>
        </tr>
        <tr>
          <td>Robinetterie</td>
          <td>${fields.bathroomPlumbing || 'Bon'}</td>
          <td>${fields.bathroomPlumbingObs || '-'}</td>
        </tr>
      </table>

      <h2>OBSERVATIONS GÉNÉRALES</h2>
      <p style="border: 1px solid #ccc; padding: 10px; min-height: 100px;">
        ${fields.generalObservations || 'Néant'}
      </p>

      <h2>SIGNATURES</h2>
      <p>Les parties reconnaissent l'exactitude de l'état des lieux et en ont reçu un exemplaire.</p>
      
      <div class="signatures">
        <div class="signature-block">
          <p>Le Bailleur</p>
          <div class="signature-line"></div>
          <p>${this.getSignerFullName(lessor)}</p>
        </div>
        <div class="signature-block">
          <p>Le Locataire</p>
          <div class="signature-line"></div>
          <p>${this.getSignerFullName(tenant)}</p>
        </div>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }
}