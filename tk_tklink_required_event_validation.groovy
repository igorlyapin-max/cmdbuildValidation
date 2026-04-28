/*
 * CMDBuild server-side validation rule context:
 * Class: tk
 * Domain: tklink
 * Domain type: N:N
 * Domain source: Computer
 * Domain destination: Computer
 * tk is enabled as source descendant and destination descendant of Computer.
 *
 * Purpose:
 * A tk card must have at least one relation in domain tklink.
 *
 * Use this as a synchronous server-side Event Script / workflow validation.
 * A UI attribute Validation Rule cannot reliably check this domain, because
 * tklink is an N:N relation and is edited outside the attribute value set.
 */

def domainName = "tklink"
def className = "tk"

def cardId =
    binding.hasVariable("card") && card?.respondsTo("getId") ? card.getId() :
    binding.hasVariable("cardId") ? cardId :
    binding.hasVariable("_id") ? _id :
    null

if (cardId == null) {
    throw new IllegalStateException(
        "Cannot validate tklink relation: current card id is not available"
    )
}

def relations = cmdb.queryRelations(className, cardId)
    .withDomain(domainName)
    .fetch()

if (relations == null || relations.isEmpty()) {
    throw new IllegalArgumentException(
        "Для карточки tk обязательна привязка в domain tklink"
    )
}

return true
