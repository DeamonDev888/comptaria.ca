# Matrice paie — destinataires, canaux, obligations (brouillon v0.1)

> **Auteur** : Striker (bot dev/ops) · **Date** : 2026-07-22
> **Statut** : **BROUILLON v0.1** — à faire valider par Magus (BAA CEO) avant tout
> **Périmètre** : Comptaria · pilote Bon-Air Construction inc.
> **Hors scope v0.1** : conventions clients spécifiques, clauses des ententes bancaires nominatives (à compléter par Magus)
> **Sources** : ARC, Revenu Québec, CNESST, ACQ (décrets), Loi 25 (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels dans le secteur privé), convention Acomba interne

---

## 0. Principes directeurs (proposés à Magus)

1. **Québec-first** : tout ce qui peut l'être part vers un destinataire québécois d'abord.
2. **Souveraineté des données** : aucune donnée client/comptable ne sort vers un serveur hors Québec sans audit validé.
3. **Loi 25** : tout transfert de renseignement personnel (RP) suit le cycle de vie : collecte → utilisation → communication → conservation → destruction, avec journalisation append-only.
4. **L'agent ne signe rien** : Magus, le CPA désigné ou l'employeur autorisé fait office de signataire officiel pour chaque pièce fiscale.
5. **Audit avant paie** : aucune paie n'est émise tant que (a) le CPA n'a pas validé le lot complet (b) Magus n'a pas contresigné pour les cas limites (Loi 25 + données hors QC).
6. **Mode dégradé** : en cas de panne d'un canal, la pièce est mise en file d'attente et retraitée à la reprise (jamais perdue).

---

## 1. Inventaire des pièces « paie » produites par mcp-comtaria + mcp-csv

| ID interne | Pièce | Format par défaut | Sens (entrée/sortie) |
|---|---|---|---|
| `time_entry.summary` | Relevé de temps par employé par période de paie | CSV multi-sections | sortante (vers paie) |
| `time_entry.approve` | Bon d'approbation des heures par gestionnaire | HTML brandé + CSV | sortante |
| `bon_travail.final` | Bon de travail client signé | HTML brandé + CSV | sortante (vers cabinet) |
| `invoice.client` | Facture émise client (AR) | HTML brandé + PDF/A | sortante |
| `invoice.fournisseur` | Facture reçue fournisseur (AP) | HTML brandé + CSV | entrante (vers cabinet) |
| `payroll.register` | Registre de paie (synthèse employés + retenues) | CSV canonique (spec Acomba) | sortante (vers Acomba) |
| `payroll.t4a_summary` | Sommaire des T4A (feuillets sommaires) | CSV structuré | sortante (vers ARC) |
| `payroll.t4_summary` | Sommaire des T4 (feuillets sommaires) | CSV structuré | sortante (vers ARC) |
| `payroll.rl1_summary` | Sommaire RL-1 (Québec) | CSV structuré | sortante (vers Revenu Québec) |
| `payroll.rl2_summary` | Sommaire RL-2 (Québec — participation) | CSV structuré | sortante (vers Revenu Québec) |
| `payroll.cn_wsj` | Déclaration WSIB/CNESST (si applicable — construction) | XML/EDI + CSV | sortante (vers CNESST) |
| `payroll.acq_decision` | Déclaration convention collective ACQ (grille horaires, métier, région) | XML/EDI + CSV | sortante (vers ACQ) |
| `payroll.bank_file` | Fichier de paie bancaire (direct deposit, ACH, Interac) | Fichier bancaire standard | sortante (vers banque) |
| `payroll.releve_emp` | Relevé de paie individuel | PDF/A + version HTML imprimable | sortante (vers employé) |
| `payroll.t4_employee` | T4 individuel employé | PDF/A + XML | sortante (vers employé) |
| `payroll.t4a_employee` | T4A individuel employé (ex : contractuel) | PDF/A + XML | sortante (vers employé) |
| `payroll.releve_impot` | Relevé d'impôt Québec/Canada combiné | PDF/A | sortante (vers employé) |
| `audit.access_log` | Journal d'accès Loi 25 (qui a lu quoi, quand) | CSV append-only | interne + DPO |
| `audit.export_log` | Journal des exports sortants | CSV append-only | interne + DPO |
| `audit.consent_log` | Journal des consentements Loi 25 (employés, clients, fournisseurs) | CSV append-only | interne + DPO |

---

## 2. Matrice destinataires × pièces (proposition à valider par Magus)

### 2.1 Gouvernement fédéral — ARC (Agence du revenu du Canada)

| Pièce | Fréquence | Canal | Délai légal | Format attendu | Base légale |
|---|---|---|---|---|---|
| `payroll.t4_summary` + `payroll.t4a_summary` | annuel | Mon ARRIMA (transfert sécurisé) ou Représenter un client | au plus tard le dernier jour de février suivant l'année d'imposition | XML conforme ARC, fichier parTransmission | LIR art. 200–204 (relevé 1); RC4288, RC4120 (transmission) |
| `payroll.t4_employee` + `payroll.t4a_employee` | annuel | dépôt Mon ARRIMA + copie papier ou électronique à l'employé | au plus tard le dernier jour de février | PDF/A + XML | LIR art. 200(1) |
| `payroll.bank_file` (anada transfert électronique) | par paie | site Web de l'institution financière (PAEF) ou service bancaire | variable (selon la banque) | Fichier bancaire | RC4190 (institutions financières) |
| Déclarations de versements (T4Sum, T4ASum, PD7A) | périodique | Mon ARRIMA | variable (taux de versement) | XML | LIR art. 153 (retenues) |

**Point Magus** : ARC exige la conformité XML structurée et la transmission via Mon ARRIMA (ou via Represent a Client). mcp-csv génère du **CSV** par défaut — il faut générer du **XML ARC** ou transformer via un convertisseur certifié (à décider).

### 2.2 Gouvernement du Québec — Revenu Québec

| Pièce | Fréquence | Canal | Délai légal | Format attendu | Base légale |
|---|---|---|---|---|---|
| `payroll.rl1_summary` + `payroll.rl2_summary` | annuel | Mon dossier — Entreprises, section Production | au plus tard le dernier jour de février (employeur) | XML ou formulaire Web | Loi sur les impôts du Québec art. 1079.1 |
| `payroll.releve_emp` (intégration au relevé combiné fédéral) | annuel | envoyé à l'employé | au plus tard le dernier jour de février | PDF/A | Loi sur les impôts du Québec art. 1079.16 |
| Sommaire RL-1 déposés en ligne | annuel | Service en ligne (Mon dossier) | au plus tard le dernier jour de février | XML | TAQ.LoiImpôt.art 1079.1 |
| Déclarations de retenues et versements périodiques | par paie | Mon dossier | selon calendrier préétabli | XML | Loi sur les impôts du Québec art. 1015 |
| `payroll.tpq` (Taxe sur la Prime d'Assurance Santé — QPIP) | annuel | Mon dossier | au plus tard le 31 mars | XML | Loi sur la Régie de l'assurance maladie du Québec art. 59 |

**Point Magus** : unifié avec ARC par « Production intégrée » ? Sinon préciser le canal.

### 2.3 CNESST (Commission des normes, de l'équité, de la santé et de la sécurité du travail du Québec)

| Pièce | Fréquence | Canal | Délai légal | Format attendu | Base légale |
|---|---|---|---|---|---|
| Déclaration de salaire (DCN — Déclaration des niveaux de salaire et de la masse salariale catégorielle) | annuelle | Service en ligne CNESST | généralement le 15 mars | Formulaire Web | Loi sur la santé et la sécurité du travail (LSST) art. 289.1 |
| Paiement de la prime (facture CNESST) | annuel | débit automatique ou paiement en ligne | selon calendrier | Bordereau | LSST art. 287 |
| Mutuelle de prévention CNESST | adhésion volontaire | demande écrite | à l'adhésion | Formulaire | LSST art. 299 |

### 2.4 ACQ (Association de la construction du Québec) — syndicat sectoriel

> **Note** : Bon-Air n'est pas membre de l'ACQ par défaut. Section à valider **pour chaque client Bon-Air**.

| Pièce | Fréquence | Canal | Délai légal | Format attendu | Base légale |
|---|---|---|---|---|---|
| Rapport mensuel de main-d'œuvre (si convention collective ACQ) | mensuel | système ACQ | selon convention | XLSX ou portail ACQ | Décrets convention collective |
| VRS (vacances, retenues syndicales, fonds de pension) | par paie | portail ACQ | par paie | XLSX ou XML | Décrets |

**Point Magus** : si Bon-Air n'est pas affilié ACQ, on retire ce bloc. À confirmer.

### 2.5 Banque de l'employeur (paie / dépôt direct)

| Pièce | Fréquence | Canal | Format attendu | Base légale |
|---|---|---|---|---|
| `payroll.bank_file` (PAEF—Paiement direct aux employés via fichiers bancaires) | par paie | portail de la banque de l'employeur (ex : Desjardins AccèsD Affaires) ou service bancaire EDI | Fichier PAEF (format bancaire standard — spécification de chaque institution) | Contrat de service bancaire |

**Point Magus** : préciser la banque (Desjardins ? RBC ? BNC ? Caisse populaire ?) et le canal exact.

### 2.6 Comptable / cabinet comptable de Bon-Air

| Pièce | Fréquence | Canal | Format attendu | Base légale |
|---|---|---|---|---|
| `payroll.register` | par paie | dépôt sécurisé (Edge API → cabinet) | CSV canonique + HTML brandé (relevé) | contrat de service cabinet |
| `payroll.bank_file` (préparé et proposé à l'employeur pour signature et dépôt) | par paie | signature DFO + transmission à la banque | CSV de référence | contrat de service cabinet |

### 2.7 Employé (chaque employé reçoit ses pièces individuelles)

| Pièce | Fréquence | Canal | Format | Base légale |
|---|---|---|---|---|
| `payroll.releve_emp` (relevé de paie) | par paie | dépôt sécurisé (employeur) ou envoi par courriel sécurisé | PDF/A signable + version HTML consultable | L'art. 68 de la Loi sur les normes du travail (LNT) impose la remise d'un relevé écrit à chaque paie |
| `payroll.t4_employee` ou `payroll.t4a_employee` | annuel | Mon dossier ou envoi postal | PDF/A + XML | LIR art. 200(1) ; Loi sur les impôts du Québec art. 1079.16 |
| `payroll.releve_impot` | annuel | envoi postal ou Mon dossier | PDF/A | combiné par convention |

**Point Magus** : canal sécurisé pour les relevés de paie — Mon dossier Entreprises ou service DocuSign/DigitalOASIS ?

### 2.8 DPO / conformité Loi 25

| Pièce | Fréquence | Canal | Format | Base légale |
|---|---|---|---|---|
| `audit.access_log`, `audit.export_log`, `audit.consent_log` | continu | append-only interne, export CSV chiffré sur demande du DPO | CSV | Loi 25 — articles 9–11 (responsabilité), 28 (droit d'accès), 30 (rectification) |

### 2.9 Clients (Bon-Air → clients finaux)

| Pièce | Fréquence | Canal | Format | Base légale |
|---|---|---|---|---|
| `invoice.client` (facture émise) | par projet | courriel sécurisé ou portail client | PDF/A + CSV | contrat client |
| `bon_travail.final` | par projet (par semaine typique) | courriel | HTML brandé + CSV | contrat client |

### 2.10 Fournisseurs

| Pièce | Fréquence | Canal | Format | Base légale |
|---|---|---|---|---|
| `invoice.fournisseur` (après validation comptable) | par paiement | courriel sécurisé ou portail fournisseur | PDF/A + CSV | Loi 25 — minimisation ; aucun envoi direct des données client au fournisseur |

---

## 3. Arbre de décision (algorithme de l'agent dispatcher)

```
Pour chaque pièce (ci-dessus) :
  1. Destinataires primaires (toujours envoyer) : matrice §2
  2. Destinataires conditionnels (selon rôle) : exemple, le CPA du cabinet voit tout ce qui concerne les employés qu'il gère.
  3. Format de sortie (par destinataire) :
     - HTML brandé + hash SHA-256 du contenu (mcp-csv v0.2 fourni)
     - CSV multi-sections ré-importable (mcp-csv v0.2 fourni)
     - XML conforme destinataire (à coder, Magus détermine les schémas)
  4. Canal (Magus à valider) :
     - courriel sécurisé (PGP/S/MIME + PDF signé) par défaut
     - PAEF / Mon ARRIMA / portail dédié pour les destinataires gouvernementaux
     - dépôt direct (outil Web de l'institution financière) pour les banques
  5. Loi 25 :
     - Vérifier le consentement du sujet (employé, client, fournisseur)
     - Vérifier la localisation du destinataire (Québec d'abord ; hors QC besoin du consentement explicite du sujet)
     - Journaliser le transfert (append-only)
     - Chiffrer les pièces (TLS 1.3 minimum)
```

---

## 4. Questions à trancher avec Magus

1. **Banque de l'employeur** : nom exact, canal utilisé (PAEF, AccèsD Affaires, autre), fréquence de la paie (chaque 2 semaines ? mensuel ?).
2. **Cabinet comptable de Bon-Air** : nom du CPA désigné + canal sécurisé (DocuSign? DocuWare? Mon dossier? Courriel S/MIME?). Preuve d'autorisation client? Habitudes de signature?
3. **ARC** : channel retenu (Mon ARRIMA direct ou via « Représenter un client »), personne morale autorisée?
4. **Revenu Québec** : Production intégrée (CN/CR combinés) ou pas? Sinon, RL-1 + Sommaire déclarant séparément?
5. **CNESST** : adhésion à une mutuelle de prévention? Décision pour chaque client?
6. **ACQ** : Bon-Air est-il membre d'une association sectorielle? Sinon section à supprimer.
7. **Courriel ou dépôt?** Pour le client et le fournisseur : courriel signé + portail?  Signature via Signature Québec?
8. **Politique Loi 25 — hébergement hors Québec** : acceptée sous quel seuil (par exemple, hébergement US TolINO accepté, US Non-Tolino refusé)? À décider.
9. **Format XML pour les gouvernements** : valides-tu un convertisseur CSV → XML ou on code XML en natif (Xerces, fast-xml-parser)?
10. **Journal d'audit Loi 25** : combien de temps conservé? (proposition : 7 ans — durée comptable minimale, mais Magus peut ajuster.)
11. **Seuil d'avertissement Magus** : à combien de pièces bloquées / non confirmées en attente avant qu'on t'alerte?
12. **Signature numérique** : signature d'entreprise utilisée pour l'OCR des actes officiels (Magus, CPA, employé?).
13. **Conservation photos factures** : 30 jours originaux + 7 ans dérivées (politique déjà ébauchée ; Magus confirme).
14. **Cycle de paie** : jour/heure de la paie, jour/heure limites de génération automatique, paie rétroactive acceptable?

---

## 5. Annexe — Décisions validées

| Décision | Statut | Date | Source |
|---|---|---|---|
| Loi 25 — hébergement OC + chiffrement + audit obligatoire | à valider | — | Magus |
| Aucune pièce client hors Québec sans audit | posé (par défaut) | 2026-07-22 | Loi 25, Magus à confirmer |
| Format HTML brandé + CSV structuré pour le côté cabinet | posé (par défaut) | 2026-07-22 | Magus à confirmer |
| Format XML ou convertisseur pour les gouvernements | ouvert | — | Magus |
| Politique de signature numérique (DocuSign / autre) | ouvert | — | Magus |

---

## 6. Prochaine étape

- Circulation du brouillon à Magus (canal Discord privé ou courriel).
- Itération v0.2 sur la base des commentaires de Magus.
- Validation finale signée par Magus.
- Intégration dans `mcp-csv` v0.3 (templating XML + dispatcher central).

— *Striker (bot dev/ops) — 2026-07-22*
