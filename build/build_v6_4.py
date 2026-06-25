import json, re

SRC = '/home/user/TaxiTracker-/taxitracker-v6.3.2.json'
DST = '/home/user/TaxiTracker-/taxitracker-v6.4-patch.json'

with open(SRC, 'r', encoding='utf-8') as f:
    tids = json.load(f)

by_title = {t['title']: t for t in tids}

def patch(text, old, new, label):
    count = text.count(old)
    if count == 0:
        raise ValueError(f'PATCH FAILED [{label}]: string not found')
    if count > 1:
        raise ValueError(f'PATCH FAILED [{label}]: {count} occurrences (expected 1)')
    return text.replace(old, new, 1)

# ---- Patch startup.js ----
su = by_title['$:/plugins/taxitracker/startup.js']['text']
print(f"startup.js original length: {len(su)}")

# A1: Remove auto-save dispatch from saveTiddler
su = patch(su,
    "\n    $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n  }\n  function getTiddler",
    "\n  }\n  function getTiddler",
    'A1-remove-saveTiddler-dispatch')
print("A1 OK")

# A2: Add dispatch after recordTxn's clearScratch()
su = patch(su,
    "clearScratch();\n      var cnt=",
    "clearScratch();\n      $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n      var cnt=",
    'A2-recordTxn-dispatch')
print("A2 OK")

# A3: Add dispatch in saveShift before return
su = patch(su,
    "sendToTelegram(fmtShiftMsg(fields));\n      return {ok:true,date:date};",
    "sendToTelegram(fmtShiftMsg(fields));\n      $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n      return {ok:true,date:date};",
    'A3-saveShift-dispatch')
print("A3 OK")

# A4: Add dispatch in endShift before return
su = patch(su,
    "downloadBackup(shiftDate);\n      return {ok:true};\n    },",
    "downloadBackup(shiftDate);\n      $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n      return {ok:true};\n    },",
    'A4-endShift-dispatch')
print("A4 OK")

# A5: Add dispatch in freezeInvoice before return
su = patch(su,
    "return {ok:true,title:frozenTitle,version:nextV};\n    },",
    "$tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n      return {ok:true,title:frozenTitle,version:nextV};\n    },",
    'A5-freezeInvoice-dispatch')
print("A5 OK")

# A6: Add dispatch in updateTxn(title) after clearScratch()
# Anchor on the unique closing to avoid ambiguity
su = patch(su,
    "clearScratch();\n      return {ok:true};\n    }\n\n  }; // end window.TaxiTracker",
    "clearScratch();\n      $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n      return {ok:true};\n    }\n\n  }; // end window.TaxiTracker",
    'A6-updateTxn-dispatch')
print("A6 OK")

# A7: Remove dead old updateTxn(id,payment,...) block
old_block = (
    "\n\n    updateTxn: function(id,payment,meter,charge,overring,cashin,gratuity,notes) {\n"
    "      var existing=getTiddler(id);\n"
    "      if(!existing) return {ok:false,msg:'Record not found'};\n"
    "      saveTiddler({\n"
    "        title:id, tags:existing.tags,\n"
    "        'txn-date':existing['txn-date'], 'txn-time':existing['txn-time'],\n"
    "        payment:payment,\n"
    "        meter:String(parseInt(meter,10)/100||0),\n"
    "        charge:String(parseFloat(charge)||0),\n"
    "        overring:String(parseFloat(overring)||0),\n"
    "        cashin:String(parseFloat(cashin)||0),\n"
    "        gratuity:String(parseFloat(gratuity)||0),\n"
    "        notes:String(notes||'').trim()\n"
    "      });\n"
    "      sendToTelegram('✏️ '+fmtTxnMsg(getTiddler(id)));\n"
    "      return {ok:true};\n"
    "    },\n"
)
if old_block in su:
    su = su.replace(old_block, '\n', 1)
    print("A7 OK (exact match)")
else:
    # Regex fallback
    su_new, n = re.subn(
        r'\n\n    updateTxn: function\(id,payment,meter,charge,overring,cashin,gratuity,notes\)'
        r'\s*\{(?:[^{}]|\{[^{}]*\})*\},\n',
        '\n',
        su, count=1
    )
    if n == 1:
        su = su_new
        print("A7 OK (regex fallback)")
    else:
        # Show what's around updateTxn: function(id,
        idx = su.find('updateTxn: function(id,')
        print(f"A7 WARNING: could not remove old updateTxn block (n={n}, idx={idx})")
        if idx >= 0:
            print("Context around it:")
            print(repr(su[idx-10:idx+300]))

# ---- Patch C: wakelock state ----
if '$:/taxitracker/state/wakelock' in by_title:
    by_title['$:/taxitracker/state/wakelock']['text'] = ''
    print("C OK: wakelock cleared")
else:
    # Create it
    by_title['$:/taxitracker/state/wakelock'] = {
        'title': '$:/taxitracker/state/wakelock',
        'text': ''
    }
    print("C OK: wakelock tiddler created (was absent)")

by_title['$:/plugins/taxitracker/startup.js']['text'] = su

# ---- Verification ----
dispatches = re.findall(r"dispatchEvent\(\{type:'tm-auto-save-wiki'\}\)", su)
print(f"\n=== VERIFICATION ===")
print(f"startup.js final length:   {len(su)}  (expected ~24,450–24,600)")
print(f"Auto-save dispatches:       {len(dispatches)}  (expected 6)")

st_start = su.find('function saveTiddler')
saveTiddler_has_dispatch = 'dispatchEvent' in su[st_start:st_start+300] if st_start >= 0 else '?'
print(f"saveTiddler has dispatch:   {saveTiddler_has_dispatch}  (expected False)")

print(f"old updateTxn removed:      {'updateTxn: function(id,payment' not in su}  (expected True)")
print(f"new updateTxn present:      {'updateTxn: function(title)' in su}  (expected True)")

cs_idx = su.find('clearScratch')
rd_ok = 'dispatchEvent' in su[cs_idx:cs_idx+200] if cs_idx >= 0 else False
print(f"recordTxn dispatch present: {rd_ok}  (expected True)")

# Dispatch locations for audit
print(f"\nDispatch positions:")
for m in re.finditer(r"dispatchEvent\(\{type:'tm-auto-save-wiki'\}\)", su):
    ctx_start = max(0, m.start()-60)
    print(f"  [{m.start()}] ...{repr(su[ctx_start:m.start()+50])}...")

# ---- Write output ----
output_tids = [
    by_title['$:/plugins/taxitracker/startup.js'],
    by_title['$:/taxitracker/state/wakelock'],
]

with open(DST, 'w', encoding='utf-8') as f:
    json.dump(output_tids, f, ensure_ascii=False, indent=2)

print(f"\nWrote {DST}")
print(f"Tiddlers in output: {len(output_tids)}")
