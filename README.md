# cmdbuildValidation
Simple examples for CMDB attribute validation 

## Files

- `CMDBGrooveValidation.md` - notes and examples for CMDBuild 4.0.x attribute validation, including UI validation rules and server-side Groovy/Event Script patterns.
- `tk_addAddr_validation.js` - CMDBuild UI validation rule for `tk.addAddr`: when `iskiosk` is `true`, `addAddr` must contain more than two non-space characters.
- `tk_addAddr_required_for_kiosk_type2_validation.js` - CMDBuild UI validation rule for `tk.addAddr`: when `iskioskLookup` has code `Тип2`, `addAddr` is required.
- `tk_computerRef_notebook_pc_intel_validation.js` - CMDBuild UI validation rule for `tk.computerRef`: only `Notebook` or `PC` cards whose `Description` contains the word `Intel` are allowed.
- `tk_tklink_required_event_validation.groovy` - server-side Event Script template that requires at least one `tklink` domain relation for a `tk` card.
