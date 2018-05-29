/// <reference path="../jquery/jquery.d.ts" />

/**Options available to control the autocomplete control*/
interface AutocompleteOptions {

    /**The property that will be used as display text. Default: name*/
    nameProperty?: string;

    /**The property that will be used as the value. Default: value*/
    valueProperty?: string;

    /**Can be either an Array or an URL. In case of an URL, Ajax is used to gather the data.*/
    dataSource?: Array<any> | string;

    /**Function which will be used to filter the items. `input` contains the input value. `data` contains the object retrieved by the dataSource.*/
    filter?: Function;

    /**Function which can be used for custom validations. Has to return `true` if value is valid, otherwise the input field will be marked as invalid.*/
    validation?: Function;

    onSelected?: Function;

    valueField?: string | JQuery;

    invalidClass?: string;

    validateOn?: string;

    filterOn?: string;

    appendToBody?: boolean;

    openOnInput?: boolean;

    selectFirstMatch?: boolean;

    distinct?: boolean;
}

interface Autocomplete {
    (): JQuery;
    (options: AutocompleteOptions): JQuery;
}

interface JQuery {
    autocomplete: Autocomplete;
}
