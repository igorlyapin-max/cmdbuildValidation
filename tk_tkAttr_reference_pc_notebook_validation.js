// CMDBuild validation rule context:
// Class: tk
// Rule attribute: tkAttr (reference)
// User requested attribute path: tk.tkattr
// Actual CMDBuild attribute name: tkAttr
// tkAttr type: reference
// tkAttr domain: tkdomain
// tkAttr direction: direct
// tkAttr current targetClass: tk
// Allowed referenced card classes: PC, Notebook
//
// CMDBuild attribute types commonly used in REST/Admin UI:
// boolean, date, dateTime, decimal, double, entryType, file, foreignKey,
// formula, integer, ipAddress, link, long, lookup, reference, string, text,
// time.

var allowedTypes = {
    PC: true,
    Notebook: true
};

function getValueFrom(source, keys) {
    if (source == null) {
        return null;
    }

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (typeof source.get === "function") {
            var modelValue = source.get(key);
            if (modelValue != null && modelValue !== "") {
                return modelValue;
            }
        }

        if (source[key] != null && source[key] !== "") {
            return source[key];
        }
    }

    return null;
}

function normalizeType(typeName) {
    if (typeName == null || typeName === "") {
        return null;
    }

    return String(typeName).trim();
}

if (value == null || value === "") {
    return true;
}

var referenceType = normalizeType(getValueFrom(value, [
    "_type",
    "type",
    "_Type",
    "IdClass",
    "className",
    "targetClass"
]));

if (referenceType == null && api && api.record) {
    referenceType = normalizeType(getValueFrom(api.record, [
        "_tkAttr_type",
        "_tkAttr_Type",
        "_tkAttr__type",
        "_tkAttr_class",
        "_tkAttr_Class",
        "_tkAttr_targetClass",
        "tkAttr_type",
        "tkAttr_Type",
        "tkAttr__type",
        "tkAttr_class",
        "tkAttr_Class"
    ]));
}

if (referenceType == null && api && typeof api.getValue === "function") {
    referenceType = normalizeType(getValueFrom(api.getValue("tkAttr"), [
        "_type",
        "type",
        "_Type",
        "IdClass",
        "className",
        "targetClass"
    ]));
}

if (referenceType == null) {
    return "Не удалось определить класс выбранного объекта в tkAttr. Разрешены только PC или Notebook";
}

if (!allowedTypes[referenceType]) {
    return "В поле tkAttr можно выбрать только объект класса PC или Notebook";
}

return true;
