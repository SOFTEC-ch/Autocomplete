# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2018-05-29

### Fix
- Added the option to only show unique dropdown items.

## [1.0.95] - 2018-05-17

### Fix
- Fix batch loading of dropdown will only show the first 400 items.

## [1.0.67] - 2018-04-20

### Changed
- minor performance optimization for when there are a lot of elements in the dropdown

## [1.0.66] - 2018-04-13

### Fix
- remove the invalid class after an element has been selected from the dropdown menu

## [1.0.65] - 2018-04-11

### Fix
- invalidClass was not removed after successful validation for validations defined in markup

## [1.0.64] - 2018-04-10

### Added
- invalidClass can be set in html markup (e.g. data-invalid-class="notvalid").

## [1.0.63] - 2018-03-12

### Fixed
- Changed the `data-appendToBody` attribute to `data-append-to-body` in order to be conform with the [HTML specification](https://www.w3.org/TR/2011/WD-html5-20110525/elements.html#embedding-custom-non-visible-data-with-the-data-attributes) (no uppercase letters).

## [1.0.62] - 2018-03-01

### Fixed
- Fixed an issue where, after selecting an item, no other item could be selected.

## [1.0.61] - 2018-02-21

### Added
- Add preAppendDataItem / `function(li, item)` to manipulate the list item regarding `item` values.

### Fixed
- Click on DropDownItem after filter a filter was already applied Issue #9

## [1.0.59] - 2018-02-15

### Added
- Support possibility to add validation function to autocomplete per html attribute

## [1.0.58] - 2018-02-13

### Added
- Typescript support for new autocomplete features

## [1.0.55] - 2018-02-12

### Added
- Add feature to force selection of first match even if there are more options.
- Add CHANGELOG.md
