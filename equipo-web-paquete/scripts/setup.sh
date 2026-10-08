#!/usr/bin/env bash
# Instala el workspace del equipo web en ESTA máquina:
#   1. clona los toolkits de terceros (fijados a los commits con los que se probó el equipo),
#   2. resuelve las rutas absolutas del workspace en agentes, skills y comandos,
#   3. crea .env y .mcp.json a partir de los ejemplos (si no existen),
#   4. sincroniza symlinks/copias hacia .claude/ (scripts/sync-toolkits.sh).
#
# Uso:  bash <ruta-al-workspace>/scripts/setup.sh [--latest]
#   --latest  clona la rama por defecto de cada toolkit en vez del commit fijado.
# Es idempotente: se puede volver a correr; no sobrescribe .env ni .mcp.json existentes.
set -euo pipefail

WS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN=1
[[ "${1:-}" == "--latest" ]] && PIN=0

# nombre|url|commit (commits con los que el equipo se probó; --latest los ignora)
TOOLKITS=(
  "the-architect|https://github.com/Hainrixz/the-architect.git|774a02278f4fa99cc44d484911007d1ba29318ab"
  "claude-webkit|https://github.com/Hainrixz/claude-webkit.git|6f80d25d855dd444035c4d2a5f9d60959a47c049"
  "gsap-skills|https://github.com/greensock/gsap-skills.git|aed9cfd3277740755f6bfc1155c7aa645403b760"
  "hyperframes|https://github.com/heygen-com/hyperframes.git|13f9af1cec4d28d72524203baac0153ae0b0d80e"
  "google-skills|https://github.com/google/skills.git|0dad3f947e45a736060e524bbefa3eab692809f9"
  "scroll-world|https://github.com/oso95/scroll-world|71cc36d3bb150248ae36a2c552f9cbf88802a79c"
)

echo "Workspace: $WS"
for bin in git node npm; do
  command -v "$bin" >/dev/null || { echo "FALTA $bin en el PATH. Instálalo y vuelve a correr." >&2; exit 1; }
done

# --- 1. toolkits ------------------------------------------------------------
for entry in "${TOOLKITS[@]}"; do
  IFS='|' read -r name url sha <<<"$entry"
  dest="$WS/$name"
  if [[ -d "$dest/.git" ]]; then
    echo "· $name ya clonado — se deja como está (actualízalo con git pull si quieres)."
    continue
  fi
  echo "· clonando $name …"
  if [[ $PIN -eq 1 ]]; then
    git init -q "$dest"
    git -C "$dest" remote add origin "$url"
    if git -C "$dest" fetch -q --depth 1 origin "$sha" 2>/dev/null; then
      git -C "$dest" checkout -q FETCH_HEAD
    else
      echo "  (el servidor no permite fetch por SHA; clon completo y checkout del commit)"
      rm -rf "$dest"
      git clone -q "$url" "$dest"
      git -C "$dest" checkout -q "$sha"
    fi
  else
    git clone -q --depth 1 "$url" "$dest"
  fi
done

# --- 2. rutas absolutas -----------------------------------------------------
# Los archivos del paquete llevan el marcador __WORKSPACE__ donde hace falta una ruta
# absoluta (los agentes corren Bash con cwd no garantizado). Se sustituye una sola vez.
FILES=()
while IFS= read -r f; do FILES+=("$f"); done < <(grep -rl --exclude-dir=node_modules --exclude-dir=.git \
  --exclude='*.example' '__WORKSPACE__' "$WS/CLAUDE.md" "$WS/.claude" "$WS/vendor" 2>/dev/null || true)
if (( ${#FILES[@]} )); then
  # perl -pi en vez de sed -i: funciona igual en Linux (GNU) y macOS (BSD)
  for f in "${FILES[@]}"; do WS_PATH="$WS" perl -pi -e 's/__WORKSPACE__/$ENV{WS_PATH}/g' "$f"; done
  echo "· rutas resueltas en ${#FILES[@]} archivo(s)."
else
  echo "· rutas ya resueltas."
fi

# --- 3. secretos y MCP ------------------------------------------------------
if [[ ! -f "$WS/.env" ]]; then
  cp "$WS/.env.example" "$WS/.env"
  echo "· creado .env (vacío). Rellena API_KEY_21ST si vas a usar 21st.dev."
fi
if [[ ! -f "$WS/.mcp.json" ]]; then
  WS_PATH="$WS" perl -pe 's/__WORKSPACE__/$ENV{WS_PATH}/g' "$WS/.mcp.json.example" > "$WS/.mcp.json"
  echo "· creado .mcp.json (servidor magic-21st; lee la key desde .env)."
fi

# --- 4. sincronizar hacia .claude/ ------------------------------------------
bash "$WS/scripts/sync-toolkits.sh"

cat <<MSG

Listo. Siguientes pasos (una sola vez, en una sesión interactiva de Claude Code abierta en $WS):
  1. Plugins que usan los agentes (opcionales, ver README.md § Plugins):
       /plugin marketplace add Hainrixz/claude-seo-ai   →  /plugin install claude-seo-ai@claude-seo-ai
       /plugin marketplace add nowork-studio/toprank    →  /plugin install toprank@nowork-studio
  2. Vercel CLI autenticado para el deploy:  npx vercel login
  3. Prueba:  /nueva-web "Nombre del negocio, giro, objetivo de la página"
MSG
