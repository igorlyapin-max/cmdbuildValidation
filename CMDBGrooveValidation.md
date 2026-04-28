# CMDBuild 4.0.x: валидация атрибутов, Groovy и Event Script

> Важная оговорка: в публичной документации CMDBuild атрибутные `Validation rules`, `View rules`, `Auto value` и `Form trigger` для форм Management Module описаны как JavaScript-правила, а не Groovy. Groovy используется на серверной стороне: в workflow-скриптах, Groovy-формулах, waterWAY/Service Bus script handlers и event/job trigger-сценариях. Поэтому ниже отдельно разделены клиентская валидация формы и серверная валидация.

## Источники и применимость к 4.0.x

Официальный раздел документации CMDBuild сообщает, что онлайн-документация доступна начиная с версии 4.2; для предыдущих версий надо смотреть раздел `Previous versions`. В публичной странице `Version 4.0` доступны `Overview manual` и `Webservice Manual`, но детальные страницы Administrator/Workflow сейчас представлены в онлайн-документации 4.2. Для 4.0.x это нужно читать как практическую справку по тем же механизмам и обязательно проверять на стенде конкретной версии 4.0.x.

Подтверждено для ветки 4.0:

- CMDBuild 4.0.0 выпущен 28.03.2025.
- В 4.0 добавлены/изменены waterWAY gates, Plugin Manager, ограничения редактирования relation/reference, обработка widgets на закрытых process instances.
- В Overview Manual 4.0 описан Task Manager для операций и контролей над CMDB-данными, включая synchronous/asynchronous events, уведомления, workflow и scripts.
- В changelog 3.4-4.0 видно, что Groovy стал штатным направлением для scripts, waterWAY и процессов, а READY2USE 2.4 на CMDBuild 4.0 core переведён на Groovy.

Основные источники:

- https://www.cmdbuild.org/en/documentation/manuals
- https://www.cmdbuild.org/en/documentation/manuals/previous-versions/version-4.0
- https://www.cmdbuild.org/file/manuali/versione-4.0/cmdbuild_overviewmanual_eng_v4-0.pdf
- https://www.cmdbuild.org/en/reference/news/new-cmdbuild-4-0-release-now-available
- https://www.cmdbuild.org/it/download/changelog
- https://docs.cmdbuild.org/docs/administrator/data-model/classes
- https://docs.cmdbuild.org/docs/administrator/data-model/attributes
- https://docs.cmdbuild.org/docs/administrator/data-model/domains
- https://docs.cmdbuild.org/docs/administrator/automation-and-integration/service-bus
- https://docs.cmdbuild.org/docs/workflow/api
- https://forum.cmdbuild.org/t/validation-rules-for-attributes/4913
- https://forum.cmdbuild.org/t/validation-rule-help/4249
- https://forum.cmdbuild.org/t/validation-rule-guide/4699

## Где настраивается клиентская валидация

### Class-level validation rules

Путь: `Administration Module -> Data Model -> Classes -> Properties -> Form Properties -> Validation rules`.

Назначение: проверить всю карточку перед сохранением. Если правило не прошло, кнопка сохранения неактивна, карточка остаётся в edit mode. Подходит для проверок на основе нескольких атрибутов одной формы.

### Attribute-level validation rules

Путь: `Administration Module -> Data Model -> Classes -> Attributes -> attribute -> Other Properties -> Validation rules`.

Назначение: проверить конкретный атрибут. В примерах из форума доступны:

- `value` - текущее значение проверяемого атрибута.
- `api.getValue("AttributeName")` - значение другого атрибута формы.
- `api.getLookupCode("LookupAttribute")` - код lookup-значения.
- `api.testRegExp(/.../, value)` - проверка регулярным выражением.
- `Ext.isEmpty(...)` - утилита ExtJS, полезна в UI-правилах.

Возврат:

- `return true;` - правило прошло.
- `return false;` - правило не прошло, сохранение блокируется.
- `return "Сообщение";` - правило не прошло, возвращается текст ошибки. Такое поведение подтверждено примерами форума.

### View rules и Auto value

`View rules` скрывают или блокируют атрибуты динамически, например по значению другого поля. `Auto value` рассчитывает значение атрибута при открытии формы или изменении зависимых полей. Это не замена валидации, но часто используется вместе с ней.

## Примеры клиентских Validation rules

### 1. Число в диапазоне

Пример из форума: integer-атрибут `Number` должен быть от 0 до 2. Важно использовать обычные двойные кавычки вокруг имени атрибута.

```javascript
if (api.getValue("Number") >= 0 && api.getValue("Number") <= 2) {
    return true;
}
return "Number must be between 0 and 2";
```

Вариант через regexp:

```javascript
if (api.testRegExp(/^([0-2])$/g, api.getValue("Number"))) {
    return true;
}
return "Number must be between 0 and 2";
```

### 2. Необязательный MAC address

Особенность CMDBuild UI: при открытии формы пустое поле может быть `null`, а не пустой строкой. Поэтому пустоту надо проверять явно.

```javascript
if (value != null && value !== "" &&
    !api.testRegExp(/^([a-f0-9][a-f0-9]:){5}([a-f0-9][a-f0-9])$/i, value)) {
    return "MAC address must use format de:ad:b3:3f:de:ad";
}
return true;
```

### 3. Код без пробелов и спецсимволов

```javascript
if (value == null || value === "") {
    return true;
}

if (api.testRegExp(/^[A-Z0-9_-]{3,32}$/g, value)) {
    return true;
}

return "Use 3-32 chars: A-Z, 0-9, underscore or dash";
```

Если атрибут уникальный, помните, что уникальность в БД обычно чувствительна к регистру: `AD01`, `Ad01` и `ad01` могут считаться разными значениями. Если нужна единая форма, валидируйте uppercase или нормализуйте значение через Auto value/Form trigger.

### 4. Запрет доменных суффиксов в имени

Пример для класса `Servers`: `Code = "abcd"` допустим, `abcd-domain-com` или `srv.example.com` недопустимы.

```javascript
if (value == null || value === "") {
    return true;
}

var looksLikeDomain =
    api.testRegExp(/(^|[-_.])domain([-_.]|$)/i, value) ||
    api.testRegExp(/\.(com|net|org|local)$/i, value);

if (looksLikeDomain) {
    return "Code must not contain domain name or DNS suffix";
}

return true;
```

### 5. Значение атрибута зависит от lookup другого атрибута

Пример из форума/openMAINT: если `OccurrenceType` имеет lookup code `CalendarDate`, значение текущего поля должно быть датой `YYYY-MM-DD` или шаблоном с `YYYY`.

```javascript
var isCalendarDate =
    (!Ext.isEmpty(api.getValue("OccurrenceType")) &&
     api.getLookupCode("OccurrenceType") === "CalendarDate");

var isValid = api.testRegExp(
    /^(\d{4}|YYYY)\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/g,
    value
);

if (isCalendarDate && !isValid) {
    return "Invalid value";
}
return true;
```

### 6. Поле обязательно, если заполнено другое поле

```javascript
var parentValue = api.getValue("DLCG");

if (parentValue != null && parentValue !== "" &&
    (value == null || value === "")) {
    return "This field is required when DLCG is set";
}

return true;
```

### 7. Reference обязателен только при определённом статусе

```javascript
var stateCode = api.getLookupCode("State");
var owner = api.getValue("Owner");

if (stateCode === "ACTIVE" && (owner == null || owner === "")) {
    return "Owner is required for active assets";
}

return true;
```

## Валидация domains и relations

### Что уже даёт модель CMDBuild

Domains описывают relation между двумя классами: origin, destination, descriptions и cardinality `1:1`, `1:N`, `N:1`, `N:N`. Domain может иметь собственные атрибуты, почти как class attributes, кроме Reference и Geographic attributes. Для Reference attribute используется relation через `1:N` domain.

Это даёт структурные ограничения:

- допустимая cardinality;
- политики удаления relation/card;
- фильтры добавления/редактирования origin/destination;
- master-detail/inline отображение;
- отключение редактирования relation с одной из сторон.

### Чего обычно не хватает в UI-правиле

Проверка "у карточки должен быть хотя бы один relation в domain X" часто не является чистой атрибутной валидацией:

- relation может создаваться после сохранения карточки;
- N:N relation не является значением одного поля;
- relation может редактироваться в отдельной вкладке/inline/master-detail.

Поэтому:

- если relation представлен Reference-атрибутом, проверяйте сам Reference как обычный атрибут (`api.getValue("Owner") != null`);
- если нужен N:N или master-detail cardinality rule, переносите проверку на серверную сторону: workflow step, synchronous event/Event Script, waterWAY event trigger или PostgreSQL function.

## Серверная валидация: Event Script / Groovy

### Когда нужна серверная проверка

Клиентские `Validation rules` удобны для UX, но их недостаточно для строгой бизнес-логики. Серверная проверка нужна, если правило должно сработать независимо от клиента: REST API, импорт, workflow, массовые операции, waterWAY, внешняя интеграция.

Используйте серверную проверку для:

- обязательных relations/domains;
- проверок по другим карточкам;
- проверки текущего пользователя, группы, роли, tenant/context;
- проверки вложений и DMS metadata;
- проверки уникальности сложнее стандартного `Unique`;
- проверок, требующих SQL, REST, LDAP/AD или внешней системы;
- правил, которые должны блокировать REST/import, а не только кнопку Save в браузере.

### Где это реализуется

Варианты зависят от конфигурации проекта:

- Workflow automatic activity на Groovy: официальная Workflow API даёт `cmdb`, `_CurrentUser`, `_CurrentGroup`, `ProcessId`, `ProcessClass`, типы `Card`, `ReferenceType`, `LookupType` и методы работы с card/relation/lookup/function/mail.
- waterWAY / Service Bus: descriptor в YAML, ETL handlers, script handler на Groovy/Java, job trigger и event trigger на создание/изменение/удаление карточки.
- Event trigger / Event Script: в старой терминологии Task Manager это synchronous/asynchronous event; в waterWAY это event trigger. Для жёсткой валидации используйте synchronous/before-сценарий, который выполняется в транзакции или до подтверждения операции. Asynchronous/after-сценарии годятся для уведомления, компенсации или исправления данных, но не всегда могут предотвратить исходное сохранение.
- PostgreSQL function: удобно для правил, которые проще и надёжнее выразить SQL-запросом; из Groovy её можно вызвать через `cmdb.callFunction(...)`.

### Данные, на которых может строиться серверная проверка

По официальной Workflow API и модели данных можно строить проверки на:

- примитивных атрибутах: `String`, `Text`, `Char`, `Boolean`, `Integer`, `Biginteger`, `Decimal`, `Double`, `Date`, `Time`, `Timestamp`;
- специализированных атрибутах: `IP address`, `Link`, `File`, `Formula`;
- `Lookup` и `LookupArray`: code, description, id, type;
- `Reference` и `Foreign key`: id и description связанной карточки;
- `Card`: `Code`, `Description`, произвольные attributes через `card.get("Attr")`;
- relations/domains: наличие связанных карточек, количество, domain attributes;
- attachments: name, description, category;
- workflow context: текущий пользователь `_CurrentUser`, текущая группа `_CurrentGroup`, process id/class/code;
- результатах SQL/PostgreSQL functions;
- результатах запросов к другим class cards через `queryClass`;
- внешних данных, если script handler обращается к REST/LDAP/AD/другой БД.

Для Event Script/waterWAY точные имена переменных контекста зависят от версии и descriptor. Перед внедрением выведите доступный контекст в лог на тестовом стенде и закрепите контракт в комментарии к script.

## Groovy-шаблоны серверных проверок

Ниже шаблоны. Имена `cardClass`, `cardId`, `card`, `event` замените на реальные переменные вашего Event Script/waterWAY/workflow-контекста.

### 1. Regex на сервере

```groovy
def code = card.get("Code") as String

if (code && !(code ==~ /^[A-Z0-9_-]{3,32}$/)) {
    throw new IllegalArgumentException(
        "Code must contain only A-Z, 0-9, underscore or dash"
    )
}
```

### 2. Проверка на основе другого атрибута

```groovy
def state = card.get("State")
def stateCode = state?.respondsTo("getCode") ? state.getCode() : state?.toString()
def serial = card.get("SerialNumber") as String

if (stateCode == "IN_PRODUCTION" && !serial) {
    throw new IllegalArgumentException(
        "SerialNumber is required for assets in production"
    )
}
```

Если lookup приходит как `LookupType`, используйте `getCode()`; если как raw value из event payload, сначала нормализуйте значение.

### 3. Проверка наличия relation/domain

```groovy
def related = cmdb.queryRelations(cardClass, cardId)
    .withDomain("ServerRunsApplication")
    .fetch()

if (related.isEmpty()) {
    throw new IllegalArgumentException(
        "Server must be linked to at least one Application"
    )
}
```

В некоторых примерах документации встречается `queryRelation(...)`, а в списке API - `queryRelations(...)`. На вашем стенде проверьте фактическое имя метода.

### 4. Проверка количества relations

```groovy
def assignees = cmdb.queryRelations(cardClass, cardId)
    .withDomain("AssetAssignee")
    .fetch()

if (assignees.size() > 1) {
    throw new IllegalArgumentException(
        "Asset can have only one active assignee"
    )
}
```

Если это правило должно быть постоянным, сначала проверьте, нельзя ли выразить его cardinality `1:1` или `1:N` на уровне domain. Скрипт нужен для условных правил, например "только один активный assignee".

### 5. Проверка по другой карточке

```groovy
def ownerRef = card.get("Owner")
if (ownerRef == null) {
    throw new IllegalArgumentException("Owner is required")
}

def ownerCard = cmdb.cardFrom(ownerRef)
def ownerStateValue = ownerCard.get("State")
def ownerState = ownerStateValue?.respondsTo("getCode")
    ? ownerStateValue.getCode()
    : ownerStateValue?.toString()

if (ownerState != "ACTIVE") {
    throw new IllegalArgumentException("Owner must be active")
}
```

### 6. Проверка вхождения пользователя в группу

В workflow-скрипте доступны `_CurrentUser` и `_CurrentGroup`. Если надо проверить не только текущую выбранную группу, а membership пользователя в группе, лучше вынести это в PostgreSQL function и вызвать её из Groovy.

Groovy:

```groovy
def result = cmdb.callFunction("app_user_in_group")
    .with("user_id", _CurrentUser.getId())
    .with("group_code", "AssetManagers")
    .execute()

if (result.get("allowed") != true) {
    throw new IllegalArgumentException(
        "Only AssetManagers can set this value"
    )
}
```

SQL-идея функции, требующая адаптации под вашу схему и права:

```sql
create or replace function app_user_in_group(
    user_id bigint,
    group_code text,
    out allowed boolean
) as $$
begin
    select exists (
        select 1
        from "Map_UserRole" mur
        join "Role" r on r."Id" = mur."IdObj2"
        where mur."Status" = 'A'
          and r."Status" = 'A'
          and mur."IdObj1" = user_id
          and r."Code" = group_code
    )
    into allowed;
end;
$$ language plpgsql stable;
```

На 4.x лучше проверить фактические имена системных таблиц/полей на вашей БД. Если доступ к системным таблицам нежелателен, реализуйте проверку через штатную permission-модель CMDBuild или через отдельную прикладную таблицу/класс.

### 7. Проверка lookup-значения

```groovy
def priority = card.get("Priority")
def priorityCode = priority?.respondsTo("getCode") ? priority.getCode() : priority?.toString()

if (priorityCode == "HIGH" && !card.get("BusinessOwner")) {
    throw new IllegalArgumentException(
        "BusinessOwner is required for high priority assets"
    )
}
```

### 8. Проверка attachments

```groovy
def attachments = cmdb.existingCard(cardClass, cardId)
    .attachments()
    .fetch()

def hasApproval = attachments.any { it.getCategory() == "SecurityApproval" }

if (!hasApproval) {
    throw new IllegalArgumentException(
        "SecurityApproval attachment is required"
    )
}
```

### 9. Проверка через PostgreSQL function

Подходит для сложной логики: проверка пересечений дат, уникальность по нескольким полям, проверка relation attributes, tenant-aware выборки.

```groovy
def state = card.get("State")
def stateCode = state?.respondsTo("getCode") ? state.getCode() : state?.toString()

def result = cmdb.callFunction("app_validate_asset")
    .with("asset_id", cardId)
    .with("state", stateCode)
    .execute()

if (result.get("valid") != true) {
    throw new IllegalArgumentException(result.get("message") as String)
}
```

### 10. Автоисправление вместо блокировки

Для after-event иногда правильнее не блокировать, а нормализовать данные:

```groovy
def normalizedCode = (card.get("Code") as String)?.trim()?.toUpperCase()

if (normalizedCode && normalizedCode != card.get("Code")) {
    cmdb.existingCard(cardClass, cardId)
        .with("Code", normalizedCode)
        .update()
}
```

Не используйте автоисправление там, где ошибка должна быть видна пользователю до сохранения.

## Практические рекомендации

- Дублируйте критичные правила: JavaScript validation для UX и server-side Groovy/Event Script для защиты REST/import/integration путей.
- Для regexp в UI используйте `api.testRegExp(...)`; на сервере используйте Groovy operator `==~` для полного совпадения или `=~` для поиска.
- Всегда обрабатывайте `null`: в UI пустое поле при открытии формы может быть `null`.
- Для lookup/reference не сравнивайте description, если есть стабильный code/id.
- Для обязательных relations сначала попробуйте выразить ограничение cardinality/domain/reference, а условные правила переносите в серверный script.
- Для user/group/tenant/security проверок предпочтительнее штатные permissions и server-side validation; клиентские rules можно обойти через API/import.
- Для waterWAY/Event Script явно документируйте trigger type: `before/after`, `create/update/delete`, `sync/async`. От этого зависит, может ли script заблокировать исходную операцию.
- Проверяйте правила на операции создания, изменения, клонирования, импорта и REST update отдельно: контекст и наличие old/new values могут отличаться.

## Быстрая карта выбора метода

| Задача | Где делать |
| --- | --- |
| Формат поля, regexp, диапазон числа | Attribute Validation rule в UI + серверный дубль для критичных полей |
| Поле обязательно при значении другого поля | Class/Attribute Validation rule, для критичного правила - Event Script |
| Скрыть/заблокировать поле | View rules |
| Автозаполнить/нормализовать поле | Auto value или Form trigger; на сервере - after-event update |
| Проверить наличие Reference | Mandatory + Validation rule |
| Проверить наличие N:N relation/domain | Server-side Event Script/workflow/waterWAY |
| Проверить пользователя/группу/tenant | Permissions + server-side Groovy/SQL function |
| Проверить attachments/DMS category | Server-side Groovy |
| Проверить данные из внешней системы | waterWAY script handler или workflow Groovy |
