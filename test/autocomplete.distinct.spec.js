'use strict';

describe('Autocomplete', function () {
    const $ = jQuery;

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures/';

    const testDataSource = [
        {value: 1234, name: 'asdf'},
        {value: 5678, name: 'ghjk'},
        {value: 8888, name: 'xxxx'},
        {value: 9999, name: 'xxxx'},
        {value: 9998, name: 'addd'}];

    beforeEach(function () {
        loadFixtures('autocomplete-fixture.html');
    });

    afterEach(function () {
        $('#fixture').remove();
    });

    it('should have distinct values in dropdown-menu', function () {
        let options = {dataSource: testDataSource, distinct: true};
        $('.test-element').autocomplete(options);
        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        $('.autocomplete button.btn.btn-default').click();
        expect(dropdown).toBeVisible();
        expect(dropdown.find('li:contains(xxxx)').length).toBe(1);
    });

    it('should not have distinct values in dropdown-menu by default', function () {
        let options = {dataSource: testDataSource};
        $('.test-element').autocomplete(options);
        let dropdown = $('.autocomplete > ul.items.dropdown-menu');

        $('.autocomplete button.btn.btn-default').click();
        expect(dropdown).toBeVisible();
        expect(dropdown.find('li:contains(xxxx)').length).toBe(2);
    });

});