#!/usr/bin/env bash
# Sincroniza los toolkits clonados (the-architect, claude-webkit, gsap-skills,
# hyperframes, google-skills) hacia el .claude/ de la carpeta padre, para que todo
# funcione desde aquí. Re-ejecutar después de un `git pull` en cualquiera de los repos.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCH="$ROOT/the-architect"
KIT="$ROOT/claude-webkit"

mkdir -p "$ROOT/.claude/commands" "$ROOT/.claude/agents" "$ROOT/.claude/skills"

# --- the-architect: comandos y agentes (copia con rutas absolutas) ---------
# Los archivos usan ${CLAUDE_PLUGIN_ROOT}, que solo resuelve instalado como
# plugin. Al copiarlos aquí lo sustituimos por la ruta absoluta del repo.
for f in "$ARCH"/commands/*.md; do
  sed "s|\${CLAUDE_PLUGIN_ROOT}|$ARCH|g" "$f" > "$ROOT/.claude/commands/$(basename "$f")"
done
for f in "$ARCH"/agents/*.md; do
  sed "s|\${CLAUDE_PLUGIN_ROOT}|$ARCH|g" "$f" > "$ROOT/.claude/agents/$(basename "$f")"
done

# --- the-architect: skill "architect" (copia con rutas absolutas) ----------
rm -rf "$ROOT/.claude/skills/architect"
mkdir -p "$ROOT/.claude/skills/architect"
for f in "$ARCH"/skills/architect/*; do
  if [ -f "$f" ]; then
    sed "s|\${CLAUDE_PLUGIN_ROOT}|$ARCH|g" "$f" > "$ROOT/.claude/skills/architect/$(basename "$f")"
  else
    cp -r "$f" "$ROOT/.claude/skills/architect/"
  fi
done

# --- gsap-skills: skills oficiales de GreenSock (symlinks) -----------------
# Activas: scrolltrigger (pedida) + core (fundamento del que depende).
# Para activar más (gsap-react, gsap-timeline, gsap-plugins, gsap-performance,
# gsap-utils, gsap-frameworks): añadirlas a GSAP_ACTIVE.
GSAP="$ROOT/gsap-skills"
GSAP_ACTIVE="gsap-core gsap-scrolltrigger"
if [ -d "$GSAP/skills" ]; then
  for name in $GSAP_ACTIVE; do
    d="$GSAP/skills/$name"
    [ -d "$d" ] || { echo "AVISO: no existe $d" >&2; continue; }
    target="$ROOT/.claude/skills/$name"
    [ -L "$target" ] && rm "$target"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "AVISO: $target existe y no es symlink; lo dejo intacto." >&2
      continue
    fi
    ln -s "$d" "$target"
  done
fi

# --- hyperframes: skills de HeyGen para render de video desde HTML ----------
# El repo trae 19 skills. Activas: el "core set" (router + dominio + media-use)
# más los 2 workflows de creación que usa el estudio. Para activar otro workflow
# (faceless-explainer, pr-to-video, embedded-captions, talking-head-recut,
# music-to-video, slideshow, general-video, remotion-to-hyperframes, figma):
# añadirlo a HF_ACTIVE y re-ejecutar este script.
HF="$ROOT/hyperframes"
HF_ACTIVE="hyperframes hyperframes-core hyperframes-animation hyperframes-keyframes \
hyperframes-creative hyperframes-cli hyperframes-registry media-use \
product-launch-video motion-graphics"
if [ -d "$HF/skills" ]; then
  for name in $HF_ACTIVE; do
    d="$HF/skills/$name"
    [ -d "$d" ] || { echo "AVISO: no existe $d" >&2; continue; }
    target="$ROOT/.claude/skills/$name"
    [ -L "$target" ] && rm "$target"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "AVISO: $target existe y no es symlink; lo dejo intacto." >&2
      continue
    fi
    ln -s "$d" "$target"
  done
fi

# --- scroll-world: landing cinemática con video IA scrubbeado por scroll ------
# Repo oso95/scroll-world (MIT). Una sola skill (`scroll-world`), symlink. La
# skill propia del estudio que la envuelve (`scroll-world-studio`) vive en
# .claude/skills/ directamente y NO se sincroniza desde aquí.
SW="$ROOT/scroll-world"
if [ -d "$SW/skills/scroll-world" ]; then
  target="$ROOT/.claude/skills/scroll-world"
  [ -L "$target" ] && rm "$target"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "AVISO: $target existe y no es symlink; lo dejo intacto." >&2
  else
    ln -s "$SW/skills/scroll-world" "$target"
  fi
fi

# --- google-skills: repo oficial google/skills (Apache-2.0, symlinks) -------
# El repo trae 130+ skills, casi todas de Google Cloud (GKE, BigQuery…) que el
# estudio no usa. Activas: las de Google Ads API, Data Manager (conversiones y
# audiencias), Google Analytics y el buscador de skills de Google. Para activar
# otra: añadir su ruta relativa bajo skills/ a GOOGLE_ACTIVE y re-ejecutar.
GOOGLE="$ROOT/google-skills"
GOOGLE_ACTIVE="ads/google-ads-api-quickstart ads/google-ads-api-account-diagnostics \
ads/google-ads-api-mcp-setup ads/data-manager-api-setup \
ads/data-manager-api-event-ingestion ads/data-manager-api-audience-ingestion \
analytics/google-analytics-admin-api-basics analytics/google-analytics-data-api-basics \
developers/finding-google-skills"
if [ -d "$GOOGLE/skills" ]; then
  for rel in $GOOGLE_ACTIVE; do
    d="$GOOGLE/skills/$rel"
    name="$(basename "$rel")"
    [ -d "$d" ] || { echo "AVISO: no existe $d" >&2; continue; }
    target="$ROOT/.claude/skills/$name"
    [ -L "$target" ] && rm "$target"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "AVISO: $target existe y no es symlink; lo dejo intacto." >&2
      continue
    fi
    ln -s "$d" "$target"
  done
fi

# --- claude-webkit: 13 skills (symlinks — se actualizan solas con git pull) -
for d in "$KIT"/.claude/skills/*/; do
  name="$(basename "$d")"
  target="$ROOT/.claude/skills/$name"
  [ -L "$target" ] && rm "$target"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "AVISO: $target existe y no es symlink; lo dejo intacto." >&2
    continue
  fi
  ln -s "${d%/}" "$target"
done

echo "OK — sincronizado:"
echo "  comandos:  $(ls "$ROOT/.claude/commands" | wc -l) archivos"
echo "  agentes:   $(ls "$ROOT/.claude/agents" | wc -l) archivos"
echo "  skills:    $(ls "$ROOT/.claude/skills" | wc -l) entradas"
