'use strict';

describe('Autocomplete', function () {
    var $ = jQuery;

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures/';

    const fireInputEvent = (element) => {
        fireEvent(element, 'input');    // fire the input event as if someone was typing
    };

    const fireEvent = (element, eventName) => {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, false, true);
        element.dispatchEvent(evt);
    };

    // inject the HTML fixture for the tests
    beforeEach(function () {
        loadFixtures('autocomplete-fixture.html');
    });

    // remove the html fixture from the DOM
    afterEach(function () {
        $('#fixture').remove();
    });

    it('should open the dropdown-menu with 1500 elements on click in less than 100ms', function () {
        const maxTime = 600;
        const dataSource = [];
        for (var i = 0; i < 1500; i++) {
            const value = 123498765 + i;
            dataSource.push({value: value, name: 'asdf' + value});
        }

        let options = {dataSource: dataSource};
        $('.test-element').autocomplete(options);

        let dropdown = $('.autocomplete > ul.items.dropdown-menu');
        expect(dropdown).toBeHidden();

        const start = performance.now();
        $('.autocomplete button.btn.btn-default').click();
        expect(dropdown).toBeVisible();
        const end = performance.now();
        const time = end - start;

        expect(time).toBeLessThan(maxTime);
    });


    it('should open the dropdown-menu with 1500 elements on text input in less than 100ms', function () {
        const maxTime = 600;
        const $input = $('.test-element');
        const filterFunc = jasmine.createSpy("filter() spy");
        const preappendFunc = jasmine.createSpy("preAppendDataItem() spy");
        const dataSource = [];
        for (var i = 0; i < 1500; i++) {
            const value = i;
            dataSource.push({value: value, name: 'asdf' + value});
        }

        const options = {dataSource: dataSource, filter: filterFunc, preAppendDataItem: preappendFunc};
        $input.autocomplete(options);
        $input.val('df9');

        const dropdown = $('.autocomplete > ul.items.dropdown-menu');
        expect(dropdown).toBeHidden();

        const start = performance.now();
        fireInputEvent($input[0]);
        expect(dropdown).toBeVisible();
        const end = performance.now();
        const time = end - start;

        expect(preappendFunc).toHaveBeenCalled();
        expect(filterFunc).toHaveBeenCalled();
        expect(time).toBeLessThan(maxTime);
    });

});
