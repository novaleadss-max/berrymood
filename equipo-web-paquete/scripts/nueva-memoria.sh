#!/usr/bin/env bash
# Crea la memoria compartida de un proyecto del estudio.
# Uso: bash <workspace>/scripts/nueva-memoria.sh <slug> ["Nombre del proyecto"]
set -euo pipefail

WS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLUG="${1:?Falta el slug del proyecto. Uso: nueva-memoria.sh <slug> [\"Nombre\"]}"
NOMBRE="${2:-$SLUG}"
DOCS="$WS/sites/$SLUG/docs"
HOY="$(date +%Y-%m-%d)"

mkdir -p "$DOCS/memoria"

if [[ -f "$DOCS/MEMORIA.md" ]]; then
  echo "YA EXISTE: $DOCS/MEMORIA.md — no se sobrescribe."
  echo "Entradas actuales:"
  ls -1 "$DOCS/memoria/" 2>/dev/null || echo "  (ninguna)"
  exit 0
fi

sed -e "s|<NOMBRE DEL PROYECTO>|$NOMBRE|" \
    -e "s|<slug>|$SLUG|" \
    -e "s|<YYYY-MM-DD> por <agente/orquestador>|$HOY por orquestador|" \
    -e "s|<YYYY-MM-DD>|$HOY|" \
    "$WS/templates/MEMORIA.md" > "$DOCS/MEMORIA.md"

cat > "$DOCS/memoria/README.md" <<'EOF'
# Entradas de memoria del equipo

Un archivo por agente, con nombre fijo. **Cada agente escribe SOLO su propio archivo.**
Nadie edita el archivo de otro: varios agentes corren en paralelo y sobrescribir la
entrada ajena borra su trabajo.

Si un agente se relanza, añade `### Ronda N` al final de su propio archivo — no borra
lo anterior.

Archivos esperados:
sales-quoter.md · brand-research.md · legal-compliance-scoping.md · design-system.md ·
copywriter.md · frontend-builder.md · qa-visual.md · seo-optimizer.md · geo-optimizer.md ·
legal-compliance-produccion.md · deploy-engineer.md · google-specialist.md

El estado consolidado vive un nivel arriba, en `../MEMORIA.md`.
EOF

echo "Memoria creada:"
echo "  $DOCS/MEMORIA.md"
echo "  $DOCS/memoria/  (entradas por agente)"
