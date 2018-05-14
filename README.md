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
-fonts # fonts used by the editor and examples
-live-examples # All example related files and media
|--> css-examples
|--> tabbed-examples
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
