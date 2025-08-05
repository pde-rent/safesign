# SafeSign

Plateforme de génération de documents de location conformes à la législation française.

## Installation

```bash
bun install
```

## Développement

```bash
bun run dev
```

Le serveur API démarre sur http://localhost:3001
L'application web démarre sur http://localhost:3000

## Production

```bash
bun run build
bun run server
```

## Technologies

- **Runtime**: Bun
- **Frontend**: Preact + TypeScript + Tailwind CSS
- **Backend**: Bun + TypeScript
- **Stockage**: In-memory avec sauvegarde fichier

## Fonctionnalités

- Génération de contrats de location (meublé/non meublé)
- Contrats de sous-location
- Actes de cautionnement
- États des lieux
- Quittances de loyer
- Justificatifs de domicile
- Signature électronique
- Conformité avec la législation française