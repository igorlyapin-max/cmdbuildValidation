# cmdbuildValidation
Simple examples for CMDB attribute validation 

## Files

- `CMDBGrooveValidation.md` - notes and examples for CMDBuild 4.0.x attribute validation, including UI validation rules and server-side Groovy/Event Script patterns.
- `tk_addAddr_validation.js` - CMDBuild UI validation rule for `tk.addAddr`: when `iskiosk` is `true`, `addAddr` must contain more than two non-space characters.
- `tk_tklink_required_event_validation.groovy` - server-side Event Script template that requires at least one `tklink` domain relation for a `tk` card.
