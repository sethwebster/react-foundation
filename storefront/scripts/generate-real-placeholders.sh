#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "Missing .env file with OPENAI_API_KEY."
  exit 1
fi

set -a
source .env
set +a

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is not set."
  exit 1
fi

MODEL="gpt-image-1"
echo "Using OpenAI image model: $MODEL (locked)"

LOGO_DIRECTIVE="Use the official React Foundation logo exactly as shown in /Users/sethwebster/Downloads/react_logo_dark.svg; do not change the geometry or layout—only adjust color values to suit the scene."

OUTPUT_DIR="public/placeholders"
mkdir -p "$OUTPUT_DIR"

TARGET_FILE="${1:-}"

while IFS=$'\t' read -r filename target_size prompt; do
  [[ -z "$filename" ]] && continue
  if [[ -n "$TARGET_FILE" && "$filename" != "$TARGET_FILE" ]]; then
    continue
  fi

  echo "Generating $filename..."

  tmp_file="$(mktemp).png"
  attempt=0
  success=0

  while [[ $attempt -lt 3 ]]; do
    attempt=$((attempt + 1))
    full_prompt="${prompt} ${LOGO_DIRECTIVE}"

    response="$(curl -sS -X POST "https://api.openai.com/v1/images/generations" \
      -H "Authorization: Bearer ${OPENAI_API_KEY}" \
      -H "Content-Type: application/json" \
      -d "$(jq -n --arg prompt "$full_prompt" --arg model "$MODEL" '{model:$model, prompt:$prompt, size:"1024x1024"}')")"

    if jq -e '.error' >/dev/null 2>&1 <<<"$response"; then
      echo "Attempt $attempt failed for $filename: $(jq -r '.error.message' <<<"$response")" >&2
      sleep 2
      continue
    fi

    if jq -e '.data[0].b64_json' >/dev/null 2>&1 <<<"$response"; then
      jq -r '.data[0].b64_json' <<<"$response" | base64 --decode > "$tmp_file"
    elif jq -e '.data[0].url' >/dev/null 2>&1 <<<"$response"; then
      image_url="$(jq -r '.data[0].url' <<<"$response")"
      curl -sS "$image_url" -o "$tmp_file"
    else
      echo "Attempt $attempt failed for $filename: missing image payload." >&2
      sleep 2
      continue
    fi
    convert "$tmp_file" -resize "${target_size}^" -gravity center -extent "$target_size" "$OUTPUT_DIR/$filename"
    success=1
    break
  done

  rm -f "$tmp_file"

  if [[ $success -ne 1 ]]; then
    echo "Skipping $filename after repeated failures." >&2
  fi
done <<'EOF'
collection-atelier.png	800x640	Photorealistic studio product shot of a premium techwear ensemble inspired by the React Foundation Atelier: charcoal bomber jacket with subtle React swirl embossing, matching tapered joggers, and a glass display case of enamel pins, all lit with soft rim lighting against a gradient backdrop.
collection-conference.png	800x640	Lifestyle flat lay of modern conference swag for the React Foundation: teal hoodie with embroidered React atom, navy tote bag, stainless water bottle, notebooks, enamel pins, and an event badge, arranged on a textured desk with natural daylight.
collection-core.png	800x640	Minimalist e-commerce product photo of everyday React Foundation essentials: neatly folded heather gray t-shirt, deep navy hoodie, black baseball cap with stitched React atom, and a pair of stickers, on a clean white tabletop with soft shadowing.
drop-fiber.png	640x640	High-end product portrait of a limited edition React “Fiber” technical jacket on a mannequin: jet-black performance fabric with matte and satin panelling, the official React logo debossed tone-on-tone across the chest in black on black, angular quilting, reflective piping, shot in a dim studio with dramatic rim light.
drop-tee-01.png	480x400	Front-on product photo of a matte black React Foundation tee on a hanger, featuring a vibrant neon gradient React atom centered on the chest, photographed against a softly lit slate backdrop.
drop-tee-02.png	480x400	Studio shot of a bright cobalt React tee displayed on a torso form, showcasing a minimalist white React outline logo with balance text, evenly lit with gentle shadows.
drop-tee-03.png	480x400	Lifestyle vignette of a soft cream React tee folded on a wooden surface, featuring a vintage-inspired navy React Foundation crest printed over the heart, with a pair of round glasses placed nearby.
drop-tee-04.png	480x400	Photorealistic shot of a charcoal gray athletic React tee draped over a display block, highlighting a diagonal set of cyan micro React icons cascading across the fabric, captured with moody contrast lighting.
EOF

echo "All placeholders generated in $OUTPUT_DIR."
