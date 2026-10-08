# MEMORIA — <NOMBRE DEL PROYECTO>

> Memoria compartida del equipo. La consolida el orquestador (`/nueva-web`) tras cada gate.
> Las entradas crudas de cada agente viven en `./memoria/*.md` — este archivo es el estado
> vigente, no el historial. Ante conflicto entre este archivo y una entrada de `memoria/`,
> gana la entrada más reciente y este archivo se corrige.

- **Slug:** `<slug>`
- **Creada:** <YYYY-MM-DD>
- **Última actualización:** <YYYY-MM-DD> por <agente/orquestador>
- **Fase actual:** 0 · Intake

---

## 1. Encargo en una línea

<Qué se está construyendo, para quién y con qué objetivo. Si hay cotización, el alcance
cotizado es el contrato: lo que no está ahí no se construye sin avisar.>

## 2. Estado por fase

| Fase | Agente | Estado | Entregable | Entrada de memoria |
|------|--------|--------|-----------|--------------------|
| 0 Venta | `sales-quoter` | PENDIENTE | `cotizacion.md` | `memoria/sales-quoter.md` |
| 1 Investigación | `brand-research` | PENDIENTE | `brand-brief.md` | `memoria/brand-research.md` |
| 1b Legal scoping | `legal-compliance` | PENDIENTE | `legal-scope.md` | `memoria/legal-compliance-scoping.md` |
| 2a Diseño | `design-system` | PENDIENTE | `DESIGN.md` | `memoria/design-system.md` |
| 2b Copy | `copywriter` | PENDIENTE | `copy-deck.md` | `memoria/copywriter.md` |
| 3 Construcción | `frontend-builder` | PENDIENTE | proyecto | `memoria/frontend-builder.md` |
| 4a QA | `qa-visual` | PENDIENTE | `qa-report.md` | `memoria/qa-visual.md` |
| 4b SEO | `seo-optimizer` | PENDIENTE | `seo-report.md` | `memoria/seo-optimizer.md` |
| 4c GEO | `geo-optimizer` | PENDIENTE | `geo-report.md` | `memoria/geo-optimizer.md` |
| 4d Legal producción | `legal-compliance` | PENDIENTE | `legal-report.md` | `memoria/legal-compliance-produccion.md` |
| 5 Deploy | `deploy-engineer` | PENDIENTE | `deploy-report.md` | `memoria/deploy-engineer.md` |
| 6 Google | `google-specialist` | N/A | `google-report.md` | `memoria/google-specialist.md` |

Estados: PENDIENTE · EN CURSO · COMPLETADO · PARCIAL · BLOQUEADO · N/A

## 3. Decisiones vigentes (no se vuelven a discutir)

| # | Decisión | Quién la tomó | Por qué | A quién ata |
|---|----------|---------------|---------|-------------|
| | | | | |

## 4. Descartado (no reintentar sin motivo nuevo)

| Qué se descartó | Quién | Motivo |
|-----------------|-------|--------|
| | | |

## 5. Hechos verificados del cliente y del mercado

| Dato | Valor | Fuente | Fecha |
|------|-------|--------|-------|
| | | | |

> Solo datos comprobados. Lo no verificado va en la sección 6, nunca aquí.

## 6. Pendientes de cliente (bloquean entrega)

| Dato / activo | Lo necesita | Bloquea | Estado |
|---------------|-------------|---------|--------|
| | | | |

## 7. Riesgos y avisos abiertos

| Riesgo | Severidad | Reportado por | Acción |
|--------|-----------|---------------|--------|
| | BLOQUEANTE / MAYOR / MENOR | | |

## 8. Bitácora de gates

| Fecha | Fase | Gate | Resultado | Nota |
|-------|------|------|-----------|------|
| | | | PASA / FALLA | |
