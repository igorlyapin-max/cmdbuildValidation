// CMDBuild validation rule context:
// Class: tk
// Rule attribute: addAddr
// addAddr type: string
// iskiosk type: boolean

var isKiosk = api.getValue("iskiosk");
var address = value == null ? "" : String(value).trim();

if ((isKiosk === true || isKiosk === "true") && address.length <= 2) {
    return "Если включен признак Киоск, поле Дополнительное расположение должно быть длиннее 2 символов";
}

return true;
