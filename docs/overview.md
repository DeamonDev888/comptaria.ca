# ✅ COMPTARIA — ORCHESTRATION IA POUR CABINETS COMPTABLES

> **Créé le :** 20 juillet 2026
> **Statut :** Pré-lancement / Site live + MVP en cours
> **Équipe fondatrice :** Deamon (Dev/Backend), Magus (BAA/CEO), Mike (Graphiste/CRM/SEO)
> **Agent IA :** Striker (STRIKER#8164) — orchestrateur Discord + ops serveur

---

## 🎯 L'ÉLEVATOR PITCH

> **Comptaria orchestre des agents IA souverains pour cabinets comptables
> et PME au Québec. Notre moteur compta_harness fait 80% du travail —
> extraction, réconciliation, écritures récurrentes — le CPA signe
> les 20% qui comptent. Hébergement 100% Québec. Conforme Loi 25.**

---

## ❓ LE PROBLÈME (pourquoi ça existe)

```
Le cabinet comptable québécois moyen :
  → Passe 60% de son temps sur la saisie/réconciliation manuelle
  → Utilise des logiciels vieillissants (Accompa, Prodon, Acomba)
  → Doit se conformer à la Loi 25 (protection données personnelles)
  → N'a PAS les moyens d'embaucher un développeur IA interne
  → Perd ses clients au profit de cabinets plus "techno"

L'IA existe (ChatGPT, Copilot) MAIS :
  → Aucun n'est conçu pour la comptabilité QC
  → Aucun ne connaît la TVQ, la TPS, les retenues à la source QC
  → Tous envoient les données aux États-Unis (violation Loi 25)
  → Aucun ne garantit la traçabilité des décisions fiscales

PROBLÈME CONCRET :
  → Le CPA veut automatiser MAIS ne peut pas utiliser un outil US
  → Les données fiscales de ses clients sont sensibles (Loi 25 art. 12.1)
  → Aucun outil n'offre l'orchestration IA + souveraineté + conformité
```

---

## ✅ LA SOLUTION (ce qu'on vend)

```
Comptaria = 3 modules IA pour cabinets comptables :

1. EXTRACTION INTELLIGENTE (entrepôt de documents)
   → Lecture factures, reçus, relevés bancaires par IA
   → Catégorisation automatique (comptes, TPS/TVQ)
   → Plus de saisie manuelle

2. RÉCONCILIATION AUTOMNE (moteur multi-agents)
   → compta_harness : moteur maison, multi-agents autonomes
   → Appariement factures ↔ relevés ↔ bons de commande
   → Détection d'écarts en temps réel
   → Apprentissage des patterns du cabinet

3. ÉCRITURES RÉCURRENTES (automatisation)
   → Amortissements, salaires, loyers générés automatiquement
   → Calendrier fiscal QC intégré (DAS, TPS/TVQ, relevé 1)
   → Le CPA révise et signe — l'IA a fait 80% du travail

SOUS LE CAPOT :
  → Modèle GLM 5.2 open-source, auto-hébergé à Montréal
  → Aucune donnée ne quitte le Québec (Loi 25 conforme)
  → Architecture multi-agents (chaque tâche = un agent spécialisé)
  → Persistance et audit trail (chaque décision est traçable)
```

---

## 💰 LE MARCHÉ (pourquoi ça paie)

```
MARCHÉ FORCÉ PAR LA RÉALITÉ :
  → ~8 000 cabinets comptables au Québec
  → ~50 000 PME québécoises (clients potentiels indirects)
  → Tous ont un logiciel compta, aucun n'a d'IA souveraine

TAM : Tous les cabinets comptables + PME QC = ~58 000
SAM : Cabinets 2-20 employés + PME 10-100 employés = ~15 000
SOM : 50 cabinets en 3 ans à 24K$/an = 1.2M$ récurrent

CIBLES IMMÉDIATES :
  Cabinets comptables 2-10 employés (sous-équipés techno)
  PME 10-50 employés (pas de compta interne)
  Cabinets qui veulent se différencier ("comptabilité IA")
```

---

## 🧱 LA TECHNOLOGIE (pourquoi c'est défendable)

```
3 piliers techniques :

1. COMPTA_HARNESS — Moteur multi-agents maison
   → Purgé du non-essentiel, boosté pour la compta
   → Agents autonomes (extraction, catégorisation, réconciliation)
   → Persistant et auditable (chaque décision tracée)
   → Calendrier fiscal QC natif

2. SOUVERAINETÉ NUMÉRIQUE
   → GLM 5.2 open-source auto-hébergé à Montréal
   → Aucune donnée ne transite par les États-Unis
   → Conformité Loi 25 (hébergement + traçabilité)

3. ORCHESTRATEUR DE CABINET
   → L'IA apprend la structure du cabinet client
   → S'adapte à ses comptes, ses catégories, ses clients
   → Le CPA reste maître — l'IA propose, le CPA signe

INFRASTRUCTURE :
  → Serveur dédié Ubuntu 192.168.40.9 (Montréal)
  → Nginx + site statique HTML (comptaria.ca)
  → PostgreSQL pour persistence
  → Overmind pour orchestration multi-agents
```

---

## 📂 STRUCTURE DES DOSSIERS

```
comptaria.ca/
├── public/          → Site statique HTML
├── docs/            → Cette documentation business
│   ├── strategy/    → Vision, marché, exécution
│   ├── company/     → Incorporation et admin
│   └── product/     → Roadmap produit
├── logs/            → Logs nginx
├── backups/         → Backups
└── README.md
```

---

## 🗓️ LECTURE RECOMMANDÉE

| Temps | Quoi lire |
|-------|-----------|
| **5 min** | overview.md → [`strategy/01-vision-positioning.md`](strategy/01-vision-positioning.md) |
| **30 min** | Vision → marché → segments cibles |
| **2h** | Tout dans l'ordre |
| **Tu veux agir** | Réservation du nom → plan d'exécution → incorporation → MVP |

---

## ⚡ LES 5 ACTIONS DE LA SEMAINE 1

```
1. Incorpore la compagnie                    → 332$, 1 jour
2. Contacte un conseiller IRAP (gratuit)     → Pour valider la R&D
3. Démarre le MVP compta_harness             → 6 semaines
4. Mets les feuilles de temps en place       → Gratuit, pour SR&ED
5. Contacte 10 cabinets comptables           → Pitch pilote gratuit
```

---

## 💰 LE COMBO SUBVENTIONS

```
INVEST-AI :     500K-5M$  (R&D du compta_harness + souveraineté)
Scale AI :         40%    (Déploiement chez cabinet client)
SR&ED :         15-35%    (R&D expérimentale multi-agents)
IRAP :          50-500K$  (Subvention R&D + conseiller gratuit)

→ Total cash non-dilutif année 1 : 200K$ - 800K$
→ Dilution : 10-25% (INVEST-AI seulement, si equity)
```

---

## 👥 L'ÉQUIPE

| Membre | Rôle | Discord ID |
|--------|------|------------|
| **Deamon** | Dev Backend / Overmind / Infrastructure IA | 293572859941617674 |
| **Magus** | BAA du CEO — Stratégie, logiciels, ops entreprise | 252148325938233344 |
| **Mike** | Graphiste + Représentant — CRM, clients, SEO | (à confirmer) |
| **Striker** | Agent IA Discord — Ops serveur + mémoire projet | BOT |

---

*Document vivant — Striker le maintient à jour.*
