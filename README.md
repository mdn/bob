# BoB

[![Build Status](https://travis-ci.com/mdn/bob.svg?branch=master)](https://travis-ci.com/mdn/bob)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Builder of Bits aka The [MDN Web Docs interactive examples](https://github.com/mdn/interactive-examples), example builder

## Source Folder Structure

```
-editor # All files related to the interactive examples editor
|--> css
|--> js
|--> media # media used only by the editor
|--> tmpl
-live-examples # All example related files and media
|--> css-examples
|--> fonts # fonts used by the editor and examples
|--> html-examples
|--> js-examples
|--> media # media used only by the examples
```

## Generated Folder Structure

```
-docs
|--> css # All editor related CSS
|--> js # All editor related JS
|--> live-examples # All custom CSS and JS for the examples
|--> media # All media and fonts for the examples
|--> pages # All generated interactive example pages
|----> css # All CSS examples
|----> js # All JS examples
|----> tabbed # All examples using the tabbed UI
```

## Using Commitizen CLI

This project uses Commitizen to ensure all pull requests follow the same format, and to ensure predictable releases with semantic-release.

To use this flow, add files as you normally would with `git add .`, and when you are ready to commit, simply type `git commit` and follow the prompts.
You can [read more on the Conventional Changelog format](https://github.com/conventional-changelog/conventional-changelog) on its repository.

## Testing Bob locally inside Interactive Examples

Bob is used to build the interactive-example pages and is installed as a dependency inside the [interactive-examples repo](https://github.com/mdn/interactive-examples/). When working on changes to Bob, there is often a need to test the changes by running Bob inside the interactive-examples repo locally. To do this, use the following command:

```
npx install-local ~/path/to/repo/bob && node node_modules/.bin/mdn-bob
```
