'use strict';

// global validation spy for markup
let validationSpy;
let preAppendSpy;

describe('Autocomplete', function () {
    var $ = jQuery;

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures/';

    const hiddenFieldSelector = '#test-hidden-field';
    const test_dataSource = [
        {value: 1234, name: 'asdf'},
        {value: 5678, name: 'ghjk'},
        {value: 9999, name: 'xxxx'},
        {value: 9998, name: 'addd'}];

    const fireInputEvent = (element) => {
        fireEvent(element, 'input');    // fire the input event as if someone was typing
    };

    const fireBlurEvent = (element) => {
        fireEvent(element, 'blur');
    };

    const fireEvent = (element, eventName) => {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, false, true);
        element.dispatchEvent(evt);
    };

    const keyPress = (element, key) => {
        var event = document.createEvent('HTMLEvents');
        event.keyCode = key;
        event.initEvent('keydown');
        element.dispatchEvent(event);
    }

    // inject the HTML fixture for the tests
    beforeEach(function () {
        loadFixtures('autocomplete-fixture.html');
        validationSpy = jasmine.createSpy("validation spy");
        preAppendSpy = jasmine.createSpy("pre append spy");
    });

    // remove the html fixture from the DOM
    afterEach(function () {
        $('#fixture').remove();
    });

    it('should create DOM elements', function () {
        $('.test-element').autocomplete();

        var container = $('.autocomplete.input-group');
        expect(container[0]).toBeInDOM();
        expect(container).toContainElement('span.input-group-btn');
        expect(container.find('span.input-group-btn > button.btn.btn-default')[0]).toBeInDOM();
        expect(container).toContainElement('ul.items.dropdown-menu');
    });

    it('should only append the dropdown-menu items if the dropdown is open', function () {
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();

        let button = $('.autocomplete button.btn.btn-default');
        button.click();
        button.focus();

        expect(dropdown).not.toBeEmpty();

        expect(dropdown.children().length).toBe(4);
        expect(dropdown.children().eq(1).text()).toBe(options.dataSource[1].name);
        expect(+dropdown.children().eq(2).attr('value')).toBe(options.dataSource[2].value);

        button.click();
        expect(dropdown).toBeEmpty();
    });

    it('should not select an item when multiple options are available', function () {
        let $input = $('.test-element');
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();
        let button = $('.autocomplete button.btn.btn-default');
        button.click();
        button.focus();

        $input.val('a');

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).not.toBeEmpty();

        expect(dropdown.children().length).toBe(2);
        expect(dropdown.children().eq(0).text()).toBe(options.dataSource[0].name);
        expect(+dropdown.children().eq(1).attr('value')).toBe(options.dataSource[3].value);

        button.click();
        expect(dropdown).toBeEmpty();
    });

    it('should select an item when only one option is available', function () {
        let $input = $('.test-element');
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();
        let button = $('.autocomplete button.btn.btn-default');
        button.click();
        button.focus();

        $input.val('as');

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).not.toBeEmpty();

        expect(dropdown.children().length).toBe(1);
        expect(dropdown.children().eq(0).text()).toBe(options.dataSource[0].name);
        expect(+dropdown.children().eq(0).attr('value')).toBe(options.dataSource[0].value);

        expect($input.val()).toBe('asdf')
    });

    it('should select the first match even if there are more matches available', function () {
        let $input = $('.test-select-first');
        let options = {dataSource: test_dataSource};
        $('.test-select-first').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();
        let button = $('.autocomplete button.btn.btn-default');
        button.click();
        button.focus();

        $input.val('a');

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).not.toBeEmpty();

        expect(dropdown.children().length).toBe(2);

        expect($input.val()).toBe('asdf')
        button.click();
        expect(dropdown).toBeEmpty();
        expect(dropdown).not.toBeVisible();
    });

    it('should be possible to delete a character from the input when a autoselection happend before', function () {
        let $input = $('.test-element');
        let $inputAttribute = $('.test-element-attribute');
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();
        let button = $('.autocomplete button.btn.btn-default');
        button.click();
        button.focus();

        $input.val('as');

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).not.toBeEmpty();

        expect(dropdown.children().length).toBe(1);
        expect(dropdown.children().eq(0).text()).toBe(options.dataSource[0].name);
        expect(+dropdown.children().eq(0).attr('value')).toBe(options.dataSource[0].value);

        expect($input.val()).toBe('asdf')

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);
        $input.val('asd');

        expect($input.val()).toBe('asd')

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        // loose focus
        keyPress($input[0], 9)

        expect($input.val()).toBe('asd')

        expect(dropdown).toBeEmpty();
    });

    it('should open the dropdown-menu on button click', function () {
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeHidden();
        $('.autocomplete button.btn.btn-default').click();
        expect(dropdown).toBeVisible();
    });

    it('should select dropdown item on click and hide the menu', function () {
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        $('.autocomplete button.btn.btn-default').click();

        dropdown.find('li:eq(2)').click();

        expect(+$('.autocomplete')[0].getAttribute('selected')).toBe(options.dataSource[2].value);
        expect($('.test-element')).toHaveValue(options.dataSource[2].name);
        expect(dropdown).toBeHidden();
    });

    it('should open the menu if something is written in the textbox', function () {
        let $input = $('.test-element');
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();

        $input.val('a');

        expect($input.val()).toBe('a')

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).toBeVisible();
        $('body').click();
        expect(dropdown).toBeHidden();
    });

    it('should not open the menu if something is written in the textbox', function () {
        let $input = $('.test-element-attribute');
        let options = {dataSource: test_dataSource};
        $input.autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();

        $input.val('a');

        expect($input.val()).toBe('a')

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect(dropdown).not.toBeVisible();
    });

    it('should hide the menu if clicked outside', function () {
        let options = {dataSource: test_dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        $('.autocomplete button.btn.btn-default').click();
        expect(dropdown).toBeVisible();
        $('body').click();
        expect(dropdown).toBeHidden();
    });

    it('should not crash if invalid datasource is provided', function () {
        let options = {dataSource: {}};
        $('.test-element').autocomplete(options);
    });

    it('should set the value of the provided hidden field', function () {
        let options = {dataSource: test_dataSource, valueField: hiddenFieldSelector};
        $('.test-element').autocomplete(options);

        let hiddenField = $('#test-hidden-field');
        expect(hiddenField).toHaveValue('');

        $('.autocomplete button.btn.btn-default').click();
        $('.autocomplete > ul.items.dropdown-menu > li:eq(2)').click();

        expect(hiddenField).toHaveValue('' + options.dataSource[2].value);
    });

    it('should clear the selected value from the attribute and the hidden field if selection is cleared', function () {
        let $input = $('.test-element');
        let options = {dataSource: test_dataSource, valueField: hiddenFieldSelector};
        $input.autocomplete(options);

        let hiddenField = $('#test-hidden-field');
        $('.autocomplete button.btn.btn-default').click();
        $('.autocomplete > ul.items.dropdown-menu > li:eq(2)').click();

        // test if initial state of this test is correct
        expect(hiddenField).toHaveValue('' + options.dataSource[2].value);
        expect(+$('.autocomplete')[0].getAttribute('selected')).toBe(options.dataSource[2].value);
        expect($input).toHaveValue(options.dataSource[2].name);

        $input.val('');

        // fire the input event as if someone was typing
        fireInputEvent($input[0]);

        expect($('.autocomplete')[0].getAttribute('selected')).toBe('');
        expect(hiddenField).toHaveValue('');
    });

    it('should initially select the corresponding value of the hidden field', function () {
        let options = {dataSource: test_dataSource, valueField: hiddenFieldSelector};
        let hiddenField = $('#test-hidden-field');
        hiddenField.val(test_dataSource[1].value);

        $('.test-element').autocomplete(options);

        let container = $('.autocomplete.input-group');

        expect(hiddenField).toHaveValue('' + test_dataSource[1].value);
        expect($('.test-element')[0].value).toBe('' + test_dataSource[1].name);
        expect($('.autocomplete')[0].getAttribute('selected')).toBe('' + test_dataSource[1].value);
    });

    it('should mark the input with the provided invalidClass if the validation function does not return true', function () {
        let $input = $('.test-element');
        let TEST_INVALID_CLASS = 'TEST_INVALID';
        let options = {
            dataSource: test_dataSource,
            invalidClass: TEST_INVALID_CLASS,
            validation: function (inputValue) {
                return inputValue === test_dataSource[2].name;
            },
            filter: function (input, data) {
                return data.filter(x => x.name === input);
            }
        };
        $input.autocomplete(options);

        $input.val(test_dataSource[1].name);

        // fire the events like they would normally
        fireInputEvent($input[0]);
        fireBlurEvent($input[0]);

        expect($input).toHaveClass(TEST_INVALID_CLASS);

        // it should also remove the class if the value is valid again
        $input.val(test_dataSource[2].name);

        // fire the events like they would normally
        fireInputEvent($input[0]);
        fireBlurEvent($input[0]);

        expect($input).not.toHaveClass(TEST_INVALID_CLASS);
    });

    it('should validate on the provided input event', function () {
        let $input = $('.test-element');
        let validationFunc = jasmine.createSpy("validationFunc() spy");
        let options = {
            dataSource: test_dataSource,
            validation: validationFunc,
            validateOn: 'input'
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireBlurEvent($input[0]);
        expect(validationFunc).not.toHaveBeenCalled();
        fireInputEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();
    });

    it('should by default validate on the blur event', function () {
        let $input = $('.test-element');
        let validationFunc = jasmine.createSpy("validationFunc() spy");
        let options = {
            dataSource: test_dataSource,
            validation: validationFunc
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(validationFunc).not.toHaveBeenCalled();
        fireBlurEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();
    });

    it('should filter only on the provided event', function () {
        let $input = $('.test-element');
        let filterFunc = jasmine.createSpy("filter() spy");
        let options = {
            dataSource: test_dataSource,
            filter: filterFunc,
            filterOn: 'blur'
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(filterFunc).not.toHaveBeenCalled();

        fireBlurEvent($input[0]);
        expect(filterFunc).toHaveBeenCalled();
    });

    it('should by default filter on the input event', function () {
        let $input = $('.test-element');
        let filterFunc = jasmine.createSpy("filter() spy");
        let options = {
            dataSource: test_dataSource,
            filter: filterFunc
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireBlurEvent($input[0]);
        expect(filterFunc).not.toHaveBeenCalled();

        fireInputEvent($input[0]);
        expect(filterFunc).toHaveBeenCalled();
    });

    it('should reinitialize and attach new validation and filter function', function () {
        let $input = $('.test-element');

        let filterFunc = jasmine.createSpy("filter() spy");
        let validationFunc = jasmine.createSpy("validation() spy");

        let filterFunc2 = jasmine.createSpy("filter() spy 2");
        let validationFunc2 = jasmine.createSpy("validation() spy 2");

        let options = {
            dataSource: test_dataSource,
            filter: filterFunc,
            validation: validationFunc
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        fireInputEvent($input[0]);
        expect(filterFunc).toHaveBeenCalled();
        fireBlurEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();

        filterFunc.calls.reset();
        validationFunc.calls.reset();

        options = {
            dataSource: test_dataSource,
            filter: filterFunc2,
            validation: validationFunc2
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[2].name);

        fireInputEvent($input[0]);
        expect(filterFunc).not.toHaveBeenCalled();
        expect(filterFunc2).toHaveBeenCalled();
        fireBlurEvent($input[0]);
        expect(validationFunc).not.toHaveBeenCalled();
        expect(validationFunc2).toHaveBeenCalled();
    });

    it('should reinitialize and load new datasource', function () {
        let $input = $('.test-element');
        let options = {dataSource: test_dataSource};
        $input.autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');
        let dropdownBtn = $('.autocomplete button.btn.btn-default');

        dropdownBtn.click();
        dropdownBtn.focus();
        expect(dropdown).toBeVisible();
        expect(dropdown.children()).toHaveLength(test_dataSource.length);
        dropdownBtn.click();
        expect(dropdown).toBeHidden();

        // reinitialize
        options = {
            dataSource: [
                {value: 2547, name: 'maqrt'},
                {value: 4867, name: 'Auyd'},
                {value: 2654, name: 'bdsf'},
                {value: 2546, name: 'dfgh'},
                {value: 4672, name: 'zbdf'}]
        };

        $input.autocomplete(options);

        dropdownBtn.click();
        expect(dropdown).toBeVisible();
        expect(dropdown.children()).not.toHaveLength(test_dataSource.length);
        expect(dropdown.children()).toHaveLength(options.dataSource.length);
        dropdownBtn.click();
        expect(dropdown).toBeHidden();
    });

    it('should select the corresponding value of the new hidden field after reinitialization', function () {
        let options = {dataSource: test_dataSource, valueField: hiddenFieldSelector};
        let hiddenField = $('#test-hidden-field');
        hiddenField.val(test_dataSource[1].value);

        $('.test-element').autocomplete(options);

        let container = $('.autocomplete.input-group');

        expect(hiddenField).toHaveValue('' + test_dataSource[1].value);
        expect($('.test-element')[0].value).toBe('' + test_dataSource[1].name);
        expect($('.autocomplete')[0].getAttribute('selected')).toBe('' + test_dataSource[1].value);

        // reinitialize
        // setup second hidden field
        let hiddenField2Id = 'test-hidden-field2';
        let hiddenField2 = $('#test-hidden-field').clone().appendTo('body');
        hiddenField2.attr('id', hiddenField2Id);
        hiddenField2.val(test_dataSource[2].value);

        options.valueField = '#' + hiddenField2Id;
        $('.test-element').autocomplete(options);

        expect(hiddenField2).toHaveValue('' + test_dataSource[2].value);
        expect($('.test-element')[0].value).toBe('' + test_dataSource[2].name);
        expect($('.autocomplete')[0].getAttribute('selected')).toBe('' + test_dataSource[2].value);
    });

    it('should reinitialize filter event handlers', function () {
        let $input = $('.test-element');
        let filterFunc = jasmine.createSpy("filter() spy");
        let options = {
            dataSource: test_dataSource,
            filter: filterFunc,
            filterOn: 'blur'
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(filterFunc).not.toHaveBeenCalled();

        fireBlurEvent($input[0]);
        expect(filterFunc).toHaveBeenCalled();

        // change values and reinitialize
        options.filterOn = 'input';

        filterFunc.calls.reset();

        $input.autocomplete(options);
        $input.val(test_dataSource[2].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(filterFunc).toHaveBeenCalled();
    });

    it('should reinitialize validation event handlers', function () {
        let $input = $('.test-element');
        let validationFunc = jasmine.createSpy("validation() spy");
        let options = {
            dataSource: test_dataSource,
            validation: validationFunc,
            validateOn: 'blur'
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(validationFunc).not.toHaveBeenCalled();

        fireBlurEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();

        // change values and reinitialize
        options.validateOn = 'input';

        validationFunc.calls.reset();

        $input.autocomplete(options);
        $input.val(test_dataSource[2].name);

        // fire the events
        fireInputEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();
    });

    it('should have a validation function which can be passed through the markup attribute', function () {
        let options = {dataSource: test_dataSource};
        let $input = $('.test-select-validation')
        $input.autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(dropdown).toBeInDOM();
        expect(dropdown).toBeEmpty();

        // fire the events
        fireInputEvent($input[0]);
        // fire the events
        fireBlurEvent($input[0]);

        expect(validationSpy).toHaveBeenCalled();
    });

    it('should call markup validation, mark the input as invalid and remove the class if it is no longer invalid', function () {
        expect(validationSpy).not.toHaveBeenCalled();

        const TEST_INVALID_CLASS = 'TEST_INVALID';

        let isValid = false;
        validationSpy.and.callFake(() => isValid);

        let options = {dataSource: test_dataSource};
        const $input = $('.test-select-validation');
        $input.attr('data-invalid-class', TEST_INVALID_CLASS);

        $input.autocomplete(options);

        // fire the events like they would normally
        fireInputEvent($input[0]);
        fireBlurEvent($input[0]);

        expect(validationSpy).toHaveBeenCalled();
        expect($input).toHaveClass(TEST_INVALID_CLASS);

        isValid = true;

        // fire the events like they would normally
        fireInputEvent($input[0]);
        fireBlurEvent($input[0]);

        expect($input).not.toHaveClass(TEST_INVALID_CLASS);
    });

    it('should have a pre append function which can be passed through the markup attribute', function () {
        let $input = $('.test-select-pre-append');
        let options = {dataSource: test_dataSource};
        $input.autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');
        let dropdownBtn = $('.autocomplete button.btn.btn-default');

        dropdownBtn.click();
        dropdownBtn.focus();

        expect(dropdown).toBeVisible();
        expect(dropdown).toBeInDOM();
        dropdownBtn.click();

        expect(preAppendSpy).toHaveBeenCalled();
        expect(preAppendSpy.calls.count()).toBe(4);
    });

    it('should be possible to select multiple different values in sequence', function () {
        const $input = $('.test-element');
        const filterFunc = jasmine.createSpy("filter() spy").and.callFake((input, data) => data.filter(x => ~x.name.indexOf(input)));
        const dataSource = [
            {value: 1234, name: 'asdf'},
            {value: 5678, name: 'ghjk'},
            {value: 9999, name: 'xxxx'},
            {value: 9998, name: 'addd'}];

        $input.autocomplete({
            dataSource: dataSource,
            filter: filterFunc
        });

        const testFunc = (input, index) => {
            $input.val(input);
            fireInputEvent($input[0]);
            fireBlurEvent($input[0]);

            expect($input.data('autocomplete').selected).toEqual(dataSource[index]);
        };

        testFunc('asd', 0);
        testFunc('xxx', 2);
        testFunc('ghj', 1);
        testFunc('ad', 3);
    });

    it('should set the provided invalid class', function () {
        let $input = $('.test-element');

        const TEST_INVALID_CLASS = 'TEST_INVALID_CLASS';
        $input.attr('data-invalid-class', TEST_INVALID_CLASS);
        expect($input).toHaveAttr('data-invalid-class');

        let isValid = false;

        let validationFunc = jasmine.createSpy("validationFunc() spy").and.callFake(() => isValid);
        let options = {
            dataSource: test_dataSource,
            validation: validationFunc,
            validateOn: 'input'
        };

        $input.autocomplete(options);
        $input.val(test_dataSource[1].name);

        expect($input).not.toHaveClass(TEST_INVALID_CLASS);

        // fire the events
        fireBlurEvent($input[0]);
        expect(validationFunc).not.toHaveBeenCalled();
        fireInputEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();

        expect($input).toHaveClass(TEST_INVALID_CLASS);

        isValid = true;

        // fire the events
        fireBlurEvent($input[0]);
        fireInputEvent($input[0]);
        expect(validationFunc).toHaveBeenCalled();

        expect($input).not.toHaveClass(TEST_INVALID_CLASS);
    });

    it('should remove the invalid class after an element has been selected by click', function () {
        const $input = $('.test-element');
        const TEST_INVALID_CLASS = 'TEST_INVALID';
        const options = {
            dataSource: test_dataSource,
            invalidClass: TEST_INVALID_CLASS,
            validation: jasmine.createSpy('validation spy').and.callFake((inputValue) => {
                return inputValue === test_dataSource[2].name;
            }),
            filter: function (input, data) {
                return data.filter(x => x.name === input);
            }
        };
        $input.autocomplete(options);
        const dropdown = $('.autocomplete > ul.items.dropdown-menu');

        expect(options.validation).not.toHaveBeenCalled();

        $input.val(test_dataSource[1].name);
        fireInputEvent($input[0]);
        fireBlurEvent($input[0]);

        expect(options.validation).toHaveBeenCalledTimes(1);
        expect($input).toHaveClass(TEST_INVALID_CLASS);

        $('.autocomplete button.btn.btn-default').click();
        dropdown.find('li:eq(2)').click();

        expect($input).toHaveValue(options.dataSource[2].name);
        expect($input).not.toHaveClass(TEST_INVALID_CLASS);
        expect(options.validation).toHaveBeenCalledTimes(1);
    });

});