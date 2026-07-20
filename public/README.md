# comta_lm — site one-pager

Site web statique de comta_lm. Déployé sur Vercel via push GitHub.

## Stack
- HTML/CSS/JS vanilla (1 seul fichier `index.html`)
- Auto-hébergé GLM 5.2 sur OVHcloud Beauharnois
- Conformité Loi 25 documentée article par article

## Déploiement
```bash
# 1. Push sur GitHub
git add -A
git commit -m "Site refresh"
git push origin main

# 2. Vercel déploie automatiquement (~30s)
# 3. Vérifier le live URL
curl -s https://comta-lm-site.vercel.app/ | head -5
```

## Sections (ordre)
1. NAV
2. Hero (titre + LLM-compta visual)
3. `#produit` — Le problème (3 cartes)
4. `#agents` — 8 agents orchestration
5. Positionnement (3 piliers : souveraineté / transparence / responsabilité)
6. `#hebergement` — Conformité Loi 25 (4 articles)
7. `#tarifs` — 3 tiers (Solo / Cabinet / Firme)
8. `#faq` — 6 questions détaillées
9. `#contact` — CTA démo
10. Footer

## Vocabulaire sacré (SEO + CAI)
- "CPA garde sa signature" (pas "remplace ton comptable")
- "Auto-hébergé / 100% Montréal" (pas "souverain")
- "GLM 5.2 open-source" (pas "juste une IA")
- "Zéro fallback, pas d'API US" (pas "sécurisé")
- "Plans envisagés" / "indicatif" (jamais "à partir de X" sans astérisque)

## Modifications fréquentes
- Changer le placeholder `comta_lm` quand le nom officiel est choisi
- Mettre à jour `hello@comta-lm.ca` quand le domaine est possédé
- Remplacer le SVG inline du favicon si logo défini
