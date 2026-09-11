# Ping / Pong — Front Next.js

Une mini interface Next.js / React / TypeScript pour visualiser les vrais échanges HTTP avec l’API FastAPI dans `../test_web_backend`.

Actions : ping-pong, compteur partagé, modification d’un message, relecture et réinitialisation. Le journal affiche les 12 derniers appels avec réponse JSON, statut et durée. Les erreurs réseau et les appels en cours sont affichés.

## Démarrer en local (PowerShell)

Installer Node.js 22+ et pnpm 11.19.0 (`npm install --global pnpm@11.19.0` si nécessaire), puis depuis ce dossier :

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Ouvrir http://localhost:3000 et démarrer le backend sur le port 8000 dans un autre terminal. `NEXT_PUBLIC_API_URL` vaut `http://localhost:8000` dans l’exemple. Ne pas ajouter `/api` à cette URL.

Le navigateur appelle directement Python. Il n’y a pas de proxy ni de route API Next.js intermédiaire : les requêtes apparaissent dans l’onglet Network des outils développeur du navigateur.

## Déployer sur Vercel

1. Déployer le backend sur Railway et récupérer son domaine HTTPS public (voir son README).
2. Commit puis push ce dépôt sur GitHub.
3. Dans Vercel, importer le dépôt GitHub du **frontend**. Choisir Next.js si nécessaire ; garder la racine du dépôt comme Root Directory.
   Le fichier `vercel.json` impose le framework Next.js et son dossier de sortie `.next`, même si le projet Vercel a initialement été créé avec le preset « Other » ou le dossier `public`.
4. Avant le build, ajouter `NEXT_PUBLIC_API_URL=https://TON-BACK.up.railway.app` pour l’environnement Production (et Preview si utilisé).
5. Ajouter aussi `ENABLE_EXPERIMENTAL_COREPACK=1` dans Vercel pour utiliser la version pnpm 11.19.0 indiquée par `packageManager`, puis déployer.
6. Copier l’origine du front, par exemple `https://TON-FRONT.vercel.app`, dans `ALLOWED_ORIGINS` sur Railway puis redéployer le backend.
7. Depuis le front, envoyer un ping, modifier le compteur et le message. Recharger la page pour vérifier que les valeurs viennent bien du backend.

**Après tout changement de `NEXT_PUBLIC_API_URL`, redéployer le front.** Next.js inclut cette variable dans le JavaScript au moment du build. Cette URL est publique ; ne jamais mettre un secret dans une variable `NEXT_PUBLIC_*`.

Si la variable est absente en production, l’interface affiche une erreur de configuration. Elle ne bascule pas vers localhost.

## Vérification locale

```powershell
pnpm typecheck
pnpm build
pnpm start
```

Pour tester la version de production localement, créer `.env.local` avec `.env.example` **avant** `pnpm build`.

## En cas de problème

- « API inaccessible » : vérifier `/health` sur Railway, l’URL du back, puis l’origine exacte du front dans `ALLOWED_ORIGINS`.
- Origine Preview bloquée : ajouter l’URL de cette preview dans `ALLOWED_ORIGINS` sur Railway et redéployer le back.
- Une ancienne URL est appelée : vérifier `NEXT_PUBLIC_API_URL` puis reconstruire/redéployer Vercel.
- Données revenues à zéro : comportement attendu au redémarrage du back ; elles sont en mémoire.
- Pour voir les changements d’un autre onglet, cliquer « Relire les données » ou recharger la page. La démo n’utilise pas de WebSocket.

Documentation : [Variables publiques Next.js](https://nextjs.org/docs/app/guides/environment-variables), [Variables Vercel](https://vercel.com/docs/environment-variables/framework-environment-variables), [Corepack sur Vercel](https://vercel.com/docs/builds/configure-a-build#corepack).
