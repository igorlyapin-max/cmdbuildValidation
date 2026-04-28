api.bind = ["computerRef"];

// CMDBuild validation rule context:
// Class: tk
// Rule attribute: computerRef
// computerRef type: reference
// Domain: tkComputerReference
// Target class: Computer
// Allowed referenced card classes: Notebook, PC
// Required referenced card Description content: word "Intel", case-insensitive
//
// CMDBuild attribute types commonly used in 4.x:
// boolean, long, char, date, decimal, double, foreignKey, formula,
// integer, ipAddress, link, lookup, lookupArray, reference, string,
// text, time, dateTime, file, json.

var computerId = value;

if (computerId == null || computerId === "") {
    return true;
}

var validationMessage = "Можно выбрать только Notebook или PC, у которых Description содержит слово Intel";
var referencedCard = null;
var loadFailed = false;

try {
    Ext.Ajax.request({
        url: CMDBuildUI.util.Config.baseUrl + "/classes/Computer/cards/" + encodeURIComponent(computerId),
        method: "GET",
        async: false,
        params: {
            detailed: true
        },
        success: function(response) {
            var responseData = Ext.decode(response.responseText);
            referencedCard = responseData && responseData.data;
        },
        failure: function() {
            loadFailed = true;
        }
    });
} catch (e) {
    loadFailed = true;
}

if (loadFailed || referencedCard == null) {
    return "Не удалось проверить выбранный Computer";
}

var allowedClasses = {
    Notebook: true,
    PC: true
};

var referencedType = referencedCard._type;
var referencedDescription = referencedCard.Description == null ? "" : String(referencedCard.Description);

if (!allowedClasses[referencedType] || !/\bintel\b/i.test(referencedDescription)) {
    return validationMessage;
}

return true;
