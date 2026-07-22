# Roadmap Partie 1 — App `BT Secretary`

> Application terrain · chantier + bureau · iOS + Android · intelligente · à terme autonome
> Date : 2026-07-22 (post-validation `mcp-csv` v0.2)

## 0. Statut (2026-07-22 v0.2)

- [x] **Phase 0 Fondations** (juillet 2026) — mcp-comtaria v0.1, mcp-csv v0.2, mcp-acomba v0.1, PR #1 et #2 mergées sur main.
- [x] **M1.0 App socle (juillet 2026)** — scaffold BT Secretary livré : Capacitor iOS+Android configuré (`ca.comptaria.btsecretary`), shell HTML/CSS/JS (`/public/app.html` à `/public/assets/app.*`), 4 onglets (Temps · Bon trav. · Facture photo · Moi), brand Bon-Air inliné, génération CSV multi-sections + HTML print-ready côté client, smoke Playwright OK (TS: 7 jours, BT: 5 lignes totaux 2 090,00 $, CSV 700 octets), PR #3 mergée sur `comptaria.ca:main`.
- [ ] **M1.1** (sept 2026) — saisie temps + bon câblage backend `mcp-comtaria`.
- [ ] **M1.2** (oct 2026) — OCR photo **PaddleOCR 2.7+** CPU local (Apache 2.0, 100 % QC ; décision Loi 25 du 2026-07-22).
- [ ] **M1.3** (oct 2026) — dispatcher central multi-format.
- [ ] **Matrice paie v0.1 livrée** — `comptaria.ca/docs/strategy/11-paye-destinataires-v0.1.md` (PR #4). En attente de validation Magus avant tout câblage Phase 3.

— *Phase 1 = on y est. Phase 2 = non commencé.*


> Statut : **roadmap acceptée** — premier livrable cible Q4 2026
> Dépendances : `mcp-comtaria` (livré), `mcp-csv` v0.2 (livré), `mcp-acomba` v0.1 (livré)

---

## 1. Vision en une phrase

> Le **seul outil** dont un employé de chantier a besoin pour :
> 1. Saisir ou photographier son **temps** (feuille de temps).
> 2. Pointer un **bon de travail** par projet/tâche.
> 3. **Photographier** ses factures fournisseurs.
> 4. **Recevoir** automatiquement le bon document au bon format au bon destinataire.

L’app fait **80 % du travail**, l’être humain signe ce qui compte. À terme, l’agent central autonome l’envoie lui-même à la caisse.

---

## 2. Personas & jobs-to-be-done

| Persona | Contexte | Jobs à réaliser |
|---|---|---|
| **Employé chantier** | terrain, mobile 1 main, lumière variable | Pointer ses heures, photographier ses reçus, consulter ses feuilles |
| **Chargé de projet** | bureau, desktop | Valider les bons de travail, suivre l’avancement, exporter les feuilles |
| **Secrétaire / gestionnaire** | bureau, multi-clients | Recevoir, approuver, dispatch |
| **Comptable / CPA** | bureau, audit | Voir les pièces jointes, valider en lot, exporter |
| **Client** (lecture seule) | externe | Recevoir la facture client (HTML/email) |

---

## 3. Fonctionnalités cœur (MVP Partie 1)

### 3.1 Saisie temps & bon de travail
- Saisie **feuille de temps** : date, jour, heures normales + supp, projet, note.
- **Bon de travail** : projet, tâche, chantier, heures, taux, total.
- **Templates personnalisables par client** (palette + sections + champs additionnels via `templates/companies/<id>.json` + `templates/<id>.hbs`).
- **Saisie rétroactive** avec audit : « qui » « quand » « pourquoi » « avant/après ».
- Mode **dégradé** : saisie hors-ligne, synchro dès réseau retrouvé, file d’attente avec hash.
- **Multi-tenant** : un employé peut pointer sur plusieurs clients (cabinet).

### 3.2 Capture photo des factures
- **Prise photo** (caméra native ou HTML web wrapper via Capacitor).
- **Recadrage automatique** (perspective, contraste).
- **OCR** via **PaddleOCR 2.7+** (lib CPU locale, Apache 2.0 — **aucun LLM cloud**, décision Loi 25 du 2026-07-22) avec :
  - Score de confiance par champ.
  - **Validation humaine obligatoire** sur les champs à score < seuil.
  - Conservation image originale (immuable) + version normalisée + diff.
- Sortie = **CSV structuré multi-sections** (entête / fournisseur / lignes / totaux / taxes) → injecté dans `mcp-csv` via `csv_structured_render` puis importé dans la DB Cabinet.

### 3.3 Génération des pièces (HTML/SVG brandé)
- Outil MCP `csv_render_visual` (livré) → **HTML print-ready brandé entreprise**.
- L’app choisit le format de sortie par destinataire :

| Destinataire | Format | Pourquoi |
|---|---|---|
| Employé (mail/sms) | HTML (léger, ouvrable) | confirmations + accès rapide |
| Chargé de projet | HTML + bouton « Imprimer / PDF » | impression A4 native |
| Cabinet comptable | CSV multi-sections | ré-import direct |
| Client (facture) | HTML brandé (et PDF si demand implicitement) | signature |
| Caissier / système | CSV simple (1 ligne / paiement) | intégration |

### 3.4 Intelligence embarquée
- **LLM embarqué côté serveur** (par l’intermédiaire de `mcp-csv` + futur `mcp-llm`).
- L’app **suggère** les totaux, les correspondances projet/tâche, les libellés manquants — l’être humain **confirme**.
- **Pas d’OCR validé en paie sans approbation humaine** (règle dure, conforme aux principes Acomba).
- **Chatbot interne** à déterminer (Plus tard — v0.2 ou v0.3) ; scope MVP : « poser une question sur ma feuille ».

---

## 4. Architecture cible Partie 1

### 4.1 Schéma simplifié

```
┌────────────────────────────────────────────────┐
│  App mobile (Capacitor / PWA)                  │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Saisie temps│  │ Bon trav │  │ Photo OCR│   │
│  └─────────────┘  └──────────┘  └──────────┘   │
│  ┌──────────────────────────────────────────┐  │
│  │ File offline + sync LWW                    │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬─────────────────────────────┘
                   │ HTTPS (chiffré bout-en-bout)
                   ▼
┌────────────────────────────────────────────────┐
│  Edge API (Node + Hono/Fastify)                │
│  - auth (cabinets employés, MFA)                │
│  - dispatch (routing vers bons destinataires)  │
│  - envelope OCR **PaddleOCR CPU** (pas de LLM cloud)  │
│  - audit append-only Loi 25                     │
└──────────────────┬─────────────────────────────┘
                   │
   ┌───────────────┼──────────────────┐
   ▼               ▼                  ▼
┌────────────┐ ┌──────────────┐ ┌─────────────┐
│ mcp-comtaria│ │ mcp-csv      │ │ mcp-acomba   │
│ (livré)    │ │ v0.2 (livré) │ │ v0.1 (livré) │
│ - DB       │ │ - import CSV │ │ - wrapper    │
│ - audit    │ │ - export CSV │ │ - sync       │
│ - schéma   │ │ - templates  │ │ - tests      │
│            │ │ - brand      │ │ - rollback   │
└────────────┘ └──────────────┘ └─────────────┘
                   ▼
       ┌──────────────────────┐
       │ Postgres + pgvector  │
       │ (Québec / OVHcloud)  │
       └──────────────────────┘
```

### 4.2 Dispatching central (nouveau)

Cœur de la Partie 1 — l’agent **dispatcher** :
- Reçoit un événement (`time_entry.created`, `bon_travail.approved`, `invoice.received`).
- Applique une **matrice de routage** par cabinet/client/rôle.
- Choisit le **format de sortie** (CSV/HTML) selon la personne.
- **À terme** : déclenche l’**envoi autonome** aux caisses / systèmes externes.

Matrice minimale pour la v0.1 :

| Événement | Rôle | Format | Destination |
|---|---|---|---|
| `time_entry.validated` | employé | HTML | in-app + email |
| `time_entry.approved` | comptable cabinet | CSV | inbox cabinet |
| `bon_travail.approved` | chargé de projet | HTML | email + app web |
| `facture.received` | comptable cabinet | CSV + image | inbox cabinet |
| `facture.approved` | client | HTML | email client |
| `paiement.due` | caissier | CSV simple | inbox caissier *(v0.2)* |

### 4.3 Choix techniques
- **App mobile** : **Capacitor** (wrapper HTML → APK + IPA). Permet d’éviter 100 % natif, garde un seul codebase Web.
- **Stack frontend** : TypeScript + Vite + composants existants (HTML brandé).
- **Edge API** : Node 22 + Hono + Postgres + pgvector (déjà chez Comptaria).
- **OCR** : **PaddleOCR 2.7+** CPU local (Apache 2.0, modèles `french_ppocr-onnx` ; 100 % QC).
- **Stockage photo** : S3-compatible (OVHcloud Storage) + chiffrement côté serveur.

---

## 5. Sécurité, vie privée, Loi 25

- **Photo originale** conservée 30 jours (audite trail), dérivée normalisée conservée 7 ans (obligation comptable QC par défaut — **à valider avec avocat fiscaliste** avant figeage).
- **Chiffrement au repos** : photos en AES-256, clés gérées par cabinet.
- **Localisation** : hébergement **Québec obligatoire** pour données clients. Aucun sous-traitant hors QC par défaut — signale tout dépassement.
- **Droit à l’oubli** : suppression user → cascade, log, conservation justifiée explicite.
- **Audit** : append-only log + revue périodique.
- **Conformité** : revue juridique Loyer 25 avant production — **non bloquant tant qu’elle n’a pas eu lieu, bloquant à partir du MVP déployé**.

---

## 6. Plan de livraison

### Phase 0 — Fondations (juil 2026) ✅ FAIT
- [x] `mcp-comtaria` v0.1 (9 outils DB schema)
- [x] `mcp-csv` v0.1 + v0.2 (13 + 6 outils DB + brand + structured)
- [x] `mcp-acomba` v0.1 (8 outils wrapper + tests anonymisés)
- [x] 71 + 37 tests passants cumulés
- [x] PR #1, #2 sur `comptaria-mcp-servers` (à finaliser : PR v0.2 brand/structured)

### Phase 1 — App terrain MVP (août → oct 2026)
- [ ] App Capacitor scaffold (iOS + Android cibles test)
- [ ] **Saisie feuille de temps** offline + sync
- [ ] **Saisie bon de travail** + templates client
- [ ] **OCR photo** des factures (**PaddleOCR 2.7+ CPU local**, Apache 2.0 ; 100 % QC, pas de LLM cloud — décision Loi 25 du 2026-07-22)
- [ ] **Validation humaine** sur tous champs < seuil
- [ ] **Dispatching central** (matrice v0.1)
- [ ] **Pièces HTML brandé** (CSV → HTML via `csv_render_visual`)
- [ ] **Pièces CSV** (cabinet) via `csv_render_visual` + csv simple
- [ ] **Audit Loi 25** appended à la stack (déjà en place côté MCP)
- [ ] **5 employés pilotes Air Liquide**, 1 cabinet comptable interne

### Phase 2 — Intelligence + clients (nov → déc 2026)
- [ ] **Chatbot interne** (« ma feuille est correcte ? »)
- [ ] **LLM suggestions** sur les libellés
- [ ] **Détection automatique des doublons**
- [ ] **Templates personnalisables par client** depuis UI
- [ ] **Multi-cabinets** production
- [ ] **Pilote client facturation** (réception HTML brandé)

### Phase 3 — Paiée autonome (Q1 2027)
- [ ] Intégration **caisse / ADP / Desjardins** par API
- [ ] **Envoi autonome** par l’agent dispatcher
- [ ] **Validation CPA** finale (1 clic par fichier de paie)
- [ ] **Historique avant/après** immuable

### Phase 4 — Marché public (Q2 2027)
- [ ] Distribution `.apk` hors debug pour tests bêta
- [ ] Distribution TestFlight (`.ipa`) pour tests bêta
- [ ] App stores (Google Play, App Store)
- [ ] Pricing transparent + onboarding cabinet

---

## 7. Jalons de la Partie 1

| Jalon | Statut | Date cible | Sortie / critère |
|---|---|---|---|
| **M1.0** App terrain socle | ✅ livré (2026-07-22) | juillet 2026 | Capacitor scaffold + shell 4 onglets + smoke Playwright OK |
| **M1.1** Saisie temps + bon + sync backend | ⏳ à faire | sept 2026 | employé chantier pointe + synchronise via mcp-comtaria |
| **M1.2** OCR photo + dispatch | ⏳ à faire | oct 2026 | photo facture → CSV valide → bonne boîte, bon format (**PaddleOCR 2.7+**, lib CPU Loi 25 first) |
| **M1.3** HTML brandé serveur | ⏳ à faire | oct 2026 | pièces générées côté serveur par mcp-csv v0.2 |
| **M1.4** Pilote 5 employés | ⏳ à faire | nov 2026 | vraies feuilles de 5 employés Air Liquide |
| **M1.5** Production cabinet interne | ⏳ à faire | déc 2026 | 1 cabinet comptable onboardé |
| **M2.0** Chatbot (post-Partie 1) | ⏳ à faire | Q1 2027 | interaction conversationnelle minimale |

---

## 8. Risques et dépendances

| Risque | Vraisemblance | Mitigation |
|---|---|---|
| Validation juridique Loi 25 négligée | moyen | **bloquant** avant production, signup « compliance officer » dès M1.4 |
| OCR validé en paie (risque exemplaire Air Liquide) | faible | règle dure « pas de paie sans validation humaine explicite » + audit 100 % |
| Push Apple TestFlight complexe | faible | preflight Apple Developer Program startup, canaux progressifs |
| Photos PII hors Québec (cloud US accidental) | moyen | scanner config cloud + journalisation localisation photo |
| Adoption employé terrain (résistance au tech) | moyen | UX minimal + bouton unique « pointer » + formation 30 min |
| Coût VPS CPU pour PaddleOCR (chiffrement, RAM modèle) | faible | benchmark avant M1.2, modèles sur CPU pas cher |

---

## 9. Ce qui n’est PAS dans la Partie 1 (mais à cadrer)

- **Comptabilité courante** (transactions bancaires,conciliation, écritures comptables) → Partie 3+.
- **Paiement direct** aux employés → hors Partie 1, mais anticipé Partie 3.
- **Multi-langue** (FR-CA prioritaire, EN-CA Q1 2027) → gestion i18n à intégrer dès MVP.
- **Reconnaissance faciale** → à **ne pas faire** (biométrie, dérive, Loi 25 charge trop lourde, trivialité du gain terrain).

---

## 10. Prochaine étape immédiate

1. Valider cette roadmap (ok avec toi).
2. Créer la **branche `feat/app-bt-secretary-v0`** dans `comptaria.ca` (app mobile).
3. **Capacitor scaffold** + screen flow employé temps/bon/photo.
4. Réutilisation intensive de `mcp-csv` v0.2 + `mcp-comtaria` v0.1 (livré).
5. Premier démo interne fin septembre 2026.

— *Fin de la roadmap Partie 1*
