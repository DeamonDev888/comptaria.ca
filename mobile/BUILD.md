# BT Secretary — Build & Deploy

Application mobile terrain (iOS + Android), wrapper HTML5 de la plateforme Comptaria.

## Phase M1.0 livrée (2026-07-22)

### Ce qui est livré

- **Scaffold Capacitor** (`mobile/`) :
  - App ID : `ca.comptaria.btsecretary`
  - Plateformes Android + iOS ajoutées.
  - 5 plugins natifs câblés : `camera`, `filesystem`, `network`, `preferences`, `share`.
- **Wrapper HTML/CSS/JS** (`public/app.html`, `public/assets/app.css`, `public/assets/app.js`) :
  - 4 onglets : Temps · Bon de travail · Facture photo · Moi.
  - Persistance localStorage (mode dégradé offline-first).
  - Génération CSV multi-sections (sections `# section: entete|client|projet|lignes|totaux|notes|signatures`).
  - Génération HTML print-ready A4 brandé (logo, raison sociale, NEQ, palette).
  - Hash SHA-256 + footer Loi 25 sur chaque pièce générée.
  - Sync indicator offline/online (event listeners `online`/`offline`).
- **Branche Git** : `feat/app-bt-secretary-v0-scaffold` (à merger dans `main` après validation).

### Smoke test (passé ✓)

```text
TIME (1): 7 day cards, "semaine 30/2026"
TIME (2): same after input change — localStorage persistance OK
TS_MSG:  "Feuille envoyée: 1 jours pointés, 8 h totales. Réception cabinet < 5s."
BT (1):   numero=BT-2026-0001, date=2026-07-21, client=Construction Rive-Nord,
          5 lignes, total 22 h × 95 $ = 2 090,00 $
CSV multi-sections généré (700 octets) :
  # section: entete | client | projet | lignes | totaux | notes
  5 lignes de chantier cohérentes
ERR: [] (no JS console errors)
```

## Architecture cible

```
┌──────────────────────────────────────────────┐
│  App mobile (Capacitor)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │ Temps    │ │ Bon trav │ │ Facture photo │    │
│  └──────────┘ └──────────┘ └──────────────┘    │
│  ┌───────────────────────────────────────┐    │
│  │ localStorage + offline queue          │    │
│  └───────────────────────────────────────┘    │
└─────────────────┬────────────────────────────┘
                  │ HTTPS (chiffré bout-en-bout)
                  ▼
┌──────────────────────────────────────────────┐
│  Edge API (Node + Hono + Postgres)            │
└─────────────────┬────────────────────────────┘
   ┌───────────────┼──────────────────┐
   ▼               ▼                  ▼
┌──────────┐  ┌────────────┐  ┌────────────┐
│mcp-      │  │mcp-csv      │  │mcp-acomba   │
│comtaria  │  │v0.2 (livré) │  │v0.1 (livré) │
└──────────┘  └────────────┘  └────────────┘
                  ▼
       ┌──────────────────────┐
       │ Postgres + pgvector  │
       │ (Québec / OVHcloud)  │
       └──────────────────────┘
```

## Build Android (à faire par CI / Mac)

```bash
# Préalables : Java 17, Android SDK + ANDROID_HOME, Node 22
cd /var/www/comptaria.ca/mobile
npm install
npx cap sync android    # copie ../public vers android/app/src/main/assets/public
cd android
./gradlew assembleDebug  # produit android/app/build/outputs/apk/debug/app-debug.apk
```

L'APK peut être installé sur une tablette ou un téléphone Android de chantier (caméra requise). En attendant une étape de production :

```bash
./gradlew bundleRelease      # produit un AAB pour Google Play
```

## Build iOS (à faire par Mac)

```bash
# Préalables : macOS + Xcode (App Store Connect configuré).
cd /var/www/comptaria.ca/mobile
npx cap sync ios
npx cap open ios   # ouvre Xcode
# Configurer l'équipe (Signing & Capabilities), distribution interne TestFlight ou ad-hoc.
```

## Roadmap app (rappel)

- **M1.0** (juillet 2026) — scaffold + smoke ✓
- **M1.1** (sept 2026) — saisie temps + bon avec backend réel
- **M1.2** (oct 2026) — OCR photo LLM (Qwen-VL)
- **M1.3** (oct 2026) — dispatching multi-format
- **M1.4** (nov 2026) — pièces HTML brandé serveur (`mcp-csv v0.2`)
- **M1.5** (déc 2026) — pilote 5 employés Air Liquide

## Limites connues

- Cacul local des pièces HTML/CSV (côté client) ; câblage serveur `mcp-csv` en M1.4.
- Pas encore de plugin caméra activé dans le wrapper (M1.2).
- Pas d'auth OIDC — démo monocomptact (M1.1).

## Sécurité

- Données stockées en `localStorage` (sandbox navigateur). Vrai offline queue = IndexedDB + Service Worker (M1.1).
- Pas de backend exposé ; aucune donnée sort vers un serveur non contrôlé par Comptaria (CSP par défaut).
- Logos placeholder (initiales Bon-Air / Comptaria). Logo client à fournir via `templates/companies/<id>.logo.png`.

## Liens

- Roadmap complète : `docs/strategy/10-bt-secretary-app-v0.1-roadmap.md` (racine du monorepo).
- Roadmap technique : `docs/strategy/08-technical-roadmap-2026-07-21.md`.
- PR mcp-csv v0.2 mergée : https://github.com/DeamonDev888/comptaria-mcp-servers/pull/2
