# Matrice OCR — champs **required** + seuils de confiance **par champ** (brouillon v0.1)

> **Auteur** : Striker (bot dev/ops) · **Date** : 2026-07-22
> **Statut** : BROUILLON v0.1 — à valider par **Magus (BAA CEO)** + **CPA désigné** + **DPO**
> **Contexte** : décision Loi 25 stricte (`k_2bec08d85e566813_f13fac7d97b51319`) → **PaddleOCR 2.7+** CPU local uniquement (lib CPU Apache 2.0, 100 % QC, pas de sous-traitant US)
> **Émet au** : PR #5 (en préparation — ouvrir sur la branche `feat/ocr-champs-required`)

---

## 0. Sources auditées (état avant matrice)

| Source | Type | Champs mentionnés | Présence |
|---|---|---|---|
| `mcp-comtaria/src/utils/storage.ts` | Schéma SQL (`cabinet`, `tiers`, `chart_of_accounts`, `journal_entry`, `journal_line`, `invoice`, `audit_log`) | NEQ, dates ISO, montants cents, status enum | Source de vérité unique (à respecter dans toute pièce) |
| `mcp-comtaria/src/tools/extract_invoice.ts` | Stub OCR PDF (Phase 1) | `invoice_no, invoice_date, vendor_name, subtotal_cents, tps_cents, tvq_cents, total_cents, currency, raw_text_excerpt, confidence` | Phase 1 placeholder ; **Phase 2 = PaddleOCR CPU local** |
| `mcp-csv/src/templates/structured.ts` | Générateur CSV multi-sections (4 templates) | `entete / client / tier / projet / lignes / items / jours / totaux / notes / signatures` | Contrat App ↔ `mcp-csv` |
| `comptaria.ca/public/assets/app.js` | Shell BT Secretary (coté client v0.1 M1.0) | `bon_de_travail`: numero, date, client, projet, tache, periode, statut, lignes ; `facture`: numero, date, fournisseur, sous_total, categorie | Schéma UI client (sera remplacé en M1.1 par endpoint `mcp-comtaria`) |
| `comptaria.ca/public/assets/app.html` | Formulaire HTML (5 onglets) | idem ci-dessus + photo file input | UI M1.0 |

**Conclusion** : aucune matrice OCR §required × seuils n'existait. **C'est ce que cette livraison fournit.**

---

## 1. Principes directeurs

1. **Source de vérité = `mcp-comtaria` schema** : tous les champs required sont **NOT NULL** côté DB, ou marqués ici comme bloquants pour ne pas casser un import ultérieur dans un schéma plus strict.
2. **Seuils par défaut proposés à Magus** : conservateur par défaut — pour ne JAMAIS valider une paie avec un champ à score < seuil. Voir §3.
3. **`<OCR_HUMAN_REQUIRED>` flag** : tout champ sous seuil entre en file d'attente de validation humaine. Voir §4.
4. **Champs additionnels (optionnels)** : ils peuvent rester vides. Aucun impact sur la paie.
5. **Override** : chaque cabinet peut surcharger les seuils via `cabinet.ocr_overrides` (colonne à ajouter en M1.2).

---

## 2. Matrice `champ × required × type × type_pièce × seuil_par_défaut`

### 2.1 Bon de travail (`bon_de_travail`)

| Champ | Type | Required | Pièce | Seuil par défaut (PaddleOCR) | Reason |
|---|---|---|---|---|---|
| `numero` | string | **YES** | BT | 0.85 | identifiant unique, doit matcher `BT-YYYY-NNNN` |
| `date` | ISO 8601 | **YES** | BT | 0.95 | date du jour, critique pour paie |
| `statut` | enum | **NO** | BT | 0.50 | par défaut "En cours" |
| `emetteur` | string | **NO** | BT | 0.50 | = `user_id` session |
| `client.name` | string | **YES** | BT | 0.85 | doit matcher un tiers existant |
| `client.address_line1` | string | **NO** | BT | 0.50 | pas bloquant pour la paie |
| `client.city` | string | **NO** | BT | 0.50 | idem |
| `client.postal_code` | string | **NO** | BT | 0.50 | idem |
| `client.neq` | string (10 chiffres) | **NO** | BT | 0.90 | required si client corporation QC |
| `projet` | string | **NO** | BT | 0.50 | par défaut "—" |
| `tache` | string | **NO** | BT | 0.50 | idem |
| `periode_debut` | ISO 8601 | **YES** | BT | 0.95 | borne période de paie |
| `periode_fin` | ISO 8601 | **YES** | BT | 0.95 | idem |
| `adresse_chantier` | string | **NO** | BT | 0.50 | pas bloquant |
| `lignes[].#` | int | YES (auto) | BT | 1.00 | incrément auto |
| `lignes[].date` | ISO 8601 | **YES** | BT | 0.95 | critique pour paie |
| `lignes[].description` | string | **YES** | BT | 0.75 | description intelligible |
| `lignes[].heures` | decimal | **YES** | BT | 0.90 | 0 < x ≤ 24 |
| `lignes[].taux_cents` | int | **YES** | BT | 0.95 | montant cohérent >= 0 |
| `lignes[].total_cents` | int | **YES** | BT | 1.00 | doit être `heures × taux_cents` arrondi au cent |
| `notes` | string | **NO** | BT | 0.50 | note libre |

### 2.2 Feuille de temps (`feuille_de_temps`)

| Champ | Type | Required | Pièce | Seuil par défaut | Reason |
|---|---|---|---|---|---|
| `numero` | string | **YES** | FT | 0.85 | idem BT |
| `periode_debut` | ISO 8601 | **YES** | FT | 0.95 | borne paie |
| `periode_fin` | ISO 8601 | **YES** | FT | 0.95 | idem |
| `employe.nom` | string | **YES** | FT | 0.90 | doit matcher un tiers `type=employe` |
| `employe.poste` | string | **NO** | FT | 0.50 | |
| `employe.employe_id` | int | **YES** | FT | 1.00 | clé étrangère `tiers.id` |
| `employe.taux_horaire_cents` | int | **YES** | FT | 0.95 | salaire horaire |
| `jours[].date` | ISO 8601 | **YES** | FT | 0.95 | chaque jour de la semaine |
| `jours[].jour` | weekday | **NO** | FT | 1.00 | dérivé de date |
| `jours[].projet` | string | **NO** | FT | 0.50 | optionnel |
| `jours[].heures_normales` | decimal | **YES** | FT | 0.90 | 0 ≤ x ≤ 8 (typ.) |
| `jours[].heures_suppl` | decimal | **NO** | FT | 0.90 | heures supp > 0 |
| `jours[].note` | string | **NO** | FT | 0.50 | note libre |
| `totales_normales_total` | decimal | YES (auto) | FT | 1.00 | somme de la semaine |
| `totales_suppl_total` | decimal | YES (auto) | FT | 1.00 | idem |

### 2.3 Facture (`facture_client`, `facture_fournisseur`)

| Champ | Type | Required | Pièce | Seuil par défaut | Reason |
|---|---|---|---|---|---|
| `numero` | string | **YES** | FA | 0.85 | identifiant unique fournisseur |
| `date` | ISO 8601 | **YES** | FA | 0.95 | date émission |
| `echeance` | ISO 8601 | **NO** | FA | 0.50 | si présente → calcul jours restants |
| `conditions` | string ("Net 30") | **NO** | FA | 0.50 | |
| `statut` | enum (open/partial/paid/void) | **NO** | FA | 0.50 | par défaut "open" |
| `bon_commande` | string | **NO** | FA | 0.50 | référence interne |
| `tier.nom` | string | **YES** | FA | 0.90 | doit matcher un tiers (`type=client` ou `fournisseur`) |
| `tier.adresse_ligne1` | string | **NO** | FA | 0.50 | |
| `tier.ville` | string | **NO** | FA | 0.50 | |
| `tier.code_postal` | string | **NO** | FA | 0.50 | |
| `tier.neq` | string (10 chiffres) | **NO** | FA | 0.90 | requis si corporation QC |
| `tier.email` | string | **NO** | FA | 0.50 | |
| `tier.telephone` | string | **NO** | FA | 0.50 | |
| `projet` | string | **NO** | FA | 0.50 | |
| `items[].#` | int | YES (auto) | FA | 1.00 | |
| `items[].description` | string | **YES** | FA | 0.75 | |
| `items[].quantite` | decimal | **YES** | FA | 0.90 | ≥ 0 |
| `items[].prix_unitaire_cents` | int | **YES** | FA | 0.95 | |
| `items[].total_cents` | int | **YES** | FA | 1.00 | = quantite × prix_unitaire_cents |
| `sous_total_cents` | int | YES (auto) | FA | 1.00 | somme des items |
| `tps_cents` (=5%) | int | **YES** | FA | 0.95 | TPS QC, calculable auto ou figé OCR |
| `tvq_cents` (=9,975%) | int | **YES** | FA | 0.95 | TVQ QC, idem |
| `total_cents` | int | **YES** | FA | 1.00 | sous_total + tps + tvq, **doit matcher OCR** |
| `notes` | string | **NO** | FA | 0.50 | |

---

## 3. Politique de seuils — décisions à trancher par Magus

### 3.1 Bornes proposées

| Catégorie | Plage suggérée | Sensibilité |
|---|---|---|
| **Critique paie** (date, montant total, taux, NEQ) | 0.85 → 0.95 → 1.00 | < 0.85 = bloque pour validation humaine |
| **Identifiant** (`numero` document) | 0.85 | < 0.85 = bloque |
| **Texte libre** (notes, descriptions) | 0.50 | < 0.50 = bloque, sinon warning |
| **Auto-dérivé** (totaux, # lignes) | 1.00 | recalculé par le serveur ; ne pas accepter l'OCR brut |

### 3.2 Règle dure (proposition Magus) :
- **AUCUN** champ sous seuil → pièce jamais transmise à `payroll.register` ou Acomba sans validation humaine.
- **Warning** vs **bloquant** : distinction configurable par cabinet (`cabinet.ocr_overrides`, ajout à prévoir en M1.2).

### 3.3 Seuils par cabinet (override client)
Ajouter une colonne à la table `cabinet` :

```sql
ALTER TABLE cabinet ADD COLUMN ocr_overrides TEXT;
-- JSON: { "bon_de_travail": { "numero": 0.90, "lignes[].total_cents": 1.00 }, "facture_fournisseur": { "tier.neq": 0.95 } }
```

Ou, plus simple v0.1, fichier `templates/companies/<id>.ocr.json` côté filesystem (déjà prévu pour le brand).

---

## 4. Pipeline `<OCR_HUMAN_REQUIRED>`

```
[photo] → PaddleOCR CPU local → champs structurés + scores → 
  For each field:
    if field.required AND score < required_threshold:
      Mark <OCR_HUMAN_REQUIRED field=… score=…> + stop propagation
    if field.optional AND score < optional_threshold:
      Mark <OCR_HUMAN_WARNING field=… score=…>
  
  Result:
    - Has any <OCR_HUMAN_REQUIRED>? → file d'attente cabinet (jamais bloquant chantier)
    - Else has any <OCR_HUMAN_WARNING>? → champ vide + warning + capture ok
    - Else all PASS → import direct vers mcp-comtaria + mcp-csv (CSV)
```

Sortie JSON :

```json
{
  "fields": [
    {"key": "numero", "value": "BT-2026-0042", "score": 0.96, "required": true, "state": "ok"},
    {"key": "lignes[0].total_cents", "value": 38000, "score": 0.92, "required": true, "state": "ok"},
    {"key": "tier.neq", "value": "", "score": 0.20, "required": false, "state": "warning"}
  ],
  "blocking": false,
  "warnings": 1,
  "human_required": []
}
```

---

## 5. Implémentation technique proposée (à ne PAS coder avant feu vert)

### 5.1 Nouveau module : `mcp-csv/src/ocr/`
```
mcp-csv/src/ocr/
├── paddle.ts          # wrapper PaddleOCR Node + post-traitement français
├── confidence.ts      # agrégation des scores par champ (regex + position + hash)
├── required_flags.ts  # matrice required × seuil (lu depuis templates/companies/<id>.ocr.json)
├── human_queue.ts     # file d'attente <OCR_HUMAN_REQUIRED>
└── test/
    ├── paddle.test.ts
    ├── confidence.test.ts
    └── required_flags.test.ts
```

### 5.2 Nouveaux outils MCP

| Outil | Rôle |
|---|---|
| `csv_ocr_extract_image` | prend un chemin local, sort `{fields, scores, blocking}` |
| `csv_ocr_list_pending` | liste les `<OCR_HUMAN_REQUIRED>` en attente par cabinet |
| `csv_ocr_validate_field` | valide un champ manuellement (humain) — marque `state="validated"` |
| `csv_ocr_commit` | si tous les `state="ok"` ou `state="validated"`, pousse vers `mcp-comtaria.invoice` |

### 5.3 Connectivité `mcp-csv` ↔ `mcp-comtaria`
- Phase 1 : `mcp-comtaria.extract_invoice_from_pdf` appelée **manuellement** par l'app via `mcp-comtaria` direct (pas via `mcp-csv`).
- Phase 2 : `csv_ocr_*` orchestre le pipeline PaddleOCR + persiste dans `mcp-comtaria.invoice.ai_extracted_json`.

### 5.4 Tests d'intégration
- Photos réelles Bon-Air (`/tmp/bonair-factures/*.jpg`) → matrice score par champ → seuil configuré.
- Photos dégradées (scanner dark +30°) → garantie qu'un humain est requis.

---

## 6. Questions ouvertes (à trancher par Magus + DPO + CPA)

1. **Seuils par défaut** : accepter la table §2.1 + §2.2 + §2.3 telle quelle, ou ajustement cabinet par cabinet?
2. **Override** : `templates/companies/<id>.ocr.json` (filesystem) ou colonne SQL `cabinet.ocr_overrides`?
3. **`cabinet.ocr_overrides`** JSON vs table dédiée `ocr_threshold_policy(id, cabinet_id, template_id, key, value)` — à trancher si on veut du versionning / audit.
4. **Validation humaine** : canal (in-app, courriel, Mon dossier?) + SLA (≤24h ?) + délai d'alerte cabinet (D+1 ? D+3 ?).
5. **Rejet** : rejet OCR → image brute + cabinet confirme en différé. Combien de temps on garde l'image brute? (Proposition : 30 jours avant suppression automatique, mais Magus tranche.)
6. **Photo d'identité** : non-scope dans v0.1 (rognage document suffit). Loi 25 charge trop lourde si on attaque la reconnaissance faciale — confirmé par décisions antérieures.

---

## 7. Prochaine étape

1. PR #5 sur `feat/ocr-champs-required` — cette matrice en doc seul (pas de code).
2. Ping Magus + CPA désigné + DPO pour validation de la matrice §2.
3. Si OK : intégrer dans `mcp-csv` en `v0.3` (sous-feature `ocr`). Tests PaddleOCR sur photos réelles Bon-Air avant commit.

— *Striker (bot dev/ops) — 2026-07-22*

### Annexes — références croisées
- Mémoire Loi 25 : `k_2bec08d85e566813_f13fac7d97b51319`
- Mémoire PaddleOCR : `k_df04f86f321244af_ca85dd1efb37251f`
- Roadmap §3.2 OCR : `comptaria.ca/docs/strategy/10-bt-secretary-app-v0.1-roadmap.md` (patchée 2026-07-22)
- Matrice paie §2.11 : `comptaria.ca/docs/strategy/11-paye-destinataires-v0.1.md`
