# Tile Prompt Generator

Tile-Prompts is a static site that builds prompts by drawing tiles from content sets.

## Tile types

- Roles (many)
- Traits (many)
- Situations (many)
- Place (one)
- Task (one)

## Controls

- Left-click a tile to remove it
- Right-click a tile to reroll it
- Character buttons: reroll, add tile, clear tiles, delete character
- Meta buttons: reroll, add tile (Place/Task/Situation), clear tiles, reset
- Use the Sets tab to enable/disable content packs

## Adding content

Each tile type has a folder containing `.set` files and an `index.json` manifest listing them:

- `roles/`
- `traits/`
- `situations/`
- `places/`
- `tasks/`

Each non-empty, non-`#` line is an entry. The first character is the power-tier marker (`<`, `-`, `=`, `+`, `>`), and the rest of the line is the phrase.

## Running locally

Because the site fetches `.set` files, it must be served over HTTP (not opened as `file://`).

Example:

```bash
python -m http.server
```
