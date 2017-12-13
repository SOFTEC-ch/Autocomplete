# autocomplete

![status image from travis ci](https://travis-ci.org/SOFTEC-ch/Autocomplete.svg?branch=master)

Run these commands from the command-line.
#### Dependencies
```
npm install
bower install
```

#### Build
```
gulp default
```

#### Unit Tests
```
karma start --single-run
```

## Options
Name | Description
--- | ---
appendToBody | If `true`, the dropdown-menu will be appended to the HTML body element, instead of inside the autocomplete container. Default: `false`
dataSource | Can be either an Array or an URL. In case of an URL, Ajax is used to gather the data.
nameProperty | The property that will be used as display text. Default: `name`
valueProperty | The property that will be used as the value. Default: `value`
valueField | Can be either a selector or an element. Specified elements will get their value set to the value of the selected element (specified by the `valueProperty` option).
filter | `function(input, data) { ... }` Function which will be used to filter the items. `input` contains the input value. `data` contains the object retrieved by the dataSource.
filterOn | Event which will trigger the filter function. Will be attached to the text input field. Default: `input`
validation | `function(input, data) { ... }` Function which can be used for custom validations. Has to return `true` if value is valid, otherwise the input field will be marked as invalid.
validateOn | Event which will trigger the validation function. Will be attached to the text input field. Default: `blur`
onSelected | Function that will be called when a value is selected.
invalidClass | Class that will be set on the input, if the validation function does not return `true`. Default: `invalid`

## Events
Name | Description
--- | ---
initial-value-selected | Will be triggered as soon as the initial value is selected. Initial value is optionally provided by the referenced `valueField`. The value will only be selected if the `dataSource` contains a corresponding element.

## Open Tasks
1. After filter invokation, the autocomplete should only select an item if there is only one matching element.
1. The component should provide a `select (subsetOfMatchingElements[])` option to pass a function which will be called, when there are multiple matching elements.
1. It should also provide a default implementation for the `select` option.
