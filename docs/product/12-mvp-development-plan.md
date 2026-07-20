# 12 — PLAN DE CODAGE : MVP COMPTA_HARNESS

> **Objectif :** Un MVP fonctionnel en 6 semaines qui démontre
> l'extraction, la réconciliation multi-agents et les écritures récurrentes.
> Démoisable en 5 min à un cabinet ou investisseur.
>
> **Budget :** 0$ (infra existante : 192.168.40.9)
> **Stack :** TypeScript / Node.js / Python (réutilise l'expertise Overmind)
> **Leverage :** Overmind existant + GLM 5.2 auto-hébergé + PostgreSQL

---

## ARCHITECTURE DU MVP

```
                    ┌─────────────────────┐
                    │   DASHBOARD REACT    │
                    │  (factures, écritures)│
                    └──────────┬──────────┘
                               │ WebSocket
                               │
┌──────────┐         ┌────────▼──────────────────┐         ┌──────────┐
│ Document │────────►│    COMPTA_HARNESS CORE     │────────►│ Audit    │
│ Upload   │  msg    │                            │  trail   │ Trail    │
└──────────┘         │  ┌─────────────────────┐   │         │ (PG)     │
                     │  │ 1. Extraction Agent │   │         └──────────┘
                     │  │ 2. Catégorisation   │   │
                     │  │ 3. Réconciliation   │   │
                     │  │ 4. Écritures Auto   │   │
                     │  └─────────────────────┘   │
                     │         ↕                  │
                     │  ┌─────────────────────┐   │
                     │  │ GLM 5.2 (Montréal)  │   │
                     │  │ localhost:8080      │   │
                     │  └─────────────────────┘   │
                     └────────────────────────────┘
```

---

## LES 7 COMPOSANTS À CODER

### Composant 1 : Document Ingestion (sem 1, jour 1-2)

```
Reçoit les documents du cabinet (factures, reçus, relevés).

Input  : PDF, image, email (multipart upload)
Output : Document structuré en DB

Logique :
  1. Receive file (PDF/PNG/JPG)
  2. OCR si image (Tesseract ou GLM vision)
  3. Parse structure (lignes, totaux, taxes)
  4. Store in PostgreSQL (raw + parsed)
  5. Emit event "document_ready" → Extraction Agent

Code minimal :

  ingestion.ts
  ├── uploadDocument(file): DocumentId
  ├── parsePDF(pdf): ParsedDocument
  ├── extractText(image): string  // OCR
  └── storeDocument(doc): void

Tables PostgreSQL :
  CREATE TABLE documents (
    id UUID PRIMARY KEY,
    cabinet_id UUID NOT NULL,
    type VARCHAR(50),        -- 'invoice', 'receipt', 'bank_statement'
    raw_data BYTEA,
    parsed_data JSONB,
    status VARCHAR(20),      -- 'pending', 'extracted', 'reconciled'
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
```

### Composant 2 : Extraction Agent (sem 1, jour 3-4)

```
Lit un document et extrait les données comptables par IA.

Input  : Document (parsed text ou image)
Output : ExtractionResult (fournisseur, montant, taxes, lignes)

Logique :
  1. Charge le document depuis PostgreSQL
  2. Construit un prompt GLM 5.2 avec le contenu
  3. GLM extrait : fournisseur, date, montant_total, TPS, TVQ, lignes
  4. Valide la cohérence (somme des lignes = total)
  5. Store result en DB

Prompt GLM 5.2 (exemple) :
  "Tu es un agent comptable québécois. Extrais les données de cette facture.
   Retourne JSON avec : fournisseur, date, montant_ht, tps (5%), tvq (9.975%),
   montant_ttc, lignes[] (description, quantité, prix_unitaire, total).
   Si taxes incluses, calcule le HT."

Code minimal :

  extraction-agent.ts
  ├── extractData(doc): Promise<ExtractionResult>
  ├── callGLM(prompt, doc): Promise<string>
  ├── validateExtraction(result): boolean
  └── storeExtraction(doc_id, result): void
```

### Composant 3 : Catégorisation Agent (sem 1, jour 5 - sem 2, jour 2)

```
Assigne chaque ligne au bon compte du plan comptable du cabinet.

Input  : ExtractionResult (lignes)
Output : CategorizedLines (compte, description, montant)

Logique :
  1. Charge le plan comptable du cabinet depuis DB
  2. Pour chaque ligne : GLM 5.2 propose un compte
  3. Si confiance < 80% → flag pour révision CPA
  4. Si confiance > 80% → auto-catégorisé
  5. Le cabinet peut ajuster (apprentissage)

Plan comptable QC par défaut :
  1000 - Actifs
  2000 - Passifs
  3000 - Capitaux propres
  4000 - Produits
  5000 - Coûts (achats, sous-traitance)
  6000 - Frais (loyer, salaires, utilities)
  7000 - Frais administratifs
  8000 - Autres

Code minimal :

  categorization-agent.ts
  ├── categorize(lines, planCompta): Promise<CategorizedLine[]>
  ├── learnFromCorrection(line, correctAccount): void
  └── getConfidence(line, account): number
```

### Composant 4 : Réconciliation Agent (sem 2, jour 3-5)

```
Apparie factures avec relevés bancaires et bons de commande.

Input  : Factures + Relevés bancaires (même période)
Output : ReconciliationResult (matched, unmatched, écarts)

Logique :
  1. Pour chaque transaction bancaire :
     a. Cherche facture correspondante (montant ±5%, date ±3j)
     b. Si match → réconcilié ✓
     c. Si pas de match → écart potentiel
  2. Pour chaque facture sans transaction :
     a. Facture impayée ? → relance
     b. Paiement en attente ? → suivi
  3. Génère rapport d'écarts

Code minimal :

  reconciliation-agent.ts
  ├── reconcile(invoices, bankTransactions): ReconciliationResult
  ├── findMatch(transaction, invoices): InvoiceMatch | null
  ├── detectAnomalies(unmatched): Anomaly[]
  └── generateReport(result): ReconciliationReport
```

### Composant 5 : Écritures Récurrentes (sem 3, jour 1-3)

```
Génère les écritures périodiques automatiquement.

Input  : Calendrier fiscal + données cabinet (salaires, loyers, amortissements)
Output : Écritures comptables générées

Logique :
  1. Amortissements linéaires/dégressifs
  2. Salaires + charges sociales (DAS, RQAP, RRQ)
  3. Loyer, assurances, abonnements
  4. Déclarations TPS/TVQ (mensuel/trimestriel)
  5. Calendrier fiscal QC (échéances automatiques)

Code minimal :

  recurring-entries.ts
  ├── generateAmortization(asset): JournalEntry[]
  ├── generatePayroll(emp, period): JournalEntry[]
  ├── generateTaxReturn(period): TaxReturn
  └── getFiscalCalendar(year): FiscalEvent[]
```

### Composant 6 : Audit Trail Loi 25 (sem 3, jour 3-4)

```
Chaque décision IA est tracée pour conformité Loi 25 art. 12.1.

Structure :

  audit-trail.ts
  interface AuditEntry {
    id: string;
    timestamp: string;
    hash: string;            // SHA-256(previous_hash + content)
    previousHash: string;

    decision: {
      agentName: string;     // "extraction-agent"
      action: string;        // "extract", "categorize", "reconcile"
      documentId: string;
      result: any;
      confidence: number;
    };

    compliance: {
      loi25Article: string;  // "Art. 12.1"
      dataLocation: string;  // "Montréal, QC"
      modelUsed: string;     // "GLM 5.2"
    };
  }

Table PostgreSQL :
  CREATE TABLE audit_trail (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    previous_hash VARCHAR(64) NOT NULL,
    decision JSONB NOT NULL,
    compliance JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp);
```

### Composant 7 : Dashboard React (sem 3, jour 4 - sem 4)

```
Simple mais impressionnant. 4 vues :

dashboard/src/
├── views/
│   ├── DocumentUpload.tsx     → Upload drag & drop + OCR en temps réel
│   ├── ExtractionReview.tsx   → Réviser les extractions (confiance < 80%)
│   ├── Reconciliation.tsx      → Table factures ↔ transactions
│   └── FiscalCalendar.tsx     → Calendrier fiscal QC + alertes échéances
│
└── components/
    ├── ConfidenceBadge.tsx    → Vert (>80%) / Jaune (60-80%) / Rouge (<60%)
    ├── TaxBreakdown.tsx       → TPS/TVQ/HT visuel
    └── AuditTrailViewer.tsx   → Historique des décisions IA (Loi 25)

Design :
  → Dark theme (professionnel compta)
  → Temps réel (WebSocket)
  → Couleurs QC (bleu/blanc, sobre)
```

---

## SCÉNARIO DE DÉMO (5 minutes)

```
DÉMO FLOW :

  1. Upload d'un lot de 20 factures (PDF mixtes)
     → Dashboard montre : extraction en cours
     → GLM 5.2 traite en parallèle
     → Chaque facture : fournisseur, montant, TPS/TVQ extraits
     → 20/20 extraites en 45 secondes

  2. Réviser les catégorisations
     → 17/20 auto-catégorisées (confiance > 80%)
     → 3/20 flaggées pour révision CPA
     → Le CPA ajuste 1 ligne → l'IA apprend

  3. Réconciliation bancaire
     → Import du relevé bancaire du mois
     → 18/20 factures réconciliées automatiquement
     → 2 écarts détectés (montants différents) → alerte

  4. Écritures récurrentes
     → Génération automatique des amortissements du mois
     → Salaires + charges sociales (DAS, RRQ, RQAP)
     → Écritures prêtes pour révision CPA

  5. Audit trail Loi 25
     → Chaque décision tracée (qui, quoi, quand, pourquoi)
     → Hash chain vérifiable
     → Export PDF pour inspecteur

  6. Calendrier fiscal QC
     → Prochaine échéance TPS/TVQ dans 12 jours
     → DAS le 15 du mois
     → Alertes automatiques

C'EST ÇA QU'ON MONTRE AU CABINET ET À INVEST-AI.
```

---

## STRUCTURE DES FICHIERS

```
compta_harness/
│
├── package.json
├── tsconfig.json
├── docker-compose.yml          → PostgreSQL + GLM 5.2
│
├── src/
│   ├── core/
│   │   ├── ingestion.ts        → Composant 1
│   │   ├── extraction-agent.ts → Composant 2
│   │   ├── categorization-agent.ts → Composant 3
│   │   ├── reconciliation-agent.ts → Composant 4
│   │   ├── recurring-entries.ts    → Composant 5
│   │   └── audit-trail.ts      → Composant 6
│   │
│   ├── api/
│   │   ├── server.ts           → Express + WebSocket
│   │   └── routes.ts           → REST endpoints
│   │
│   ├── db/
│   │   ├── schema.sql          → Tables (documents, audit_trail, etc.)
│   │   └── migrate.ts
│   │
│   └── fiscal/
│       ├── qc-calendar.ts      → Calendrier fiscal QC
│       └── tax-rates.ts        → TPS 5%, TVQ 9.975%
│
└── dashboard/
    ├── package.json
    └── src/
        ├── App.tsx
        ├── views/
        │   ├── DocumentUpload.tsx
        │   ├── ExtractionReview.tsx
        │   ├── Reconciliation.tsx
        │   └── FiscalCalendar.tsx
        └── components/
            ├── ConfidenceBadge.tsx
            ├── TaxBreakdown.tsx
            └── AuditTrailViewer.tsx
```

---

## CALENDRIER — 6 SEMAINES

### Semaine 1 — Core Engine

```
Jour 1 : Setup + Ingestion
  → Init projet TypeScript
  → Docker compose (PostgreSQL)
  → Schema DB
  → ingestion.ts (upload PDF/image)

Jour 2 : Extraction Agent
  → Connexion GLM 5.2 (localhost:8080)
  → extraction-agent.ts
  → Tests sur factures réelles

Jour 3-4 : Catégorisation
  → Plan comptable QC par défaut
  → categorization-agent.ts
  → Tests + ajustements prompt GLM

Jour 5 : Réconciliation basique
  → reconciliation-agent.ts
  → Appariement simple (montant + date)
```

### Semaine 2 — Réconciliation avancée

```
Jour 1-2 : Réconciliation multi-critères
  → Tolérances (montant ±5%, date ±3j)
  → Détection d'écarts
  → Rapport de réconciliation

Jour 3-5 : Écritures récurrentes
  → Amortissements
  → Calendrier fiscal QC
  → Tests sur cas réels
```

### Semaine 3 — Audit Trail + API

```
Jour 1-2 : Audit Trail
  → audit-trail.ts (hash chain)
  → Tables PostgreSQL
  → Vérification intégrité

Jour 3-5 : API REST + WebSocket
  → server.ts (Express)
  → routes.ts (endpoints)
  → WebSocket pour temps réel
```

### Semaine 4-5 — Dashboard React

```
Jour 1-5 : Dashboard
  → 4 vues principales
  → Upload, Extraction Review, Reconciliation, Fiscal Calendar
  → Dark theme professionnel
```

### Semaine 6 — Tests + Démo

```
Jour 1-3 : Tests bout-en-bout
  → Scénario complet avec 50 factures réelles
  → Performance (vitesse d'extraction)
  → Accuracy (taux de bonne catégorisation)

Jour 4-5 : Démo vidéo + polishing
  → Enregistrer la démo 5 min
  → Optimiser les prompts GLM
  → Préparer le pitch cabinet
```

---

## LEVERAGE EXISTANT

```
CE QU'ON A DÉJÀ :
  ✅ Serveur Ubuntu 192.168.40.9 (Montréal)
  ✅ PostgreSQL installé et configuré
  ✅ Nginx + site comptaria.ca live
  ✅ Overmind pour orchestration multi-agents
  ✅ Agent Striker pour monitoring + ops
  ✅ GLM 5.2 accessible via API

CE QU'IL MANQUE :
  ❌ Code compta_harness (le MVP)
  ❌ Dashboard React
  ❌ Prompts GLM spécialisés compta QC
  ❌ Plan comptable QC par défaut
  ❌ Calendrier fiscal QC programmé
```

---

## LES 3 CHOSES QUI DOIVENT MARCHER POUR LA DÉMO

```
1. EXTRACTION — GLM 5.2 lit une facture et extrait TPS/TVQ correctement
2. RÉCONCILIATION — 20 factures réconciliées avec un relevé bancaire en < 1 min
3. AUDIT TRAIL — Chaque décision est tracée et vérifiable (Loi 25)

Si ces 3 marchent, on a un produit vendable.
Le reste (dashboard fancy, écritures complexes) c'est bonus.
```
