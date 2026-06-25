# TaxiTracker — Developer Context

## What it is
TaxiTracker is a TiddlyWiki 5 plugin for a London black cab driver. The entire
app lives in a single `.html` TiddlyWiki file on an Android phone (Tiddloid).
There is no server. Persistence is TW5's built-in auto-save to local storage /
file. Telegram is used as a one-way backup channel.

## Repository layout
```
taxitracker-v6.3.2.json   — last stable release before v6.4 (full wiki, ~64 tiddlers)
taxitracker-v6.4.json     — full 64-tiddler release (auto-save throttle fix + wakelock)
taxitracker-v6.5.json     — full 69-tiddler release (split transactions — current)
build/build_v6_4.py       — patch script v6.3.2 → v6.4 (outputs 2-tiddler incremental patch)
build/build_v6_5.py       — patch script v6.4 → v6.5 (outputs full 69-tiddler wiki)
```

## Plugin architecture
The plugin consists of three tiddlers, patched by the build scripts:

| Tiddler | Role |
|---|---|
| `$:/plugins/taxitracker/startup.js` | All business logic: `recordTxn`, `endShift`, `saveShift`, `updateTxn`, `freezeInvoice`, Telegram, split handling |
| `$:/plugins/taxitracker/messages.js` | TW5 widget-message handlers (`tt-record-txn`, `tt-end-shift`, `tt-cancel-split`, etc.) — bridge between wikitext buttons and JS |
| `$:/taxitracker/Taxi Tracker` | All wikitext: the UI, macros, forms, action widgets |

Plus ~60 supporting tiddlers (CSS, state tiddlers, templates, config).

## How to make changes
1. Edit `build/build_v6_N.py` — patches are string replacements with `patch(old, new, label)`
2. Run: `python3 build/build_v6_N.py` from the repo root
3. All steps print `OK`; the VERIFICATION block at the end shows key checks
4. The script writes `taxitracker-v6.N.json` — import this into TiddlyWiki to test
5. Commit both the script and the output JSON

## v6.5 — Split transactions (current)
A "split" is one fare paid across multiple payment types (e.g. part card, part
cash). Key additions:

**State tiddlers** (cleared on complete/cancel):
- `$:/taxitracker/state/split-group` — UUID shared by all legs
- `$:/taxitracker/state/split-leg-count` — legs recorded so far
- `$:/taxitracker/state/split-remaining` — balance left (displayed as `0.00` when done)
- `$:/taxitracker/state/split-total` / `split-allocated`

**JS (startup.js):**
- `clearSplitLeg()` — resets per-leg scratch fields (keeps group/remaining)
- `recordTxn()` — when `split-group` active, tags leg with group UUID, decrements remaining, does NOT auto-complete
- `endShift()` — `splitCashList` aggregates split legs for the daily summary

**Wikitext macros:**
- `tt-toggle-split` — shows/hides split amount input
- `tt-cancel-split` — deletes all already-recorded legs for the group (via `<$action-deletetiddler>`), then clears state
- `tt-clear-form` — clears form + split state (called by "Complete split ✓" button)

**Behaviour:**
- Cancel mid-split: all legs deleted, state cleared
- Complete split: user taps "Complete split ✓" (visible only when remaining = `0.00`)
- No auto-complete on zero

## Branch
Active development: `claude/fix-taxitracker-wikitext-WchGb`

## Key constraints
- Target device is Android / Tiddloid — no Node, no build tools on device
- Must be a single importable JSON file
- Auto-save uses `tm-auto-save-wiki` dispatch — must not fire on every keystroke (caused OOM in v6.3)
- Wikitext uses TW5 action widgets (`<$action-setfield>`, `<$action-deletetiddler>`, etc.) not JavaScript
