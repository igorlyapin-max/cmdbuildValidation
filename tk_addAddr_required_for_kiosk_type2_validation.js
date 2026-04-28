// CMDBuild validation rule context:
// Class: tk
// Rule attribute: addAddr
// addAddr type: string
// iskioskLookup type: lookup
// iskioskLookup lookupType: Kiosk
// Required lookup code: Тип2

var kioskCode = null;

if (api.getLookupCode) {
    kioskCode = api.getLookupCode("iskioskLookup");
}

if (kioskCode == null || kioskCode === "") {
    var kioskValue = api.getValue("iskioskLookup");

    if (kioskValue != null && typeof kioskValue === "object") {
        kioskCode = kioskValue.code || kioskValue.Code || kioskValue.description || kioskValue.Description;
    } else {
        kioskCode = kioskValue;
    }
}

var address = value == null ? "" : String(value).trim();

if (kioskCode === "Тип2" && address.length === 0) {
    return "Для значения Тип2 поле Дополнительное расположение обязательно для заполнения";
}

return true;
