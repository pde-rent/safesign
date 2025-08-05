import { DocumentTemplate, TemplateContext } from './engine.js';
import { formatDate, formatCurrency, formatNumberToWords } from '../../common/utils.js';
import { Currency, RentalType } from '../../common/types.js';
import { rentalContractConfig } from './configs/rental-contract-config.js';

export class RentalContractTemplate extends DocumentTemplate {
  type = 'rentalContract';
  title = 'Contrat de Location Meublée';
  description = 'Contrat de location de logement meublé à usage d\'habitation (France)';
  config = rentalContractConfig;

  render(context: TemplateContext): string {
    const { signers, settings, fields, currentDate } = context;
    const lessor = this.getLessorInfo(signers);
    const tenant = this.getTenantInfo(signers);

    if (!lessor || !tenant) {
      throw new Error('Bailleur et locataire requis');
    }

    const isFurnished = settings.furnished;
    const isShortTerm = settings.shortTerm;
    const totalRent = settings.rent + settings.charges;

    const content = `
      <div class="container">
        <div class="header-box">
          <strong>Contrat de location individuel</strong><br>
          <small>(Soumis au titre Ier bis de la loi du 6 juillet 1989 et portant modification de la<br>
          loi n° 86-1290 du 23 décembre 1986 – bail type conforme aux dispositions de la loi ALUR de 2014,<br>
          mis en application par le décret du 29 mai 2015)</small><br>
          <strong>LOCAUX MEUBLÉS À USAGE D'HABITATION</strong>
        </div>

        <div class="small-text">
          <p>Modalités d'application du contrat type du décret du 29 mai 2015 : Le régime de droit commun en matière
            de baux d'habitation est défini principalement par la loi n° 89-462 du 6 juillet 1989 tendant à
            améliorer les rapports locatifs et portant modification de la loi n° 86-1290 du 23 décembre 1986.
            L'ensemble de ces dispositions étant d'ordre public, elles s'imposent aux parties qui, en principe, ne
            peuvent pas y renoncer.</p>
        </div>

        <h2>I. Désignation des parties</h2>
        <p>Le présent contrat est conclu entre les soussignés :</p>

        <div class="field-horizontal">
          <div class="field-label">Qualité du bailleur :</div>
          <div class="field-body">☐ Personne physique ☐ Personne morale</div>
        </div>

        <div class="field-horizontal">
          <div class="field-label">Nom et prénom du bailleur :</div>
          <div class="field-body">${this.getSignerFullName(lessor)}</div>
        </div>

        ${lessor.organization ? `
        <div class="field-horizontal">
          <div class="field-label">Dénomination (si personne morale) :</div>
          <div class="field-body">${lessor.organization}</div>
        </div>` : ''}

        <div class="field-horizontal">
          <div class="field-label">Adresse :</div>
          <div class="field-body">${lessor.address ? this.formatAddress(lessor.address) : ''}</div>
        </div>

        <div class="field-horizontal">
          <div class="field-label">Adresse email (facultatif) :</div>
          <div class="field-body">${lessor.email || ''}</div>
        </div>

        <p>désigné ci-après « le bailleur » ;</p>

        <div class="field-horizontal">
          <div class="field-label">Nom et prénom du locataire :</div>
          <div class="field-body">${this.getSignerFullName(tenant)}</div>
        </div>

        <div class="field-horizontal">
          <div class="field-label">Adresse email (facultatif) :</div>
          <div class="field-body">${tenant.email || ''}</div>
        </div>

        <p>désigné ci-après « le locataire » ;</p>
        <p>Il a été convenu ce qui suit :</p>

        <h2>II. Objet du contrat</h2>
        <p>Le présent contrat a pour objet la location d'un logement ainsi déterminé :</p>

        <h3>A. Consistance du logement</h3>
        <table class="table">
          <tbody>
            <tr>
              <td><strong>Adresse du logement</strong> :</td>
              <td>${fields.propertyAddress || '[ADRESSE DU LOGEMENT]'}</td>
            </tr>
            <tr>
              <td><strong>Identifiant fiscal du logement :</strong></td>
              <td>${fields.fiscalId || '[IDENTIFIANT FISCAL]'}</td>
            </tr>
            <tr>
              <td><strong>Type d'habitat, Immeuble :</strong></td>
              <td>☐ collectif ☐ individuel / ☐ mono propriété ☐ copropriété</td>
            </tr>
            <tr>
              <td><strong>Période de construction :</strong></td>
              <td>☐ avant 1949 ☐ de 1949 à 1974 ☐ de 1975 à 1989 ☐ de 1989 à 2005 ☐ depuis 2005</td>
            </tr>
            <tr>
              <td><strong>Surface habitable privative :</strong></td>
              <td>${fields.surface || '[SURFACE]'} m²</td>
            </tr>
            <tr>
              <td><strong>Surface habitable collective :</strong></td>
              <td>${fields.sharedSurface || '[SURFACE COLLECTIVE]'} m²</td>
            </tr>
            <tr>
              <td><strong>Nombre de pièces principales :</strong></td>
              <td>${fields.rooms || '[NOMBRE]'} pièces</td>
            </tr>
            <tr>
              <td><strong>Autres parties du logement :</strong></td>
              <td>☐ grenier ☐ comble ☐ terrasse ☐ balcon ☐ loggia ☐ jardin<br>Autres : ${fields.otherParts || ''}</td>
            </tr>
            <tr>
              <td><strong>Équipements de la partie privative :</strong></td>
              <td>${fields.privateEquipment || '[ÉQUIPEMENTS PRIVATIFS]'}</td>
            </tr>
            <tr>
              <td><strong>Équipements de la partie collective :</strong></td>
              <td>${fields.sharedEquipment || '[ÉQUIPEMENTS COLLECTIFS]'}</td>
            </tr>
            <tr>
              <td><strong>Modalité de production de chauffage :</strong></td>
              <td>☐ individuel ☐ collectif</td>
            </tr>
            <tr>
              <td><strong>Modalité de production d'eau chaude sanitaire :</strong></td>
              <td>☐ individuel ☐ collectif</td>
            </tr>
            <tr>
              <td><strong>Niveau de performance du logement</strong> [classe DPE] :</td>
              <td>${fields.dpeClass || '[CLASSE DPE]'}</td>
            </tr>
          </tbody>
        </table>

        <h3>B. Destination des locaux :</h3>
        <p>☐ usage d'habitation ☐ usage mixte professionnel et d'habitation</p>

        <h3>C. Équipements et accessoires de l'immeuble à usage privatif du locataire :</h3>
        <p>☐ cave n° _____ ☐ parking n° _____ ☐ garage n° _____<br>
        Autres : ${fields.privateAccessories || ''}</p>

        <h3>D. Locaux, parties, équipements et accessoires de l'immeuble à usage commun :</h3>
        <p>☐ garage à vélo ☐ ascenseur ☐ espaces verts ☐ aires et équipements de jeux<br>
        ☐ laverie ☐ local poubelle ☐ gardiennage<br>
        Autres : ${fields.sharedAccessories || ''}</p>

        <h3>E. Équipement de réception télévisuel :</h3>
        <p>☐ hertzien ☐ numérique ☐ satellite ☐ par internet</p>

        <h3>F. Équipement de réception internet :</h3>
        <p>☐ cuivre ☐ coaxial ☐ satellite ☐ 4G/5G ☐ fibre optique</p>

        <div class="small-text">
          <p><strong>Rappel :</strong> un logement décent doit respecter les critères minimaux de performance DPE suivants :</p>
          <ul>
            <li><strong>France métropolitaine :</strong> Classe F (01/01/2025), Classe E (01/01/2028), Classe D (01/01/2034).</li>
            <li><strong>Guadeloupe, Martinique, Guyane, La Réunion, Mayotte :</strong> Classe F (01/01/2028), Classe E (01/01/2031).</li>
          </ul>
          <p>La consommation d'énergie finale et le niveau de performance sont déterminés selon la méthode du DPE (art. L. 126-26 CCH).</p>
        </div>

        <h2>III. Date de prise d'effet et durée du contrat</h2>
        <p>La durée du contrat et sa date de prise d'effet sont ainsi définies :</p>

        <div class="field-horizontal">
          <div class="field-label">A. Date de prise d'effet du contrat :</div>
          <div class="field-body">${formatDate(settings.startDate)}</div>
        </div>

        <div class="field-horizontal">
          <div class="field-label">B. Durée du contrat :</div>
          <div class="field-body">${settings.duration} mois (préavis de 1 mois minimum par RAR ou remise en main propre)</div>
        </div>

        <div class="small-text">
          <p>À l'exception des locations consenties à un étudiant pour une durée de neuf mois, les contrats de
            location de logements meublés sont reconduits tacitement à leur terme pour une durée d'un an et
            dans les mêmes conditions. Le locataire peut mettre fin au bail à tout moment, après avoir donné
            congé. Le bailleur peut, quant à lui, mettre fin au bail à son échéance et après avoir donné
            congé, soit pour reprendre le logement en vue de l'occuper lui-même ou une personne de sa
            famille, soit pour le vendre, soit pour un motif sérieux et légitime.</p>
        </div>

        <div class="field-horizontal">
          <div class="field-label">C. Renouvellement du bail :</div>
          <div class="field-body">☐ aucun ☐ tacite ☐ formulé (par avenant ou nouveau contrat)</div>
        </div>

        <h2>IV. Conditions financières</h2>
        <p>Les parties conviennent des conditions financières suivantes :</p>

        <h3>A. Loyer initial</h3>
        <div class="field-horizontal">
          <div class="field-label">1. Montant du loyer mensuel :</div>
          <div class="field-body">${formatCurrency(settings.rent, Currency.EUR)} (${formatNumberToWords(settings.rent)} euros)</div>
        </div>

        <h3>B. Modalités de révision</h3>
        <div class="field-horizontal">
          <div class="field-label">1. Date de révision :</div>
          <div class="field-body">${fields.revisionDate || formatDate(settings.startDate)}</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">2. Date ou trimestre de référence de l'IRL :</div>
          <div class="field-body">${fields.irlReference || 'T1 2025'}</div>
        </div>

        <h3>C. Charges récupérables</h3>
        <p>1. Couverture des charges :</p>
        <p>☐ Eau froide ☐ Eau chaude ☐ Chauffage/Climatisation ☐ Électricité<br>
        ☐ Internet ☐ Télévision/redevance audiovisuelle ☐ Assurance bâtiment/murs<br>
        ☐ Assurance locataire ☐ Ménage intérieur (colocation) ☐ Ménage des parties collectives</p>

        <p>2. Modalité de règlement des charges récupérables :</p>
        <p>☐ Provisions sur charges avec régularisation annuelle ☐ Paiement périodique des charges sans provision / Forfait de charges</p>

        <div class="field-horizontal">
          <div class="field-label">3. Montant des provisions sur charges :</div>
          <div class="field-body">${formatCurrency(settings.charges, Currency.EUR)} / mois</div>
        </div>

        <h3>E. Modalités de paiement</h3>
        <div class="field-horizontal">
          <div class="field-label">Périodicité du paiement :</div>
          <div class="field-body">mensuel (au douzième)</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">Paiement :</div>
          <div class="field-body">☐ à échoir ☐ à terme échu</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">Date ou période de paiement :</div>
          <div class="field-body">${fields.paymentDay || '5'} de chaque mois</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">Lieu de paiement :</div>
          <div class="field-body">${fields.paymentMethod || 'virement bancaire'}</div>
        </div>

        <p><strong>Montant total dû à la première échéance de paiement :</strong></p>
        <div class="field-horizontal">
          <div class="field-label">Loyer (hors charges) :</div>
          <div class="field-body">${formatCurrency(settings.rent, Currency.EUR)}</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">Charges récupérables :</div>
          <div class="field-body">${formatCurrency(settings.charges, Currency.EUR)}</div>
        </div>

        <h2>VI. Garanties</h2>
        <div class="field-horizontal">
          <div class="field-label">Montant du dépôt de garantie :</div>
          <div class="field-body">${formatCurrency(settings.deposit, Currency.EUR)} (${formatNumberToWords(settings.deposit)} euros)</div>
        </div>
        <p class="small-text">* inférieur ou égal à deux mois de loyers hors charges</p>

        <h2>V. Travaux</h2>
        <div class="field-horizontal">
          <div class="field-label">A. Travaux d'amélioration récents :</div>
          <div class="field-body">${fields.recentWorks || '[Aucun]'}</div>
        </div>
        <div class="field-horizontal">
          <div class="field-label">B. Majoration du loyer consécutive à des travaux :</div>
          <div class="field-body">${fields.rentIncrease || '[Aucune]'}</div>
        </div>

        <h2>VII. Clause de solidarité</h2>
        <div class="small-text">
          <p>Dans le cadre de la colocation, chaque locataire signe un contrat individuel avec
            le bailleur. Il n'existe pas de clause de solidarité entre les colocataires, ce qui signifie que
            chaque locataire est uniquement responsable du paiement de son propre loyer, charges, et
            accessoires. Les autres colocataires ne sont pas tenus de couvrir les obligations financières d'un
            colocataire défaillant.</p>
        </div>

        <h2>VIII. Clause résolutoire</h2>
        <div class="small-text">
          <p>Le bail sera résilié de plein droit en cas d'inexécution des obligations du locataire, soit en cas de défaut de paiement des
            loyers et des charges locatives au terme convenu, de non-versement du dépôt de garantie, de défaut
            d'assurance du locataire contre les risques locatifs, de troubles de voisinage constatés par une
            décision de justice passée en force de chose jugée rendue au profit d'un tiers. Le bailleur devra
            assigner le locataire devant le tribunal pour faire constater l'acquisition de la clause résolutoire
            et la résiliation de plein droit du bail.</p>
        </div>

        <h2>XI. Annexes</h2>
        <p>Sont annexées et jointes au contrat de location les pièces suivantes :</p>
        <ul>
          <li>A. Un extrait du règlement de copropriété concernant la destination de l'immeuble</li>
          <li>B. Un plan de situation des parties collectives et privatives de la colocation</li>
          <li>C. Un dossier de diagnostic technique comprenant :
            <ul>
              <li>- un diagnostic de performance énergétique</li>
              <li>- un constat de risque d'exposition au plomb pour les immeubles construits avant le 1er janvier 1949</li>
              <li>- le cas échéant, un état des risques naturels et technologiques</li>
            </ul>
          </li>
          <li>D. Une notice d'information relative aux droits et obligations des locataires et des bailleurs</li>
          <li>E. Un état des lieux, un inventaire et un état détaillé du mobilier</li>
        </ul>

        <div class="signatures">
          <div class="field-horizontal">
            <div class="field-label">Le :</div>
            <div class="field-body">${formatDate(currentDate)}</div>
            <div class="field-label">à :</div>
            <div class="field-body">${fields.city || 'Blois'}</div>
          </div>
          
          <div class="signatures">
            <div class="signature-block">
              <p><strong>Signature du bailleur</strong></p>
              <div class="signature-line"></div>
              <p>${this.getSignerFullName(lessor)}</p>
            </div>
            <div class="signature-block">
              <p><strong>Signature du locataire</strong></p>
              <div class="signature-line"></div>
              <p>${this.getSignerFullName(tenant)}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    return this.wrapDocument(content, this.title);
  }
}