# 07 — PLAN D'ACTION ÉTAPE PAR ÉTAPE

> **Objectif :** De zéro à cabinet comptable client en 12 mois.
> **Équipe :** Deamon (Dev), Magus (BAA/CEO), Mike (Graphiste/CRM/SEO), Striker (Agent IA)

---

## PHASE 0 — FONDEMENTS (Semaine 1-2)

```
□ 1. Incorporation provinciale Québec (332$, 1 jour)
   → https://www.registreentreprises.gouv.qc.ca

□ 2. Numéros fiscaux TPS/TVQ (gratuit, en ligne)
   → ARC + Revenu Québec

□ 3. Compte bancaire business (~20$/mois)

□ 4. Assurance responsabilité pro + cyber (40-120$/mois)
   → NON NÉGOCIABLE : on manipule des données fiscales client

□ 5. Logiciel comptabilité (QuickBooks ~30$/mois)
   → OUI, le projet compta IA a besoin de sa propre compta

□ 6. Feuilles de temps (Toggl gratuit)
   → CRUCIAL pour documenter les travaux de SR&ED admissibles

□ 7. Domaine + email pro (comptaria.ca + Google Workspace)
   → Déjà fait : site live sur 192.168.40.9 + repo GitHub + Vercel

□ 8. Slack/Discord workspace équipe (déjà fait : serveur 1528821324443549806)

Total : ~400$ + 1 week-end
```

---

## PHASE 1 — MVP COMPTA_HARNESS (Semaine 2-8)

### Le produit (Semaine 2-6)

```
□ 9. Bâtir le MVP compta_harness (voir ../product/12-mvp-development-plan.md)
   → Agent extraction (lit factures PDF/images)
   → Agent catégorisation (plan comptable QC)
   → Agent réconciliation (appariement factures ↔ relevés)
   → Dashboard simple (React)
   → Démo sur cas réel cabinet

□ 10. Enregistrer une démo vidéo (5 min)
   → L'agent extrait une facture complexe (TPS+TVQ+escompte)
   → L'agent réconcilie 20 factures en 30 secondes
   → L'agent génère les écritures d'amortissement
   → C'est ÇA qu'on montre aux cabinets et à INVEST-AI

□ 11. Calendrier fiscal QC intégré
   → Échéances TPS/TVQ (mensuel/trimestriel)
   → DAS, relevé 1, T4
   → RRQ, RQAP
```

### L'infrastructure souveraine (Semaine 4-6, en parallèle)

```
□ 12. Déployer GLM 5.2 sur le serveur (déjà en cours)
   → Auto-hébergé à Montréal (192.168.40.9)
   → API interne pour les agents compta

□ 13. Audit trail PostgreSQL
   → Chaque décision fiscale tracée
   → Hash chain (immuable)
   → Conforme Loi 25 art. 12.1

□ 14. Sécurité Loi 25
   → Chiffrement au repos + en transit
   → Politique de confidentialité
   → Procédure en cas d'incident
```

---

## PHASE 2 — FINANCEMENT (Mois 2-4)

### Cash rapide (Mois 2)

```
□ 15. Contacter PME MTL (5-25K$ subvention locale)
   → https://www.pmemtl.ca

□ 16. Demander un conseiller IRAP (gratuit)
   → Présenter le MVP + les 3 pistes R&D
   → Il valide l'admissibilité SR&ED/IRAP

□ 17. Joindre Bonjour Startup Montréal (gratuit)
```

### Le jackpot (Mois 3-4)

```
□ 18. Préparer le pitch deck INVEST-AI (10 slides)
   → Slide 1 : Problème (cabinets QC coincés sans IA souveraine)
   → Slide 2 : Solution (compta_harness + souveraineté + Loi 25)
   → Slide 3 : Tech défendable (GLM 5.2 auto-hébergé, multi-agents)
   → Slide 4 : Marché (8 000 cabinets QC, TAM/SAM/SOM)
   → Slide 5 : MVP démo (lien vidéo)
   → Slide 6 : Équipe (Deamon + Magus + Mike)
   → Slide 7 : Business model (SaaS 3 tiers : Solo 500$ / Cabinet 1 500$ / Enterprise 3 000$)
   → Slide 8 : Traction (pilotes en cours)
   → Slide 9 : Ask (200K-1M$ pour 18 mois de R&D)
   → Slide 10 : Roadmap (MVP → pilote → commercialisation)

□ 19. Prendre RDV avec Investissement Québec (INVEST-AI)
   → https://www.iq.ca/fr/investisseurs
   → Pitch : orchestration IA souveraine pour compta QC, Loi 25

□ 20. Prendre RDV avec BDC Capital (backup)
   → https://www.bdc.ca/fr
```

---

## PHASE 3 — PREMIER CABINET CLIENT (Mois 3-5)

### Ciblage cabinets (Mois 3-4)

```
□ 21. Identifier 20 cabinets comptables cibles (QC)
   → LinkedIn : associé, directeur, CPA
   → Critères : 2-10 employés, croissance, pas trop "techno"
   → Zones : Montréal, Québec, Laval, Gatineau

□ 22. Envoyer 10 messages personnalisés/semaine
   → Pitch : "60% de votre temps en saisie ? On automatise 80%. Pilote gratuit."
   → Mike mène le CRM + suivi prospects

□ 23. Dès qu'un cabinet dit "parlons-en" :
   → Meeting 15 min (Deamon + Mike)
   → Démo du MVP compta_harness
   → Proposition de pilote (gratuit 4 semaines ou 2-5K$)
```

### Premier pilote (Mois 4-5)

```
□ 24. Livrer le pilote chez le premier cabinet
   → Installation du compta_harness sur leurs données
   → Configuration du plan comptable du cabinet
   → Premier mois de réconciliation automatisée
   → Formation équipe (Mike mène)

□ 25. Documenter le résultat
   → Before/After chiffré (heures gagnées, erreurs évitées)
   → Case study
   → Témoignage client
   → C'est la preuve de traction pour INVEST-AI
```

---

## PHASE 4 — SCALE (Mois 5-12)

### Scale AI (si client manufacturing)

```
□ 26. Si un client PME manufacturing est trouvé :
   → Inclure le composant compta_harness dans un dossier Scale AI
   → Subvention 40% sur le projet
   → Le client paie 60%, Scale AI paie 40%

□ 27. Premier contrat récurrent (SaaS mensuel — viser Cabinet 1 500$/mois)
```

### Expansion

```
□ 28. Recrutement
   → Premier employé : dev Python/IA ou compta-expert
   → Salaire admissible SR&ED
   → Crédit stage (30-32% si stagiaire)

□ 29. Marketing (Mike mène)
   → 1 post LinkedIn/semaine (cas concrets compta IA)
   → Before/After avec chiffres
   → SEO site comptaria.ca

□ 30. Partenariats
   → Ordre des CPA du Québec (référence)
   → Cabinets d'implémentation (migration Acomba → Comptaria)
```

---

## PHASE 5 — DURABILITÉ (Mois 6-12)

### ⚠️ L'entreprise est viable quand :

```
□ 31. 6 mois de frais de fonctionnement en banque
□ 32. 3-5 cabinets récurrents couvrant 70% des coûts
□ 33. INVEST-AI signé (ou BDC) pour 12-18 mois de runway
□ 34. L'équipe est rémunérée (même minimalement)
```

---

## TIMELINE VISUELLE

```
Sem 1-2   ████████ Incorpore, fiscaux, banque, assurance, feuilles temps
Sem 2-6   ████████████ MVP compta_harness + infrastructure souveraine
Sem 4-6   ████████ GLM 5.2 deploy + audit trail + sécurité Loi 25
Mois 2    ████ PME MTL + IRAP conseiller (pendant le MVP)
Mois 3-4  ████████ INVEST-AI pitch + BDC (dès que MVP prêt)
Mois 3-5  ████████ Premier pilote cabinet
Mois 5-7  ████████ Scale AI (si client PME manufacturing)
Mois 6-12 ██████████████ Scale : cabinets récurrents + recrutement
```

---

## RÉPARTITION DES RÔLES

```
DEAMON (Dev Backend) :
  → MVP compta_harness (code, architecture, GLM 5.2)
  → Infrastructure serveur (192.168.40.9)
  → Sécurité Loi 25 (chiffrement, audit trail)
  → API et intégrations

MAGUS (BAA/CEO) :
  → Stratégie entreprise, incorporation, fiscalité
  → Relation investisseurs (INVEST-AI, BDC)
  → Logiciels et outils entreprise
  → Décisions business

MIKE (Graphiste/CRM/SEO) :
  → Design site, branding, visuels
  → CRM et suivi prospects
  → SEO et marketing LinkedIn
  → Formation clients, représentation

STRIKER (Agent IA) :
  → Monitoring serveur + site (cron quotidien)
  → Mémoire projet Overmind
  → Rapports matinaux équipe (Discord)
  → Suggestion d'optimisations
```

---

## LES 5 ACTIONS DE LA SEMAINE 1

```
1. Incorpore la compagnie                    → 332$, 1 jour (Magus)
2. Contacte un conseiller IRAP (gratuit)     → Valide la R&D (Magus)
3. Commence le MVP compta_harness            → 6 semaines (Deamon)
4. Mets les feuilles de temps en place       → Gratuit, pour SR&ED (tous)
5. Contacte 10 cabinets comptables           → Pitch pilote (Mike)
```

> **L'ordre est important.** MVP AVANT clients. Souveraineté AVANT pilote.
> Le site est déjà live — maintenant il faut le produit derrière.
