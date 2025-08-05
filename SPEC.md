SafeSign est un programme de génération de documents ciblés a la location (meublé ou non, court terme ou non) générant les documents suivant:
- contrats de location
- contrats de sous-location
- actes de cautionnement
- état des lieux
- quittances de loyer
- justificatif de domicile

Ces documents générés doivents etre accord avec [./lois-relatives], de bonne pratique, et mentionner les articles pertinents dans les sections relatives et entete de documents/contrats.

---

Merci d'implémenter safesign en utilisant les technologies suivantes:

Package manager, runtime: Bun
Bundler: Vite
Front: Typescript (ESM) + preact + preact/compat + lightweight custom HistoryAPI router + zustand + tailwind + shadcn
Back: Typescript (ESM) + Bun pour le back-end qui génere les documents et stocke (in-memory storage only, mapping that gets dumped to file at regular interval, eg. 5min)
Common: Typescript (ESM) to share models back to front

Be extremely minimal, concise, elegant and generic (reusable, DRY).

---

Data model:

    Signer (Signataire):
        jwt : auth token
        firstName - Nom du signataire : le nom complet du signataire (Automatique)
        lastName - Prénom du signataire : le prénom du signataire (Automatique)
        title - Titre : le titre du signataire si entreprise (Automatique)
        email - E-mail du signataire : l'adresse e-mail du signataire (optionel) (Automatique)
        organization - Société du signataire : le nom de l'entreprise si applicable (Automatique)
        address - Adresse du signataire : addresse du signataire ou de l'entreprise

    Field (parent class) with these extensions:

        TextField (Champs texte)
            Nom du signataire : le nom complet du signataire (Automatique)
            Prénom du signataire : le prénom du signataire (Automatique)
            Titre : le titre du signataire si entreprise (Automatique)
            E-mail du signataire : l'adresse e-mail du signataire (optionel) (Automatique)
            Société du signataire : le nom de l'entreprise si applicable (Automatique)
            Adresse du signataire : addresse si applicable

            Texte : Champ de saisie libre acceptant tous types de caractères (utilisé pour tiers nom, prénom, divers...)
            E-Mail : Validation email
            Adresse : Validation approximative (par pays)

        NumField (Champs numériques)
            Téléphone : Validation téléphone (par pays)
            Chiffres : Champ de saisie numérique
            Montant : En devise (par default euros mais peut etre changé pour les monnaies courantes et crypto: BTC, ETH, SOL, USDC, USDT)
            Coordonnées : ...
            Identifiant fiscal (Tax Number/TIN) : Validated by country
            SIRET/SIREN (Registration number) : Numéros d'identification des entreprises, validation by country
            TVA intracommunautaire : Numéro de TVA européen
            IBAN : Numéro de compte bancaire international
            BIC/SWIFT : Code d'identification bancaire
            Code APE/NAF : Code d'activité économique
            Numéro de sécurité sociale : Validation selon le format national
            Numéro de passeport : Format alphanumérique selon les normes internationales
            Numéro de permis de conduire : Validation selon le format du pays

        DateField (Champs de dates)
            Date de signature : Date à laquelle le destinataire a signé (Automatique)
            Date : Champ pour saisir une date

        SelectField (Champs de selection)
            Multi selection : de 1 a n choix (nombre de choix défini par l'auteur du document)
            Toggle : ...

        DynaField (Champs dynamique)
            Champs libre : Peut etre dessin, image, ou texte. Par defaut texte.
            Signature : champs libre, par defaut dessin (utilise Champs libre).
            Fonction : lecture-seule, se calcule sur la base d'autres champs (eg. fn(form) => (form["field1"] * form["field2"]).toFixed(2))

        Fields should have relevant attributes:
            validator : default or custom override like fn(value) => true/false
            rounding (decimal places)
            unit : %, °C, °F, Kelvin, bar, PSI, Pa, kW, CV, HP, b, Kb, Gb, m², hectares, acres, m³, litres, gallons, kg, tonnes, livres, km, miles, mètres, années, mois, jours, minutes, secondes, ms, us, ps (by category)

    Document:
        contains envelope id, all the settings, signers and current signatures. synchronized back to front, nothing hidden in the back.
        the documents can be reconstructed from these settings and the templating service (that combines document type template + document settings to create the document)

App structure:
. (nice landing page that describe what safesign is about)
/login (Connexion - username+password, no validation for new accounts, basic jwt bearer header auth with automated token renewal +15min at every user action
/new (Nouveau document - formulaire de création: type de contrat), crée automatiquemment l'enveloppe (identifiant unique du document)
/edit/id (Edition du contrat - si le contrat est actif et signé 1+, il n'est plus modifiable. Simplement annulable par son créateur (les liens de partages sont fermés) - similaire a DocuSign, définition des signataires (société+représentant légal+titre+email pour personne morale, ou nom+prénom+email pour personne physique, et des champs (fields)
/browse (Contrats brouillons (drafts), actifs (non modifiables parce que signés) et archivés - possibilité de modifier un contrat s'il n'as pas été signé par une tierce personne - format liste avec nom de document, type de docu)
/share/id (Génération du lien de partage du contrat pour signature. Une fois partagé, le contrat est actif (draft->active))
/view/id (visualisation d'un document actif ou archivé, renderer identique a /create mais sans les outils de modification. 1 lien unique par document, activable ou désactivable), can print to pdf
/sign/id (Signer un contrat - Pour les contrats existant. Un utilisateur non connecté doit pouvoir signer un contrat partagé par url privée lui étant destiné, pas beson d'email, une fois signé, le contrat n'est plus modifiable. Une fois signé sur le lien unique redirige vers /view/id puisque déja signé. Simmilaire a docusign, les champs remplissable par le signataire sont:
