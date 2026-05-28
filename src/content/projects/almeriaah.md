---
title: "Almeria AH"
locale: es
year: "2026"
role: "ML Engineer / Data Scientist"
description: "Pipeline cuantitativo para decidir si existe edge predictivo real en los precios de hortalizas almerienses. Scrapers diarios, 26 series temporales, 6 modelos en competencia y walk-forward expanding window con criterio binario PASS/FAIL."
problem: "Almería es el huerto de Europa pero los precios de hortalizas en alhóndiga se mueven en niebla informativa. Antes de invertir en un producto de predicción, había que responder una pregunta binaria: ¿se puede batir el baseline naive con datos públicos?"
solution: "Construí un pipeline de investigación end-to-end: cuatro scrapers diarios (fhalmeria, ASAJA, AEMET, hortoinfo), normalización idempotente en SQLite, features de lags + meteo + noticias, seis modelos en competencia (Naive, SeasonalNaive, ARIMA, LGBM, LGBMMeteo, LGBMRich) y walk-forward expanding window con métricas punto e intervalos. El criterio go/no-go es explícito: batir baseline en MAE ≥15%."
results:
  - "26 series temporales (5 productos × 6 alhondigas) desde enero 2025"
  - "6 modelos en competencia con walk-forward expanding window"
  - "Métricas punto (MAE/RMSE/MAPE) + intervalos (pinball, coverage 80/95%)"
  - "Criterio go/no-go explícito: mejora MAE ≥15% vs baseline naive"
motivation: "Quería un proyecto donde el rigor metodológico fuese la feature, no la decoración. Si la respuesta es PASS hay producto en 2027; si es FAIL, archivo la hipótesis con datos y evito repetir el experimento por olvido en años futuros."
challenges: "La parte más delicada fue evitar leakage en el walk-forward: cada ventana solo puede ver datos disponibles en su instante real, lo que obliga a versionar features (meteo predicha vs realizada, noticias del día anterior, etc.). Y los scrapers de la pizarra de fhalmeria cambian de formato cada pocas semanas."
learnings: "Aprendí que un baseline naive bien medido es la mejor herramienta de honestidad intelectual de un proyecto ML: si no lo bates de forma consistente en walk-forward, no tienes producto. Y que tener un criterio binario PASS/FAIL escrito antes del experimento te ahorra meses de auto-engaño."
context: "Investigación en fase final. Veredicto go/no-go pendiente antes del 2026-09-30. No es producto en 2026; el output es un documento de veredicto público."
tags: ["Python", "LightGBM", "Darts", "ML"]
heroImage: "/projects/almeriaah/desktop.png"
order: 8
tier: more
---

## El Reto

Los precios de hortalizas en alhóndiga almerienses fluctúan a diario por meteo, oferta y noticias del sector. Antes de invertir en construir un producto de predicción había que responder con rigor: ¿es predecible? La pregunta tenía que ser binaria, con criterio cuantitativo, y la respuesta tenía que poder ser FAIL.

## La Solución

Diseñé un pipeline reproducible: cuatro scrapers diarios (fhalmeria, ASAJA, AEMET, hortoinfo), normalización idempotente en SQLite con dedup, features lags + medias móviles + meteo + calendario + noticias, y seis modelos en competencia. El backtest usa walk-forward expanding window — cada ventana solo ve datos disponibles en su instante real. La decisión final es automática: si ningún modelo bate al naive en MAE ≥15%, el veredicto es FAIL.

## Detalles Técnicos

- **CLI:** Typer con comandos scrape, backfill, analysis, backtest, forecast
- **Scraping:** Cuatro fuentes (HTML, AJAX, JSON API, RSS) con normalización
- **BD:** SQLite con tablas prices / weather_daily / news
- **Modelos:** Naive, SeasonalNaive, ARIMA (Darts), LGBM, LGBMMeteo, LGBMRich
- **Backtest:** Walk-forward expanding con horizonte configurable (1-14 días)
- **Métricas:** MAE/RMSE/MAPE punto + pinball loss + coverage intervalos
