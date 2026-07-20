# 01 — VISION ET POSITIONNEMENT

## L'ÉLEVATOR PITCH

> **Comptaria orchestre des agents IA souverains pour cabinets comptables
> et PME au Québec. compta_harness fait 80% du travail — le CPA signe
> les 20% qui comptent. 100% Québec. Conforme Loi 25.**

---

## L'IDENTITÉ

### ❌ Ce qu'on n'est PAS

```
PAS un wrapper ChatGPT pour compta      → Pas défendable, données US
PAS un logiciel comptable classique      → Accompa/Acomba le font déjà
PAS un outil de "catégorisation simple"  → Feature, pas produit
PAS une agence d'automatisation IA       → Commodity, saturé
```

### ✅ Ce qu'on EST

```
Une plateforme d'orchestration IA souveraine pour la comptabilité QC.
Le seul produit au Québec qui :
  (a) FAIT le travail compta (extraction, réconciliation, écritures)
  (b) GARANTIT la souveraineté (100% Québec, Loi 25 conforme)
  (c) TRACE chaque décision (audit trail fiscal)

Bâti sur :
  → compta_harness : moteur multi-agents autonome pour la compta
  → GLM 5.2 open-source auto-hébergé (pas de données aux US)
  → Calendrier fiscal QC natif (TPS/TVQ/DAS/relevé 1)
```

---

## POURQUOI MAINTENANT ?

```
2023-2025 : Adoption massive de l'IA en entreprise
  → Les CPA veulent automatiser MAIS ne font pas confiance aux outils US
  → ChatGPT ne connaît pas la fiscalité québécoise
  → Les logiciels classiques (Acomba, Accompa) n'intègrent pas d'IA

2022-2025 : Loi 25 (Québec) en vigueur progressive
  → Art. 12.1 : traçabilité des décisions automatiques (EN VIGUEUR)
  → Obligation de protéger les données perso au Québec
  → Pénalités jusqu'à 25M$ ou 4% du CA mondial
  → Un cabinet qui envoie ses données fiscales aux US = en violation

2025-2026 : Maturité des modèles open-source
  → GLM 5.2, Llama 3, DeepSeek : niveau GPT-4 mais auto-hébergeables
  → Le coût d'auto-hébergement devient viable pour PME
  → Comptaria arrive EXACTEMENT au bon moment

RÉSULTAT :
  → Les cabinets QC sont coincés entre "je veux de l'IA" et "je ne peux pas utiliser les outils US"
  → Comptaria est le SEUL pont entre ces deux besoins
```

---

## LES 3 MODULES DU PRODUIT

### MODULE 1 — EXTRACTION INTELLIGENTE

```
CE QUE ÇA FAIT :
  Lit et comprend les documents comptables par IA.

COMMENT :
  1. Upload factures, reçus, relevés bancaires (PDF, image, email)
  2. Agent IA extrait : fournisseur, montant, date, taxes
  3. Catégorisation automatique selon le plan comptable du cabinet
  4. Détection TPS/TVQ et codes fiscaux QC

DIFFÉRENCIATEUR :
  → Connaît la fiscalité QC (pas un modèle US générique)
  → Apprend le plan comptable du cabinet (pas un standard figé)
  → Traite les formats québécois (Relevé 1, T4, DAS)
```

### MODULE 2 — RÉCONCILIATION AUTOMNE (compta_harness)

```
CE QUE ÇA FAIT :
  Réconcilie automatiquement factures, relevés et bons de commande.

COMMENT :
  1. compta_harness = moteur multi-agents autonome
     → Agent Extraction (lit les documents)
     → Agent Catégorisation (assigne les comptes)
     → Agent Réconciliation (apparie factures ↔ relevés)
     → Agent Écart (détecte les anomalies)
  2. Apprentissage continu des patterns du cabinet
  3. Détection d'écarts en temps réel + alerte

DIFFÉRENCIATEUR :
  → Multi-agents (pas un monolythe) = chaque tâche optimisée
  → Persistant et auditable = chaque décision tracée (Loi 25)
  → Calendrier fiscal QC natif (DAS, TPS/TVQ, relevé 1)
```

### MODULE 3 — ÉCRITURES RÉCURRENTES

```
CE QUE ÇA FAIT :
  Génère automatiquement les écritures périodiques.

COMMENT :
  1. Amortissements (linéaire, dégressif, fiscal QC)
  2. Salaires et charges sociales (DAS, RQAP, RRQ)
  3. Loyer, assurances, abonnements
  4. Déclarations fiscales (TPS/TVQ mensuelles/trimestrielles)

DIFFÉRENCIATEUR :
  → Le CPA révise et signe — l'IA fait 80% du travail
  → Calendrier fiscal QC intégré (échéances automatiques)
  → Historique auditable (pour CRA et Revenu Québec)
```

---

## LE MODÈLE D'AFFAIRES

```
MODÈLE SaaS + PILOTE :

Pilote (4 semaines) :     Gratuit ou 2-5K$
  → Installation chez le cabinet
  → Configuration des agents IA
  → Premier mois de réconciliation automatisée
  → Formation de l'équipe

Licence SaaS :            3 tiers
  → Solo (1-2 CPA) :       500$/mois  — extraction + écritures
  → Cabinet (3-10) :       1 500$/mois — full compta_harness + calendrier fiscal
  → Enterprise (10+) :     3 000$/mois — multi-tenant + API + support dédié
  → Réaliste : panier moyen 1 500$/mois (18K$/an)

Setup/Onboarding :        5-15K$ (one-time)
  → Audit des systèmes existants
  → Migration des données
  → Configuration du plan comptable
  → Formation équipe (2 sessions)

Consulting :              150-200$/h
  → Audit Loi 25 du cabinet
  → Optimisation fiscale IA
  → Formation avancée
```

---

## L'ARCHITECTURE COMPLÈTE

```
┌─────────────────────────────────────────────────────┐
│           PLATEFORME COMPTARIA                       │
├─────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐│
│  │  MODULE 1 — EXTRACTION INTELLIGENTE              ││
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐      ││
│  │  │ Document │  │ Tax      │  │ Plan      │      ││
│  │  │ Reader   │  │ Detector │  │ Compta    │      ││
│  │  └──────────┘  └──────────┘  └───────────┘      ││
│  └──────────────────────────────────────────────────┘│
│                      ↕                                │
│  ┌──────────────────────────────────────────────────┐│
│  │  MODULE 2 — COMPTA_HARNESS (réconciliation)      ││
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐      ││
│  │  │ Extract  │  │ Categor. │  │ Reconcil. │      ││
│  │  │ Agent    │  │ Agent    │  │ Agent     │      ││
│  │  └──────────┘  └──────────┘  └───────────┘      ││
│  └──────────────────────────────────────────────────┘│
│                      ↕                                │
│  ┌──────────────────────────────────────────────────┐│
│  │  MODULE 3 — ÉCRITURES RÉCURRENTES                 ││
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐      ││
│  │  │ Amort.   │  │ Calend.  │  │ Décl.     │      ││
│  │  │ Auto     │  │ Fiscal   │  │ Fiscales  │      ││
│  │  └──────────┘  └──────────┘  └───────────┘      ││
│  └──────────────────────────────────────────────────┘│
│                      ↕                                │
│  ┌──────────────────────────────────────────────────┐│
│  │  INFRASTRUCTURE SOUVERAINE                        ││
│  │  ┌──────────────┐  ┌──────────────────┐          ││
│  │  │ GLM 5.2      │  │ PostgreSQL       │          ││
│  │  │ (Montréal)   │  │ (audit trail)    │          ││
│  │  └──────────────┘  └──────────────────┘          ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## CE QUE CHACUN VEUT ENTENDRE

### CLIENT (CPA, DG cabinet)

```
"Vos équipes passent 60% de leur temps en saisie manuelle ?
 L'IA peut faire ça. Mais pas n'importe quelle IA.

 Comptaria fait 80% du travail compta avec des agents IA
 souverains — hébergés à Montréal, conformes Loi 25.
 Le CPA révise et signe les 20% qui comptent.

 Extraction, réconciliation, écritures : automatisées.
 Données fiscales : 100% au Québec.
 Audit trail : chaque décision tracée.

 Pilote gratuit 4 semaines. On vous le prouve."
```

### INVEST-AI (500K-5M$)

```
"Comptaria développe la première plateforme d'orchestration IA
souveraine pour cabinets comptables québécois.

Trois modules : extraction, réconciliation multi-agents (compta_harness),
écritures récurrentes. Modèle GLM 5.2 auto-hébergé à Montréal —
souveraineté numérique totale, conformité Loi 25.

Marché de 8 000 cabinets QC forcés par la réalité :
l'IA existe, mais aucun outil souverain pour la compta QC.
Récurrent (SaaS). Retombées QC : 8-12 emplois/3 ans."
```

---

## COMMENT PARLER DE NOTRE TRAVAIL

### ❌ NE JAMAIS DIRE

| ❌ | Pourquoi |
|----|----------|
| "On fait de l'IA" | Tout le monde dit ça |
| "On automatise la compta" | Vague, commodity |
| "Multi-agent Overmind" | Jargon, le client s'en fout |
| "GLM 5.2" | Le client ne sait pas ce que c'est |
| "Consultant IA" | Remplaçable, générique |

### ✅ TOUJOURS DIRE

| ✅ | Pourquoi |
|----|----------|
| "Orchestration IA souveraine pour compta" | Produit, niche, défendable |
| "80% du travail automatique" | ROI clair et chiffré |
| "100% Québec, Loi 25" | Urgence réglementaire, confiance |
| "Le CPA signe les 20% qui comptent" | Le client reste maître |
| "Audit trail fiscal" | Traçabilité, conformité |

---

## POSITIONNEMENT LinkedIn

```
Headline :
"Comptaria — Orchestration IA souveraine pour cabinets comptables QC"

À propos :
"Le cabinet comptable du futur ne fait plus de saisie manuelle.

 Comptaria automatise 80% du travail compta avec des agents IA
 souverains — hébergés à Montréal, conformes Loi 25. Le CPA
 révise et signe les 20% qui comptent.

 Avant : 60% du temps en saisie. Après : 60% en conseil client.

 100% Québec. Multi-agents. Audit trail fiscal."
```

---

## RÉSUMÉ EN UNE PHRASE

> **Comptaria = le bras armé IA du cabinet comptable québécois.
> On fait 80% du travail, le CPA signe les 20% qui comptent,
> et tout reste au Québec.**
