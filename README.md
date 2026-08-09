# Plateforme de Conception d'Architecture Réseau

Application web permettant de construire graphiquement une infrastructure informatique réseau et système avant son déploiement réel.

## 🏗 Architecture du Projet

Le projet adopte une architecture client-serveur moderne :
- **Frontend** (`/frontend`) : Application React propulsée par Vite, utilisant **TailwindCSS** pour le style, **React Flow** pour l'éditeur graphique de graphe, et **Zustand** pour la gestion de l'état.
- **Backend** (`/backend`) : API REST robuste développée avec **NestJS**, utilisant **Prisma** comme ORM pour communiquer avec la base de données.
- **Base de données** : **PostgreSQL**, déployable localement via Docker.

## ⚙️ Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour lancer la base de données)

## 🚀 Installation et Lancement

Suivez ces étapes pour lancer le projet en local sur votre machine.

### 1. Démarrer la Base de Données

Un fichier `docker-compose.yml` est fourni à la racine. Il lance un conteneur PostgreSQL configuré pour le projet.

```bash
docker-compose up -d
```

### 2. Configurer et Lancer le Backend

Le backend gère l'API et la persistance des schémas d'architecture.

```bash
cd backend
npm install

# Synchroniser le schéma Prisma avec la base de données
npx prisma db push

# Lancer le serveur backend (accessible sur http://localhost:3000)
npm run start:dev
```

### 3. Configurer et Lancer le Frontend

Le frontend contient l'éditeur graphique de l'architecture.

```bash
cd frontend
npm install

# Lancer le serveur de développement Vite
npm run dev
```

Une fois les trois services en cours d'exécution, ouvrez votre navigateur et accédez à l'interface via l'adresse locale fournie par Vite (généralement **http://localhost:5173**).

## 💡 Fonctionnalités (MVP)

- Interface avec tableau de bord des projets.
- Éditeur visuel interactif basé sur un canvas (React Flow).
- Glisser-déposer (Drag & Drop) d'équipements depuis un catalogue.
- Création de connexions physiques entre les appareils.
- Édition des propriétés des équipements (IP, VLAN, Nom).
- Persistance automatique des architectures en base de données.
