---
title: "Almeria AH"
locale: en
baseSlug: "almeriaah"
year: "2026"
role: "ML Engineer / Data Scientist"
description: "Quantitative pipeline to decide whether there is real predictive edge in Almeria's vegetable market prices. Daily scrapers, 26 time series, 6 competing models and walk-forward expanding window with a binary PASS/FAIL criterion."
problem: "Almeria is Europe's greenhouse, but auction-house vegetable prices move in informational fog. Before investing in a prediction product, I needed to answer a binary question: can a naive baseline be beaten using public data?"
solution: "I built an end-to-end research pipeline: four daily scrapers (fhalmeria, ASAJA, AEMET, hortoinfo), idempotent normalization in SQLite, lag + weather + news features, six competing models (Naive, SeasonalNaive, ARIMA, LGBM, LGBMMeteo, LGBMRich) and walk-forward expanding window with point and interval metrics. The go/no-go criterion is explicit: beat the baseline by ≥15% MAE."
results:
  - "26 time series (5 products × 6 auction houses) since January 2025"
  - "6 competing models with walk-forward expanding window"
  - "Point metrics (MAE/RMSE/MAPE) + interval metrics (pinball, 80/95% coverage)"
  - "Explicit go/no-go criterion: ≥15% MAE improvement vs naive baseline"
motivation: "I wanted a project where methodological rigor was the feature, not the decoration. If the answer is PASS there's a product in 2027; if it's FAIL, I archive the hypothesis with data and avoid repeating the experiment out of forgetfulness years later."
challenges: "The trickiest part was avoiding leakage in walk-forward: each window can only see data available at its actual point in time, forcing feature versioning (forecast vs realized weather, previous day's news, etc.). And the fhalmeria price-board scrapers change format every few weeks."
learnings: "I learned that a well-measured naive baseline is the best intellectual-honesty tool for an ML project: if you can't beat it consistently in walk-forward, you don't have a product. And that writing a binary PASS/FAIL criterion before the experiment saves months of self-deception."
context: "Research in its final phase. Go/no-go verdict pending before 2026-09-30. Not a product in 2026; the output is a public verdict document."
tags: ["Python", "LightGBM", "Darts", "ML"]
heroImage: "/projects/almeriaah/desktop.png"
order: 8
tier: more
---

## The Challenge

Almeria's auction-house vegetable prices fluctuate daily based on weather, supply and sector news. Before investing in building a prediction product, the answer had to be rigorous: is this even predictable? The question had to be binary, with a quantitative criterion, and FAIL had to be a real possibility.

## The Solution

I designed a reproducible pipeline: four daily scrapers (fhalmeria, ASAJA, AEMET, hortoinfo), idempotent normalization in SQLite with dedup, features built from lags + moving averages + weather + calendar + news, and six competing models. The backtest uses walk-forward expanding window — each window only sees data available at its true point in time. The final decision is automatic: if no model beats naive by ≥15% MAE, the verdict is FAIL.

## Technical Details

- **CLI:** Typer with scrape, backfill, analysis, backtest, forecast commands
- **Scraping:** Four sources (HTML, AJAX, JSON API, RSS) with normalization
- **DB:** SQLite with prices / weather_daily / news tables
- **Models:** Naive, SeasonalNaive, ARIMA (Darts), LGBM, LGBMMeteo, LGBMRich
- **Backtest:** Walk-forward expanding with configurable horizon (1-14 days)
- **Metrics:** MAE/RMSE/MAPE point + pinball loss + interval coverage
