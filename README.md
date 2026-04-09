# Internal Tools API

API REST pour gérer l'inventaire des outils internes d'une entreprise. Filtrage avancé, pagination, analytics et documentation interactive via Swagger.

---

## Technologies

| Outil | Rôle |
|---|---|
| TypeScript / Node.js | Langage & runtime |
| Express.js | Framework HTTP |
| PostgreSQL + Prisma ORM | Base de données |
| Zod | Validation des données entrantes |
| Swagger / OpenAPI 3.0 | Documentation interactive |
| Docker & Docker Compose | Environnement de base de données |
| tsx | Exécution et rechargement TypeScript |
| Jest + Supertest | Tests unitaires et d'intégration |

---

## Prérequis

- **Node.js** v18 ou supérieur
- **Docker Desktop** lancé — [Installer Docker](https://docs.docker.com/get-docker/)

---

## Installation & démarrage

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Le fichier `.env` contient déjà les valeurs par défaut pour le développement local. Modifie-les si nécessaire.

### 3. Démarrer l'application

```bash
npm run start
```

Cette commande enchaîne automatiquement :
1. Lance les containers Docker (PostgreSQL + pgAdmin)
2. Attend que le port 5432 soit disponible
3. Génère le client Prisma
4. Démarre le serveur avec rechargement automatique (`tsx watch`)

### 4. Initialiser la base de données

Au premier lancement, synchronise le schéma Prisma :

```bash
npx prisma db push
```

Pour peupler la base avec des données de test :

```bash
npx prisma db seed
```

### URLs

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Documentation Swagger | http://localhost:3000/api/docs |
| pgAdmin | http://localhost:8081 |

---

## Variables d'environnement

Copie `.env.example` vers `.env` et configure tes variables. Valeurs principales :

```env
DATABASE_URL="postgresql://dev:dev123@localhost:5432/internal_tools?schema=public"
PORT=3000
NODE_ENV=development
```

Voir `.env.example` pour la liste complète avec les variables Docker.

---

## Scripts disponibles

```bash
npm run start       # Lance Docker + Prisma + serveur (workflow complet)
npm run dev         # Serveur uniquement avec rechargement automatique
npm run db:generate # Régénère le client Prisma
npm test            # Lance la suite de tests Jest
```

---

## Architecture

```
src/
├── server.ts               # Point d'entrée Express
├── controllers/            # Gestion HTTP (requêtes / réponses)
│   ├── toolController.ts
│   └── analyticController.ts
├── services/               # Logique métier
│   ├── toolService.ts
│   └── analyticService.ts
├── repositories/           # Accès aux données (Prisma)
│   └── toolRepository.ts
├── routes/                 # Définition des routes + doc OpenAPI
│   ├── toolRoutes.ts
│   └── analyticRoutes.ts
├── schemas/                # Schémas de validation Zod
│   └── toolSchema.ts
├── middlewares/            # Middlewares Express
│   ├── validate.ts         # Validation des requêtes
│   └── errorMiddleware.ts  # Gestion centralisée des erreurs
├── constants/
│   └── analytics.ts        # Seuils métier nommés
├── utils/
│   ├── appError.ts         # Classe d'erreur personnalisée
│   └── analyticsHelpers.ts # Fonctions helper analytics
└── lib/
    └── prisma.ts           # Instance singleton Prisma
```

### Principes appliqués

- **Layered Architecture** — Controllers → Services → Repositories : chaque couche a une seule responsabilité
- **Zod validation** — toutes les routes POST et PUT passent par un middleware de validation avant d'atteindre le controller
- **Partial update** — le PUT ne modifie que les champs fournis, les autres restent inchangés
- **Named constants** — aucun nombre magique dans le code, tous les seuils sont dans `constants/analytics.ts`

---

## Endpoints

### Outils (CRUD)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/tools` | Liste paginée avec filtres |
| POST | `/api/tools` | Créer un outil |
| GET | `/api/tools/:id` | Détail d'un outil |
| PUT | `/api/tools/:id` | Mise à jour partielle |
| DELETE | `/api/tools/:id` | Supprimer un outil |

#### Paramètres GET /api/tools

| Paramètre | Type | Description |
|---|---|---|
| `name` | string | Recherche partielle (insensible à la casse) |
| `category_id` | integer | Filtrer par catégorie |
| `owner_department` | string | Filtrer par département |
| `page` | integer | Numéro de page (défaut: 1) |
| `limit` | integer | Résultats par page (défaut: 20) |

Réponse paginée :
```json
{
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Analytics

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/department-costs` | Coûts et % du budget par département |
| GET | `/api/analytics/tools-by-category` | Répartition des outils par catégorie |
| GET | `/api/analytics/low-usage-tools` | Outils sous-utilisés (`?maxUsers=5`) |
| GET | `/api/analytics/vendor-summary` | Efficience par fournisseur |
| GET | `/api/analytics/expensive-tools` | Outils coûteux avec analyse d'efficience (`?minCost=100&limit=10`) |

#### Niveaux d'efficience (vendor-summary & expensive-tools)

| Label | Coût/utilisateur/mois |
|---|---|
| `excellent` | < 5 € |
| `good` | 5 – 15 € |
| `average` | 15 – 25 € |
| `below_average` | > 25 € |

---

## Tests

```bash
npm test
```

Les tests couvrent :
- **CRUD outils** — création, lecture, mise à jour partielle, suppression, erreurs 404
- **Validation Zod** — rejet des données invalides avec messages d'erreur détaillés
- **Analytics** — précision des calculs de coûts, seuils d'efficience, comportement sans données

---

## Codes de statut

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Succès sans contenu (DELETE) |
| 400 | Données invalides (erreur de validation Zod) |
| 404 | Ressource introuvable |
| 500 | Erreur serveur interne |