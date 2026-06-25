import json, re, copy

SRC = '/home/user/TaxiTracker-/taxitracker-v6.4.json'
DST = '/home/user/TaxiTracker-/taxitracker-v6.5.json'

with open(SRC, 'r', encoding='utf-8') as f:
    tids = json.load(f)

by_title = {t['title']: t for t in tids}

def patch(text, old, new, label):
    count = text.count(old)
    if count == 0:
        raise ValueError(f'PATCH FAILED [{label}]: string not found\nSearched for: {repr(old[:80])}')
    if count > 1:
        raise ValueError(f'PATCH FAILED [{label}]: {count} occurrences (expected 1)')
    return text.replace(old, new, 1)

# ============================================================
# 1. STATUS BAR
# ============================================================
sb = by_title['$:/taxitracker/status-bar']['text']

sb = patch(sb,
    "''Shift: '' {{$:/taxitracker/active-shift-date}} | ''Transactions: '' {{{ [tag[Transaction]tag[shift_$(asdbar)$]count[]] }}}",
    "''Shift: '' {{$:/taxitracker/active-shift-date}}<$list filter=\"[[$:/taxitracker/state/split-group]get[text]minlength[1]]\" emptyMessage=\"\"> · <span class=\"tt-split-status\">Split · leg {{$:/taxitracker/state/split-leg-count}} done · £{{$:/taxitracker/state/split-remaining}} remaining</span></$list>",
    'status-bar-remove-counter')

by_title['$:/taxitracker/status-bar']['text'] = sb
print("STATUS BAR OK")

# ============================================================
# 2. TAXI TRACKER MAIN TIDDLER
# ============================================================
tt = by_title['Taxi Tracker']['text']

# 2a. Remove old split type macros (including tt-toggle-split) + replace with
#     simplified tt-toggle-split + tt-cancel-split
OLD_SPLIT_MACROS = (
    "\n\\define tt-set-split-1-cash()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-1-type\" $field=\"text\" $value=\"Cash\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-1-card()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-1-type\" $field=\"text\" $value=\"Card\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-1-account()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-1-type\" $field=\"text\" $value=\"Account\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-2-cash()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-2-type\" $field=\"text\" $value=\"Cash\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-2-card()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-2-type\" $field=\"text\" $value=\"Card\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-2-account()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-2-type\" $field=\"text\" $value=\"Account\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-3-cash()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"Cash\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-3-card()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"Card\"/>\n"
    "\\end\n"
    "\n\\define tt-set-split-3-account()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"Account\"/>\n"
    "\\end\n"
    "\n\\define tt-toggle-split()\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-mode]get[text]match[yes]]\" emptyMessage=\"\">\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-mode\" $field=\"text\" $value=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-1-type\" $field=\"text\" $value=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-2-type\" $field=\"text\" $value=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"\"/>\n"
    "</$list>\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-mode]get[text]!match[yes]]\" emptyMessage=\"\">\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-mode\" $field=\"text\" $value=\"yes\"/>\n"
    "</$list>\n"
    "\\end\n"
    "\n\\define tt-add-split-3()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"Cash\"/>\n"
    "\\end\n"
    "\n\\define tt-remove-split-3()\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-type\" $field=\"text\" $value=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-3-amount\" $field=\"text\" $value=\"\"/>\n"
    "\\end\n"
)
NEW_CANCEL_SPLIT_MACRO = (
    "\n\\define tt-toggle-split()\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-mode]get[text]match[yes]]\" emptyMessage=\"\">\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-mode\" $field=\"text\" $value=\"\"/>\n"
    "</$list>\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-mode]get[text]!match[yes]]\" emptyMessage=\"\">\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-mode\" $field=\"text\" $value=\"yes\"/>\n"
    "</$list>\n"
    "\\end\n"
    "\n\\define tt-cancel-split()\n"
    "<$vars sg={{$:/taxitracker/state/split-group}}>\n"
    "<$list filter=\"[all[tiddlers]field:split-group<sg>minlength[1]]\" variable=\"legTitle\">\n"
    "<$action-deletetiddler $tiddler=<<legTitle>>/>\n"
    "</$list>\n"
    "</$vars>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/state/split-group\" text=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/state/split-leg-count\" text=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/state/split-remaining\" text=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/state/split-total\" text=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/state/split-allocated\" text=\"\"/>\n"
    "<$action-setfield $tiddler=\"$:/taxitracker/scratch/split-mode\" text=\"\"/>\n"
    "\\end\n"
)
tt = patch(tt, OLD_SPLIT_MACROS, NEW_CANCEL_SPLIT_MACRO, 'tt-remove-old-split-macros')
print("2a OK — old split macros replaced with tt-cancel-split")

# 2b. Add new state tiddler clears to tt-clear-form
tt = patch(tt,
    '<$action-setfield $tiddler="$:/taxitracker/state/last-message" $field="text" $value=""/>\n\\end',
    '<$action-setfield $tiddler="$:/taxitracker/state/last-message" $field="text" $value=""/>\n'
    '<$action-setfield $tiddler="$:/taxitracker/state/split-group" text=""/>\n'
    '<$action-setfield $tiddler="$:/taxitracker/state/split-leg-count" text=""/>\n'
    '<$action-setfield $tiddler="$:/taxitracker/state/split-remaining" text=""/>\n'
    '<$action-setfield $tiddler="$:/taxitracker/state/split-total" text=""/>\n'
    '<$action-setfield $tiddler="$:/taxitracker/state/split-allocated" text=""/>\n'
    '\\end',
    'tt-clear-form-add-split-state')
print("2b OK — tt-clear-form updated")

# 2c. Replace old split section (Passenger 1/2/3) with split-in-progress panel
OLD_SPLIT_SECTION = (
    "<$list filter=\"[[$:/taxitracker/scratch/split-mode]get[text]match[yes]]\" emptyMessage=\"\">\n"
    "<div class=\"tt-split-section\">\n"
    "\n"
    "<div class=\"tt-split-hint\">Select type and enter the amount each passenger pays — total must match the charge.</div>\n"
    "\n"
    "<div class=\"tt-split-row-label\">Passenger 1</div>\n"
    "<div class=\"tt-split-row\">\n"
    "<div class=\"tt-split-pills\"><$button actions=<<tt-set-split-1-cash>> class={{{ [{$:/taxitracker/scratch/split-1-type}match[Cash]then[tt-split-pill tt-pill-cash tt-sel]else[tt-split-pill tt-pill-cash]] }}}>Cash</$button>"
    "<$button actions=<<tt-set-split-1-card>> class={{{ [{$:/taxitracker/scratch/split-1-type}match[Card]then[tt-split-pill tt-pill-card tt-sel]else[tt-split-pill tt-pill-card]] }}}>Card</$button>"
    "<$button actions=<<tt-set-split-1-account>> class={{{ [{$:/taxitracker/scratch/split-1-type}match[Account]then[tt-split-pill tt-pill-account tt-sel]else[tt-split-pill tt-pill-account]] }}}>Acct</$button></div>\n"
    "<$edit-text tiddler=\"$:/taxitracker/scratch/split-1-amount\" field=\"text\" tag=\"input\" inputType=\"number\" placeholder=\"0.00\" class=\"tt-split-amount\"/>\n"
    "</div>\n"
    "\n"
    "<div class=\"tt-split-row-label\">Passenger 2</div>\n"
    "<div class=\"tt-split-row\">\n"
    "<div class=\"tt-split-pills\"><$button actions=<<tt-set-split-2-cash>> class={{{ [{$:/taxitracker/scratch/split-2-type}match[Cash]then[tt-split-pill tt-pill-cash tt-sel]else[tt-split-pill tt-pill-cash]] }}}>Cash</$button>"
    "<$button actions=<<tt-set-split-2-card>> class={{{ [{$:/taxitracker/scratch/split-2-type}match[Card]then[tt-split-pill tt-pill-card tt-sel]else[tt-split-pill tt-pill-card]] }}}>Card</$button>"
    "<$button actions=<<tt-set-split-2-account>> class={{{ [{$:/taxitracker/scratch/split-2-type}match[Account]then[tt-split-pill tt-pill-account tt-sel]else[tt-split-pill tt-pill-account]] }}}>Acct</$button></div>\n"
    "<$edit-text tiddler=\"$:/taxitracker/scratch/split-2-amount\" field=\"text\" tag=\"input\" inputType=\"number\" placeholder=\"0.00\" class=\"tt-split-amount\"/>\n"
    "</div>\n"
    "\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-3-type]get[text]minlength[1]]\" emptyMessage=\"\">\n"
    "<div class=\"tt-split-row-label\">Passenger 3</div>\n"
    "<div class=\"tt-split-row\">\n"
    "<div class=\"tt-split-pills\"><$button actions=<<tt-set-split-3-cash>> class={{{ [{$:/taxitracker/scratch/split-3-type}match[Cash]then[tt-split-pill tt-pill-cash tt-sel]else[tt-split-pill tt-pill-cash]] }}}>Cash</$button>"
    "<$button actions=<<tt-set-split-3-card>> class={{{ [{$:/taxitracker/scratch/split-3-type}match[Card]then[tt-split-pill tt-pill-card tt-sel]else[tt-split-pill tt-pill-card]] }}}>Card</$button>"
    "<$button actions=<<tt-set-split-3-account>> class={{{ [{$:/taxitracker/scratch/split-3-type}match[Account]then[tt-split-pill tt-pill-account tt-sel]else[tt-split-pill tt-pill-account]] }}}>Acct</$button></div>\n"
    "<$edit-text tiddler=\"$:/taxitracker/scratch/split-3-amount\" field=\"text\" tag=\"input\" inputType=\"number\" placeholder=\"0.00\" class=\"tt-split-amount\"/>\n"
    "<$button actions=<<tt-remove-split-3>> class=\"tt-remove-split-btn\">✕</$button>\n"
    "</div>\n"
    "</$list>\n"
    "\n"
    "<$list filter=\"[[$:/taxitracker/scratch/split-3-type]get[text]!minlength[1]]\" emptyMessage=\"\">\n"
    "<$button actions=<<tt-add-split-3>> class=\"tt-add-split-btn\">+ Third passenger</$button>\n"
    "</$list>\n"
    "\n"
    "<div class={{{ [[$:/taxitracker/state/split-balance]get[text]match[0.00]then[tt-split-balance tt-split-bal-ok]else[tt-split-balance tt-split-bal-warn]] }}}>\n"
    "<$list filter=\"[[$:/taxitracker/state/split-balance]get[text]match[0.00]]\" emptyMessage=\"\">✓ Amounts balance — £{{$:/taxitracker/scratch/charge}} total</$list>\n"
    "<$list filter=\"[[$:/taxitracker/state/split-balance]get[text]!match[0.00]]\" emptyMessage=\"\">Charge £{{$:/taxitracker/scratch/charge}} · Remaining £{{$:/taxitracker/state/split-balance}}</$list>\n"
    "</div>\n"
    "\n"
    "</div>\n"
    "</$list>\n"
)
NEW_SPLIT_PROGRESS = (
    "<$list filter=\"[[$:/taxitracker/state/split-group]get[text]minlength[1]]\" emptyMessage=\"\">\n"
    "<div class=\"tt-split-progress\">\n"
    "<div class=\"tt-split-progress-title\">Split in progress</div>\n"
    "<$vars sg={{$:/taxitracker/state/split-group}}>\n"
    "<$list filter=\"[all[tiddlers]field:split-group<sg>sort[txn-time]]\">\n"
    "<div class=\"tt-split-leg-row\"><$view field=\"txn-time\"/> · <$view field=\"payment\"/> · £<$view field=\"charge\"/></div>\n"
    "</$list>\n"
    "</$vars>\n"
    "<div class=\"tt-split-remaining-label\">£{{$:/taxitracker/state/split-remaining}} remaining</div>\n"
    "<$list filter=\"[[$:/taxitracker/state/split-remaining]get[text]match[0.00]]\" emptyMessage=\"\">\n"
    "<$button actions=<<tt-clear-form>> class=\"tt-complete-split-btn\">Complete split ✓</$button>\n"
    "</$list>\n"
    "<$button actions=<<tt-cancel-split>> class=\"tt-cancel-split-btn\">Cancel split</$button>\n"
    "</div>\n"
    "</$list>\n"
)
tt = patch(tt, OLD_SPLIT_SECTION, NEW_SPLIT_PROGRESS, 'tt-replace-split-section')
print("2c OK — old split section replaced with progress panel")

# 2d. Replace old split display in "This Shift" rows
tt = patch(tt,
    '<$list filter="[<currentTiddler>get[split]match[yes]]" variable="ignore"> <span class="tt-txn-split">(<$view field="split-1-type"/> £<$view field="split-1-amount"/>+<$view field="split-2-type"/> £<$view field="split-2-amount"/><$list filter="[<currentTiddler>get[split-3-type]minlength[1]]" variable="ignore">+<$view field="split-3-type"/> £<$view field="split-3-amount"/></$list>)</span></$list>',
    '<$list filter="[<currentTiddler>get[split-group]minlength[1]]" variable="ignore"><span class="tt-txn-split">split</span> </$list>',
    'tt-shift-rows-split-display')
print("2d OK — shift rows split display updated")

# 2e. Add split sibling links after notes in "This Shift" rows
tt = patch(tt,
    '<$list filter="[<currentTiddler>get[notes]minlength[1]]" variable="ignore"> <span class="tt-txn-notes"><$view field="notes"/></span></$list>\n<$button actions=<<tt-do-edit-txn>> class="tt-edit-txn-btn">✏</$button>',
    '<$list filter="[<currentTiddler>get[notes]minlength[1]]" variable="ignore"> <span class="tt-txn-notes"><$view field="notes"/></span></$list><$list filter="[<currentTiddler>get[split-group]minlength[1]]" variable="ignore"><span class="tt-txn-split-link"> <$transclude field="text"/></span></$list>\n<$button actions=<<tt-do-edit-txn>> class="tt-edit-txn-btn">✏</$button>',
    'tt-shift-rows-split-links')
print("2e OK — split sibling links added to shift rows")

by_title['Taxi Tracker']['text'] = tt

# ============================================================
# 3. STARTUP.JS
# ============================================================
su = by_title['$:/plugins/taxitracker/startup.js']['text']

# 3a. clearScratch — add new state fields + clearSplitLeg function
OLD_CLEAR_SCRATCH_END = (
    "    $tw.wiki.addTiddler(new $tw.Tiddler({title:'$:/taxitracker/state/split-balance', text:'0.00'}));\n"
    "  }\n"
)
NEW_CLEAR_SCRATCH_END = (
    "    $tw.wiki.addTiddler(new $tw.Tiddler({title:'$:/taxitracker/state/split-balance', text:'0.00'}));\n"
    "    ['split-group','split-leg-count','split-remaining','split-total','split-allocated'].forEach(function(k){\n"
    "      $tw.wiki.addTiddler(new $tw.Tiddler({title:'$:/taxitracker/state/'+k, text:''}));\n"
    "    });\n"
    "  }\n"
    "  function clearSplitLeg() {\n"
    "    ['payment','charge','overring','cashin','gratuity','notes','fees'].forEach(function(k){\n"
    "      $tw.wiki.addTiddler(new $tw.Tiddler({title:'$:/taxitracker/scratch/'+k, text:''}));\n"
    "    });\n"
    "  }\n"
)
su = patch(su, OLD_CLEAR_SCRATCH_END, NEW_CLEAR_SCRATCH_END, 'su-clearScratch-splitState')
print("3a OK — clearScratch + clearSplitLeg")

# 3b. recordTxn — replace old split block with new multi-leg logic
OLD_SPLIT_BLOCK = (
    "if(splitMode==='yes'){\n"
    "        var s1t=getConfig('scratch/split-1-type',''), s1a=getConfig('scratch/split-1-amount','');\n"
    "        var s2t=getConfig('scratch/split-2-type',''), s2a=getConfig('scratch/split-2-amount','');\n"
    "        var s3t=getConfig('scratch/split-3-type',''), s3a=getConfig('scratch/split-3-amount','');\n"
    "        if(!s1t||!s2t) return {ok:false,msg:'Select payment type for both split rows'};\n"
    "        fields['split-1-type']=s1t; fields['split-1-amount']=String(parseFloat(s1a)||0);\n"
    "        fields['split-2-type']=s2t; fields['split-2-amount']=String(parseFloat(s2a)||0);\n"
    "        fields['split-3-type']=s3t; fields['split-3-amount']=String(parseFloat(s3a)||0);\n"
    "        fields.payment='Split';\n"
    "        var cashPortion=0;\n"
    "        [[s1t,s1a],[s2t,s2a],[s3t,s3a]].forEach(function(p){if(p[0]==='Cash')cashPortion+=parseFloat(p[1])||0;});\n"
    "        fields.cashin=String(cashPortion+(parseFloat(gratuity)||0));\n"
    "      } else {\n"
    "        if(!payment) return {ok:false,msg:'Select a payment type'};\n"
    "      }\n"
    "      "
)
NEW_SPLIT_BLOCK = (
    "var splitGroup=getConfig('state/split-group','');\n"
    "      var isSplitMode=splitMode==='yes'||!!splitGroup;\n"
    "      if(isSplitMode){\n"
    "        if(!payment) return {ok:false,msg:'Select a payment type'};\n"
    "        if(!splitGroup){\n"
    "          splitGroup='split-'+id.replace(/[^0-9]/g,'');\n"
    "          setConfig('state/split-group',splitGroup);\n"
    "          setConfig('state/split-total',String(parseFloat(meter)/100||0));\n"
    "          setConfig('state/split-allocated','0');\n"
    "          setConfig('state/split-leg-count','0');\n"
    "        }\n"
    "        var legNum=parseInt(getConfig('state/split-leg-count','0'),10)+1;\n"
    "        fields['split-group']=splitGroup;\n"
    "        fields['split-leg']=String(legNum);\n"
    "        fields['split-total']=getConfig('state/split-total','');\n"
    "        if(!fields.notes) fields.notes='split';\n"
    "        saveTiddler(fields);\n"
    "        journalWrite(fields);\n"
    "        sendToTelegram(fmtTxnMsg($tw.wiki.getTiddler(id).fields));\n"
    "        var siblings=$tw.wiki.filterTiddlers('[all[tiddlers]field:split-group['+splitGroup+']]').filter(function(t){return t!==id;});\n"
    "        siblings.forEach(function(sibTitle){\n"
    "          var sib=$tw.wiki.getTiddler(sibTitle); if(!sib) return;\n"
    "          var existing=sib.fields.text||'';\n"
    "          var link='[['+id+']]';\n"
    "          if(existing.indexOf(link)<0) $tw.wiki.addTiddler(new $tw.Tiddler(sib,{text:(existing?existing+'\\n':'')+link}));\n"
    "        });\n"
    "        if(siblings.length){\n"
    "          var sibLinks=siblings.map(function(t){return '[['+t+']]';}).join('\\n');\n"
    "          var legTid=$tw.wiki.getTiddler(id);\n"
    "          if(legTid) $tw.wiki.addTiddler(new $tw.Tiddler(legTid,{text:sibLinks}));\n"
    "        }\n"
    "        var allocated=(parseFloat(getConfig('state/split-allocated','0'))||0)+(parseFloat(fields.charge)||0);\n"
    "        var totalM=parseFloat(getConfig('state/split-total','0'))||0;\n"
    "        var remaining=Math.max(0,totalM-allocated);\n"
    "        setConfig('state/split-leg-count',String(legNum));\n"
    "        setConfig('state/split-allocated',String(allocated));\n"
    "        setConfig('state/split-remaining',remaining.toFixed(2));\n"
    "        clearSplitLeg();\n"
    "        $tw.rootWidget.dispatchEvent({type:'tm-auto-save-wiki'});\n"
    "        var cnt=$tw.wiki.filterTiddlers('[tag[Transaction]tag['+sTag+']]').length;\n"
    "        setConfig('state/txn-count',String(cnt));\n"
    "        if(cnt>0&&cnt%5===0) sendCheckpoint(shiftDate);\n"
    "        return {ok:true,id:id,splitRemaining:remaining};\n"
    "      } else {\n"
    "        if(!payment) return {ok:false,msg:'Select a payment type'};\n"
    "      }\n"
    "      "
)
su = patch(su, OLD_SPLIT_BLOCK, NEW_SPLIT_BLOCK, 'su-recordTxn-split-block')
print("3b OK — recordTxn split block replaced")

# 3c. fmtTxnMsg — add split-group Telegram annotation
su = patch(su,
    "    if(parts.length) splitLine=nl+'Split: '+parts.join(' + ');\n"
    "    }\n"
    "    return '<b>TXN</b> '",
    "    if(parts.length) splitLine=nl+'Split: '+parts.join(' + ');\n"
    "    }\n"
    "    if(f['split-group']){\n"
    "      splitLine+=nl+'Split leg '+(f['split-leg']||'?')+' · total fare £'+fmt(f['split-total']||0);\n"
    "    }\n"
    "    return '<b>TXN</b> '",
    'su-fmtTxnMsg-split-group')
print("3c OK — fmtTxnMsg split-group annotation")

# 3d. endShift — update cardList map to annotate split legs + add splitCashList
OLD_CARD_LIST = (
    "var cardList=txns.filter(function(t){\n"
    "        if(t.payment==='Card') return true;\n"
    "        if(t.split==='yes'&&[t['split-1-type'],t['split-2-type'],t['split-3-type']].indexOf('Card')>=0) return true;\n"
    "        return false;\n"
    "      }).map(function(t){var l='* £'+fmt(t.charge);if(parseFloat(t.gratuity)>0)l+=' - £'+fmt(t.gratuity)+' tip';return l;});\n"
    "      var acctList=txns.filter(function(t){return t.payment==='Account';}).map(function(t){return '* £'+fmt(t.charge);});"
)
NEW_CARD_LIST = (
    "var cardList=txns.filter(function(t){\n"
    "        if(t.payment==='Card') return true;\n"
    "        if(t.split==='yes'&&[t['split-1-type'],t['split-2-type'],t['split-3-type']].indexOf('Card')>=0) return true;\n"
    "        return false;\n"
    "      }).map(function(t){\n"
    "        var l='* £'+fmt(t.charge);\n"
    "        if(parseFloat(t.gratuity)>0) l+=' - £'+fmt(t.gratuity)+' tip';\n"
    "        if(t['split-group']){\n"
    "          var sibs=$tw.wiki.filterTiddlers('[all[tiddlers]field:split-group['+t['split-group']+']]').filter(function(s){return s!==t.title;}).map(function(s){var sf=$tw.wiki.getTiddler(s);return sf?'+£'+fmt(sf.fields.charge)+' '+sf.fields.payment:'';}).filter(Boolean);\n"
    "          if(sibs.length) l+=' split '+sibs.join(' ');\n"
    "        }\n"
    "        return l;\n"
    "      });\n"
    "      var splitCashList=txns.filter(function(t){return t.payment==='Cash'&&t['split-group'];}).map(function(t){\n"
    "        var l='* £'+fmt(t.charge)+' Cash';\n"
    "        var sibs=$tw.wiki.filterTiddlers('[all[tiddlers]field:split-group['+t['split-group']+']]').filter(function(s){return s!==t.title;}).map(function(s){var sf=$tw.wiki.getTiddler(s);return sf?'+£'+fmt(sf.fields.charge)+' '+sf.fields.payment:'';}).filter(Boolean);\n"
    "        if(sibs.length) l+=' split '+sibs.join(' ');\n"
    "        return l;\n"
    "      });\n"
    "      var acctList=txns.filter(function(t){return t.payment==='Account';}).map(function(t){return '* £'+fmt(t.charge);});"
)
su = patch(su, OLD_CARD_LIST, NEW_CARD_LIST, 'su-endShift-cardList-split')
print("3d OK — endShift cardList annotated + splitCashList added")

# 3e. endShift — insert splitCashList into dsLines
su = patch(su,
    "if(fdList.length>0){dsLines.push('!! Food Delivery Addresses');dsLines=dsLines.concat(fdList);dsLines.push('');}\n"
    "      if(cardList.length>0){dsLines.push('!! Card Charges');dsLines=dsLines.concat(cardList);dsLines.push('');}",
    "if(fdList.length>0){dsLines.push('!! Food Delivery Addresses');dsLines=dsLines.concat(fdList);dsLines.push('');}\n"
    "      if(splitCashList.length>0){dsLines.push('!! Cash (Split)');dsLines=dsLines.concat(splitCashList);dsLines.push('');}\n"
    "      if(cardList.length>0){dsLines.push('!! Card Charges');dsLines=dsLines.concat(cardList);dsLines.push('');}",
    'su-endShift-dsLines-splitCash')
print("3e OK — splitCashList inserted into dsLines")

by_title['$:/plugins/taxitracker/startup.js']['text'] = su

# ============================================================
# 4. MESSAGES.JS
# ============================================================
ms = by_title['$:/plugins/taxitracker/messages.js']['text']

# 4a. Remove old split-amount balance watcher
OLD_SPLIT_WATCHER = (
    "if (changes['$:/taxitracker/scratch/split-1-amount'] ||\n"
    "          changes['$:/taxitracker/scratch/split-2-amount'] ||\n"
    "          changes['$:/taxitracker/scratch/split-3-amount']) {\n"
    "        var charge = parseFloat(tw('scratch/charge')) || 0;\n"
    "        var allocated = (parseFloat(tw('scratch/split-1-amount')) || 0)\n"
    "                      + (parseFloat(tw('scratch/split-2-amount')) || 0)\n"
    "                      + (parseFloat(tw('scratch/split-3-amount')) || 0);\n"
    "        setTw('state/split-balance', (charge - allocated).toFixed(2));\n"
    "      }\n"
    "\n"
    "      "
)
su_patch_result = patch(ms, OLD_SPLIT_WATCHER, "      ", 'ms-remove-split-watcher')
ms = su_patch_result
print("4a OK — old split-amount watcher removed")

# 4b. Update tt-record-txn notify to handle split legs
ms = patch(ms,
    "var r = TT.recordTxn();\n"
    "      if (r.ok) updateShiftTotals();\n"
    "      notify(r.ok ? 'Recorded ✓' : r.msg, !r.ok);",
    "var r = TT.recordTxn();\n"
    "      if (r.ok) {\n"
    "        updateShiftTotals();\n"
    "        if (r.splitRemaining !== undefined) {\n"
    "          notify(r.splitRemaining > 0\n"
    "            ? 'Leg recorded ✓ — £' + r.splitRemaining.toFixed(2) + ' remaining'\n"
    "            : 'Leg recorded ✓ — tap Complete Split to close', false);\n"
    "        } else {\n"
    "          notify('Recorded ✓', false);\n"
    "        }\n"
    "      } else {\n"
    "        notify(r.msg, true);\n"
    "      }",
    'ms-recordTxn-notify-split')
print("4b OK — tt-record-txn notify updated")

# 4c. Update payment-popup guard in tt-record-txn to also check state/split-group
ms = patch(ms,
    "var payment = tw('scratch/payment');\n"
    "      var splitMode = tw('scratch/split-mode');\n"
    "      if (!payment && splitMode !== 'yes') {\n"
    "        setTw('state/payment-popup', 'open');\n"
    "        return;\n"
    "      }",
    "var payment = tw('scratch/payment');\n"
    "      var splitMode = tw('scratch/split-mode');\n"
    "      var splitGroup = tw('state/split-group');\n"
    "      if (!payment && splitMode !== 'yes' && !splitGroup) {\n"
    "        setTw('state/payment-popup', 'open');\n"
    "        return;\n"
    "      }",
    'ms-payment-popup-guard')
print("4c OK — payment popup guard updated for split group")

# 4d. Add tt-cancel-split handler — insert before tt-end-shift
ms = patch(ms,
    "$tw.rootWidget.addEventListener('tt-end-shift',",
    "$tw.rootWidget.addEventListener('tt-cancel-split', function() {\n"
    "      ['state/split-group','state/split-leg-count','state/split-remaining',\n"
    "       'state/split-total','state/split-allocated','scratch/split-mode'].forEach(function(k) {\n"
    "        setTw(k, '');\n"
    "      });\n"
    "      notify('Split cancelled', false);\n"
    "    });\n"
    "\n"
    "    $tw.rootWidget.addEventListener('tt-end-shift',",
    'ms-tt-cancel-split-handler')
print("4d OK — tt-cancel-split handler added")

by_title['$:/plugins/taxitracker/messages.js']['text'] = ms

# ============================================================
# 5. STYLESHEET — add new CSS classes
# ============================================================
css = by_title['$:/taxitracker/stylesheet-mobile']['text']
NEW_CSS = (
    "\n/* v6.5 split redesign */\n"
    ".tt-split-progress { background:#fff8e1; border-left:3px solid #e6a817; padding:8px 12px; margin:8px 0; border-radius:0 4px 4px 0; }\n"
    ".tt-split-progress-title { font-weight:bold; color:#e65100; margin-bottom:6px; font-size:0.95em; }\n"
    ".tt-split-leg-row { font-family:monospace; font-size:0.9em; color:#555; padding:3px 0; border-bottom:1px solid #f0e0b0; }\n"
    ".tt-split-remaining-label { font-size:1.05em; font-weight:bold; font-family:monospace; color:#e65100; margin-top:6px; }\n"
    ".tt-cancel-split-btn { margin-top:6px; padding:4px 12px; background:none; border:1px solid #e65100; color:#e65100; border-radius:4px; cursor:pointer; font-size:0.85em; }\n"
    ".tt-complete-split-btn { margin-top:6px; margin-right:6px; padding:4px 14px; background:#e65100; border:1px solid #e65100; color:#fff; border-radius:4px; cursor:pointer; font-size:0.85em; font-weight:bold; }\n"
    ".tt-split-status { color:#e65100; font-weight:bold; }\n"
    ".tt-txn-split { color:#e65100; font-size:0.8em; font-weight:bold; margin-right:4px; }\n"
    ".tt-txn-split-link { font-size:0.78em; color:#888; margin-left:4px; }\n"
)
css = css + NEW_CSS
by_title['$:/taxitracker/stylesheet-mobile']['text'] = css
print("5 OK — CSS added")

# ============================================================
# 6. NEW STATE TIDDLERS
# ============================================================
new_state = [
    '$:/taxitracker/state/split-group',
    '$:/taxitracker/state/split-leg-count',
    '$:/taxitracker/state/split-remaining',
    '$:/taxitracker/state/split-total',
    '$:/taxitracker/state/split-allocated',
]
for title in new_state:
    if title not in by_title:
        by_title[title] = {'title': title, 'text': ''}
        tids.append(by_title[title])
        print(f"6 OK — added {title}")
    else:
        by_title[title]['text'] = ''
        print(f"6 OK — cleared {title}")

# ============================================================
# VERIFY
# ============================================================
su_final = by_title['$:/plugins/taxitracker/startup.js']['text']
ms_final = by_title['$:/plugins/taxitracker/messages.js']['text']
tt_final = by_title['Taxi Tracker']['text']
sb_final = by_title['$:/taxitracker/status-bar']['text']

print("\n=== VERIFICATION ===")
print(f"startup.js length:           {len(su_final)}")
print(f"clearSplitLeg present:       {'function clearSplitLeg' in su_final}")
print(f"split-group logic present:   {'state/split-group' in su_final}")
print(f"old split-1-type in record:  {'split-1-type' in su_final[su_final.find('recordTxn:'):su_final.find('getTxnsForShift:')]}")
print(f"splitCashList in endShift:   {'splitCashList' in su_final}")
print(f"split-group in fmtTxnMsg:    {'split-group' in su_final[su_final.find('function fmtTxnMsg'):su_final.find('function fmtTxnMsg')+600]}")
print(f"messages.js length:          {len(ms_final)}")
print(f"tt-cancel-split in ms:       {'tt-cancel-split' in ms_final}")
print(f"old split watcher gone:      {'split-1-amount' not in ms_final[ms_final.find('tt-record-txn'):ms_final.find('tt-cancel-split')]}")
print(f"splitRemaining notify:       {'splitRemaining' in ms_final}")
print(f"Taxi Tracker length:         {len(tt_final)}")
print(f"old Passenger 1 gone:        {'Passenger 1' not in tt_final}")
print(f"tt-cancel-split macro:       {'tt-cancel-split' in tt_final}")
print(f"split-in-progress panel:     {'tt-split-progress' in tt_final}")
print(f"split sibling links:         {'tt-txn-split-link' in tt_final}")
print(f"status bar: no counter:      {'Transactions:' not in sb_final}")
print(f"status bar: split-group ref: {'state/split-group' in sb_final}")
print(f"Total tiddlers:              {len(tids)}")

# Write output
with open(DST, 'w', encoding='utf-8') as f:
    json.dump(tids, f, ensure_ascii=False, indent=2)
print(f"\nWrote {DST}")
