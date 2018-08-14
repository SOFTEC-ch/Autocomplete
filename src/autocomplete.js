'use strict';
(function ($) {
    class Autocomplete {

        constructor(element, options) {
            this.autoSelect = true;
            // container around the input field
            this.$input = $(element);
            this.$input.addClass('form-control');

            let containerClasses = 'autocomplete input-group';
            if (this.$input.hasClass('input-sm')) {
                containerClasses += ' input-group-sm';
            }

            this.$input.wrap('<div class="' + containerClasses + '"></div>');
            this.$container = this.$input.parent('.autocomplete');

            // dropdown button and dropdown menu
            this.$container.append(
                '<span class="input-group-btn">' +
                '<button class="btn btn-default" type="button" tabindex="-1">' +
                '</button></span>');
            this.$container.append('<ul class="items dropdown-menu" style="display:none;"></ul>');

            this.$button = this.$container.find('button');
            this.$items = this.$container.find('.items');

            if (this.$input.attr('disabled')) {
                this.$button.attr('disabled', 'disabled');
            }

            // parse options
            this.parseOptions(options);

            // setup event handlers
            let _this = this;
            this._filterOnHandler = function () {
                _this.search(this.value);
            }.bind(this.$input[0]);

            this._onKeyDown = function (e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode == 9) {
                    _this.open = false;
                }
            }.bind(this.$input[0]);

            this._validateOnHandler = function () {
                if (_this.options.validation) {
                    if (!_this.options.validation(_this.$input.val(), _this.data) && _this.options.invalidClass) {
                        _this.$input.addClass(_this.options.invalidClass);
                    } else {
                        _this.$input.removeClass(_this.options.invalidClass);
                    }
                }
            }.bind(this.$input[0]);

            this._openOnInputHandler = function () {
                _this.open = true;
            }.bind(this.$input[0]);

            this._buttonClickHandler = function () {
                _this.toggleOpen();
            };

            this._globalKeyEventHandler = function (e) {
                if (e.keyCode === 27) {   // ESC
                    _this.open = false;
                }
            };

            this._onBlurHandler = function () {
                _this.autoSelect = true;
            };

            // initialize event handlers
            this.initializeEventHandlers();

            // close the dropdown menu if clicked outside
            $('body').click(() => {
                const $active = $(document.activeElement);
                if (!$active.is(this.$input) && !$active.is(this.$button) && !$active.is(this.$items) && !this.$items.find($active).length) {
                    this.open = false
                }
            });

            // initialize the state of the component
            this.setButtonIcon();

            // get the data
            this.loadDataSource();
        };

        reinitialize(options) {
            if (this.open) {
                this.open = false;
            }

            this.removeEventHandlers();
            this.parseOptions(options);
            this.initializeEventHandlers();

            // get the data
            this.loadDataSource();
        }

        parseOptions(options) {
            this.options = $.extend({}, this.options, options);

            if (this.options.filter) {
                this.options.filter = this.options.filter.bind(this);
            }

            if (this.$input.data('value-field')) {
                this.$valueField = $(this.$input.data('value-field'));
            } else if (typeof this.options.valueField === "string") {
                this.$valueField = $(this.options.valueField);
            } else if (this.options.valueField && this.options.valueField.length) {
                this.$valueField = this.options.valueField;
            }

            if (this.$input.data('append-to-body')) {
                this.options.appendToBody = !!this.$input.data('append-to-body');
            }
            if (this.options.appendToBody) {
                let id = '' + (10000 * Math.random() * new Date().getTime() * window.outerHeight);
                this.$items.attr('id', id);
                this.$container.attr('dd-menu', id);
                this.$items.detach().appendTo('body');
            }

            var attr = this.$input.attr("open-on-input");
            if (attr == 'false') {
                this.options.openOnInput = false
            }
            else {
                this.options.openOnInput = true
            }

            var attr = this.$input.attr("select-first");
            if (attr == 'true') {
                this.options.selectFirstMatch = true
            }
            else {
                this.options.selectFirstMatch = false
            }

            const preAppendDataItem = this.$input.attr("pre-append");
            if (preAppendDataItem) {
                this.options.preAppendDataItem = new Function("li", "item", preAppendDataItem);
            }

            if (this.options.preAppendDataItem) {
                this.options.preAppendDataItem = this.options.preAppendDataItem.bind(this);
            }

            const validation = this.$input.attr("validation");
            if (validation) {
                this.options.validation = (input, data) => eval(validation);
            }

            const invalidClassAttr = this.$input.data("invalid-class");
            if (invalidClassAttr) {
                this.options.invalidClass = invalidClassAttr;
            }

            if (this.options.validation) {
                this.options.validation = this.options.validation.bind(this);
            }

            const distinctAttr = this.$input.attr("distinct");
            if (distinctAttr === 'true') {
                this.options.distinct = true;
            }
        }

        initializeEventHandlers() {
            if (this.options.openOnInput) {
                this.$input[0].addEventListener('input', this._openOnInputHandler);
            }
            this.$input[0].addEventListener('keydown', this._onKeyDown);
            this.$input[0].addEventListener('blur', this._onBlurHandler);
            this.$input[0].addEventListener(this.options.filterOn, this._filterOnHandler);
            this.$input[0].addEventListener(this.options.validateOn, this._validateOnHandler);
            this.$button[0].addEventListener('click', this._buttonClickHandler);
            window.addEventListener('keydown', this._globalKeyEventHandler);
        }

        removeEventHandlers() {
            if (this.options.openOnInput) {
                this.$input[0].removeEventListener('input', this._openOnInputHandler);
            }
            this.$input[0].removeEventListener('keydown', this._onKeyDown);
            this.$input[0].removeEventListener(this.options.filterOn, this._filterOnHandler);
            this.$input[0].removeEventListener(this.options.validateOn, this._validateOnHandler);
            this.$button[0].removeEventListener('click', this._buttonClickHandler);
            window.removeEventListener('keydown', this._globalKeyEventHandler);
        }

        get open() {
            return !!this.$container.attr('open');
        }

        set open(val) {
            // reflect the value of the open property as an HTML attribute
            if (val) {
                this.$container.attr('open', '');
            } else {
                this.$container.removeAttr('open');
            }

            this.setButtonIcon();

            if (this.open) {
                this.buildDropdownItems(this.data);
                this.$items.show();
                this.setMenuDirection();
            } else {
                this.$items.hide();
                this.destroyDropdownItems();
            }
        }

        get selected() {
            return this.$container.data('selected');
        }

        set selected(value) {
            // reflect the value of the selected property as an HTML attribute
            if (!value) {
                value = {};
            }

            if (typeof value !== "object" && this.data) {
                if (!isNaN(+value)) {
                    value = +value; // if value is a string we try to convert it to a number, otherwise we leave it as a string
                }
                let elem = this.data.filter(x => x[this.options.valueProperty] === value);
                if (elem && elem.length && elem[0]) {
                    value = elem[0];
                }
            }

            this.$container[0].setAttribute('selected', value[this.options.valueProperty] || '');
            this.$container.data('selected', value);

            this.$input.removeClass(this.options.invalidClass);

            if (this.$valueField) {
                this.$valueField.val(value[this.options.valueProperty] || '');
            }

            if (this.options.onSelected) {
                this.options.onSelected(this);
            }

            this.$input.trigger('change');
        }

        setButtonIcon() {
            this.$button.html('<span class="' + (this.open ? 'fa fa-caret-up' : 'fa fa-caret-down') + '"></span>');
        }

        search(input) {
            if (!input) {
                input = '';
            }
            this.selected = null;

            let results;
            if (this.options.filter) {
                results = this.options.filter(input, this.data);
            } else {
                results = this.data;
            }

            this.buildDropdownItems(results);

            if (results && results.length && input) {
                if (this.options.distinct) {
                    results = this.getUniqueValuesOfKey(results, this.options.nameProperty);
                }
                if (results.length === 1 || this.options.selectFirstMatch) {
                    if (this.autoSelect || this.options.selectFirstMatch) {
                        this.selected = results[0];
                        this.$input.val(results[0][this.options.nameProperty]);
                        this.autoSelect = false;
                    }
                }
                else {
                    this.autoSelect = true;
                }
            }
            return results;
        }

        getUniqueValuesOfKey(array, key) {
            return array.reduce(function (carry, item) {
                if (!carry.filter(x => x[key] === item[key]).length) carry.push(item);
                return carry;
            }, []);
        }

        buildDropdownItems(dataItems) {
            if (!dataItems || !dataItems.length)
                return;

            const _this = this;
            this.destroyDropdownItems();

            if (this.options.distinct) {
                dataItems = this.getUniqueValuesOfKey(dataItems, this.options.nameProperty);
            }

            const liElements = dataItems.map(x => {
                let li = document.createElement('li');
                li.setAttribute('value', x[_this.options.valueProperty]);
                li.innerHTML = '<a>' + x[_this.options.nameProperty] + '</a>';
                li.addEventListener('click', (e) => {
                    _this.$input.val(x[_this.options.nameProperty]);
                    _this.selected = x;
                    _this.open = false;
                });
                if (this.options.preAppendDataItem) {
                    this.options.preAppendDataItem(li, x);
                }
                return li;
            });

            for (let i = 0, s = 400; i < liElements.length; i += s) {
                liElements.slice(i, i + s).forEach(li => _this.$items.append(li));
            }
        }

        destroyDropdownItems() {
            this.$items.children().remove();
        }

        toggleOpen() {
            this.open = !this.open;
        }

        loadDataSource() {
            this.data = [];
            this.datasource = this.$input.data('source');
            if (!this.datasource) {
                this.datasource = this.options.dataSource;
            }
            if (!this.datasource) {
                return;
            }
            if (typeof this.datasource === "string") {
                // URL
                let _this = this;
                requestBundler.get(this.datasource, data => {
                    _this.data = data;
                    _this.selectInitialValue();
                });
            } else if (typeof this.datasource === "object") {
                // Array
                this.data = this.datasource;
                this.selectInitialValue();
            }
        }

        selectInitialValue() {
            if (this.$valueField) {
                this.selected = this.$valueField.val();
                this.$input.val(this.selected[this.options.nameProperty]);
            }
            this.$input.trigger(this.options.initialValueSelectedEvent);
        }

        setMenuDirection() {
            requestAnimationFrame(() => {
                let inputOffset = this.$input.offset();
                let inputHeight = this.$input.outerHeight();
                let inputMarginTop = parseInt(this.$input.css('margin-top'));

                // let menuOffset = this.$items.offset();
                let menuHeight = this.$items.outerHeight();

                let vpHeight = $(window).height();

                let noSpaceBelow = inputOffset.top + inputHeight + menuHeight > vpHeight;
                let spaceAbove = inputOffset.top - $(window).scrollTop() - menuHeight > 0;

                if (noSpaceBelow && spaceAbove) {
                    this.$items.offset({top: inputOffset.top - menuHeight - inputMarginTop, left: inputOffset.left})
                } else {
                    this.$items.offset({top: inputOffset.top + inputHeight + inputMarginTop, left: inputOffset.left})
                }
            });
        }
    }

    const defaultOptions = {
        nameProperty: 'name',
        valueProperty: 'value',
        valueField: null,
        dataSource: null,
        filter: function (input, data) {
            return data.filter(x => ~x[this.options.nameProperty].toLowerCase().indexOf(input.toLowerCase()));
        },
        filterOn: 'input',
        openOnInput: true,
        preAppendDataItem: null,
        validation: null,
        selectFirstMatch: false,
        validateOn: 'blur',
        onSelected: null,
        invalidClass: 'invalid',
        initialValueSelectedEvent: 'initial-value-selected.autocomplete',
        appendToBody: false,
        distinct: false
    };

    const requestBundler = new RequestBundler($.get);

    $.fn.autocomplete = function (option) {
        this.each(function () {
            let $this = $(this),
                data = $this.data('autocomplete'),
                options = typeof option === 'object' && option;
            if (!data) {
                let opts = $.extend({}, defaultOptions, options);
                let autocomplete = new Autocomplete(this, opts);
                $this.data('autocomplete', autocomplete);
            } else {
                data.reinitialize(options);
            }
        });
        return this;
    };

    $(() => {
        $('[data-provide="softec-autocomplete"]').autocomplete();
    });
}(window.jQuery));