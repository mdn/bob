# Changelog

## [3.1.0](https://github.com/mdn/bob/compare/v3.0.3...v3.1.0) (2023-03-09)


### Features

* migrate to TypeScript ([#1134](https://github.com/mdn/bob/issues/1134)) ([9e7b619](https://github.com/mdn/bob/commit/9e7b619534077c2c8ac290ad30d88c439ac32ef1))

## [3.0.3](https://github.com/mdn/bob/compare/v3.0.2...v3.0.3) (2023-02-24)


### Bug Fixes

* **css-examples:** avoid unnecssary scrollbars ([#1125](https://github.com/mdn/bob/issues/1125)) ([9e67dd7](https://github.com/mdn/bob/commit/9e67dd75c0d634b9b4588ae2d4eda6a6bf0f9dfa))

## [3.0.2](https://github.com/mdn/bob/compare/v3.0.1...v3.0.2) (2023-02-24)


### Bug Fixes

* Add `CHANGELOG.md` to `.prettierignore` ([#1121](https://github.com/mdn/bob/issues/1121)) ([36734e3](https://github.com/mdn/bob/commit/36734e35856f584aa3929655133bc9324503c7ac))
* Add back `WAT` examples ([#1119](https://github.com/mdn/bob/issues/1119)) ([160abf8](https://github.com/mdn/bob/commit/160abf8ab66b3fe9c92ef0d1df09e2d2c3664ad6))
* **build:** output in cwd, not import.meta.url ([#1122](https://github.com/mdn/bob/issues/1122)) ([1124abb](https://github.com/mdn/bob/commit/1124abb03651a7a83eedb65c17f247bef2ebd559))
* Fix pre-commit hooks + run prettier ([#1120](https://github.com/mdn/bob/issues/1120)) ([b11f5bf](https://github.com/mdn/bob/commit/b11f5bf70c64b6efbccc6e2846c52f599065a428))

## [3.0.1](https://github.com/mdn/bob/compare/v3.0.0...v3.0.1) (2023-02-24)


### Bug Fixes

* **deps:** Move build dependencies to non-dev dependencies ([#1107](https://github.com/mdn/bob/issues/1107)) ([0b03a8f](https://github.com/mdn/bob/commit/0b03a8fd5f4e9073c5bace25bbde8ad3ea2b75c3))
* **deps:** Replace uglify-es with uglify-js ([#1114](https://github.com/mdn/bob/issues/1114)) ([647f098](https://github.com/mdn/bob/commit/647f098764cf4dfc15176ac35007f97aec489793))
* Fix file references ([#1116](https://github.com/mdn/bob/issues/1116)) ([38bb023](https://github.com/mdn/bob/commit/38bb023903e047196f06f6e9062398cb66f5f2e5))
* **jest:** specify host ([#1108](https://github.com/mdn/bob/issues/1108)) ([4660078](https://github.com/mdn/bob/commit/46600788468e90c7171611e29f9ba604da919dda))

## [3.0.0](https://github.com/mdn/bob/compare/v2.2.0...v3.0.0) (2023-02-09)

### ⚠ BREAKING CHANGES

- change mdn-bob to @mdn/bob ([#1073](https://github.com/mdn/bob/issues/1073))
- Use ES6 features ([#918](https://github.com/mdn/bob/issues/918))
- Bump minimum Node.js to v16 ([#882](https://github.com/mdn/bob/issues/882))
- Convert to ESM ([#880](https://github.com/mdn/bob/issues/880))

### Code Refactoring

- change mdn-bob to @mdn/bob ([#1073](https://github.com/mdn/bob/issues/1073)) ([67b4f33](https://github.com/mdn/bob/commit/67b4f330e7b7a1581df9608ce0ecdbde4830fdd4))
- Use ES6 features ([#918](https://github.com/mdn/bob/issues/918)) ([78e022e](https://github.com/mdn/bob/commit/78e022e5d5f7a96ec4cce48d496b6711ea0d6f20))
- Replace Prismjs and manual code editing system with CodeMirror ([#888](https://github.com/mdn/bob/issues/888)) ([839c592](https://github.com/mdn/bob/commit/839c592e6e4e66c8f305dd914de2c1aeaf4f763b))
- Update CodeMirror to v6 & drop Browserify ([#907](https://github.com/mdn/bob/issues/907)) ([059aa9a](https://github.com/mdn/bob/commit/059aa9aef38d82094b4c3321f47233dc6c10ad86))
- Tabbed examples use IFrame instead of Shadow DOM ([#903](https://github.com/mdn/bob/issues/903)) ([61478c7](https://github.com/mdn/bob/commit/61478c7fd07cb7d46b4887827d86f53d41817aae))
- Convert to ESM ([#880](https://github.com/mdn/bob/issues/880)) ([5fbaec9](https://github.com/mdn/bob/commit/5fbaec9ea8c8d192f66c1d8ee315d9e802702110))
- Bump minimum Node.js to v16 ([#882](https://github.com/mdn/bob/issues/882)) ([14244c5](https://github.com/mdn/bob/commit/14244c520b779c0ec0cfe818fdfc4833da6f5030))
- Migrate to Webpack ([#867](https://github.com/mdn/bob/issues/867)) ([f3dd3c3](https://github.com/mdn/bob/commit/f3dd3c389250c35d4cd54dcc99e77c0b40193d46)), ([#871](https://github.com/mdn/bob/issues/871)) ([d150405](https://github.com/mdn/bob/commit/d1504059234db26c9e34be538fcd2a195c3c0a89)), ([#925](https://github.com/mdn/bob/issues/925)) ([6e800ed](https://github.com/mdn/bob/commit/6e800ed8e636e4ca6d6fe1d4aeb8d4fb6bd0ff59)) and ([#907](https://github.com/mdn/bob/issues/907)) ([059aa9a](https://github.com/mdn/bob/commit/059aa9aef38d82094b4c3321f47233dc6c10ad86))

### Features

- Add `height-data.json` ([#839](https://github.com/mdn/bob/issues/839)) ([b4f2d09](https://github.com/mdn/bob/commit/b4f2d09a4e53a1ba16f13f5348bdecdc6f598031)) and ([#1075](https://github.com/mdn/bob/issues/1075)) ([68f955d](https://github.com/mdn/bob/commit/68f955d32f1d34a599d053db7264259bf8c966ac))
- Add support for MathML ([#1063](https://github.com/mdn/bob/issues/1063)) ([ac213d2](https://github.com/mdn/bob/commit/ac213d223b8c48fff1f6ff0bdbb38c8dbe6a6542))
- Add `build:pages` to fast build pages without Webpack ([#1008](https://github.com/mdn/bob/issues/1008)) ([e421916](https://github.com/mdn/bob/commit/e421916b47a2a1c6ea0b010db65752006f01db0d))
- Allow hidden CSS src in tabbed examples ([#989](https://github.com/mdn/bob/issues/989)) ([50a2473](https://github.com/mdn/bob/commit/50a2473e6c72aabaa896fc9ea81819ead37d741e))
- Apply border-radius to JS frame ([#1003](https://github.com/mdn/bob/issues/1003)) ([7ec7f6c](https://github.com/mdn/bob/commit/7ec7f6cafbcc2f02c92749f0523eb1166d517dd0))
- Add hover background to tabs ([#1007](https://github.com/mdn/bob/issues/1007)) ([ee9c73](https://github.com/mdn/bob/commit/ee9c73ea1be2c2ccca1045b0896e803719199fcb))
- Enable all standardized wasm features ([#1046](https://github.com/mdn/bob/issues/1046)) ([639aabc](https://github.com/mdn/bob/commit/639aabceb018a44fe10e70808b4c386c433c019c))
- Add UI on unsupported property values ([#763](https://github.com/mdn/bob/issues/763)) ([85c0529](https://github.com/mdn/bob/commit/85c05294c2679662141fcfc06683f204480b74b0))
- Add hover background color to editor tabs (with transitions) ([#865](https://github.com/mdn/bob/issues/865)) ([ae46756](https://github.com/mdn/bob/commit/ae46756f7566a839797cec1f77567786b493efbd))
- Optional tabs ([#812](https://github.com/mdn/bob/issues/812)) ([00bc9b0](https://github.com/mdn/bob/commit/00bc9b0d90f1fa887d0ad3f90d3ebe64bcfbe77a))
- Enable reference-types in wasm examples ([#842](https://github.com/mdn/bob/issues/842)) ([9311bdf](https://github.com/mdn/bob/commit/9311bdf5965c38a11c29bd09975396d562adc0f1))
- Enable exceptions flag for wasm ([#782](https://github.com/mdn/bob/issues/782)) ([59da034](https://github.com/mdn/bob/commit/59da034e228b3d60c25594163b52d9243cbe9e65))

### Bug Fixes

- Catch localStorage usage exception ([#1038](https://github.com/mdn/bob/issues/1038)) ([bf461ca](https://github.com/mdn/bob/commit/bf461ca73728074da24b04b2e9fe91cc44ba65bd))
- Fix height of tabbed examples ([#1006](https://github.com/mdn/bob/issues/1006)) ([9d5905d](https://github.com/mdn/bob/commit/9d5905dc9ef8f22bd428486657982d01a866c330))
- Fix height of CSS example buttons ([#1005](https://github.com/mdn/bob/issues/1005)) ([00bba90](https://github.com/mdn/bob/commit/00bba90ea563e30b9064494a66772b2f05039635))
- Fix double border in WAT examples ([#1004](https://github.com/mdn/bob/issues/1004)) ([056bbfe](https://github.com/mdn/bob/commit/056bbfec40b18406e48096c0940a646eef59869c))
- Remove `%example-css-src%` when no path to CSS ([#988](https://github.com/mdn/bob/issues/988)) ([4abcd2a](https://github.com/mdn/bob/commit/4abcd2a6983324b0518f0477c56bb140b10aebe2))
- Fix output refresh on init ([#960](https://github.com/mdn/bob/issues/960)) ([b0996af](https://github.com/mdn/bob/commit/b0996af547984a301b57443c03f0d6791825dcd0))
- Correct behavior for URL fragment links ([#914](https://github.com/mdn/bob/issues/914)) ([6d82045](https://github.com/mdn/bob/commit/6d82045e1eb276398fce271ff9f97b534290ed1f))
- Improve color contrast ([#908](https://github.com/mdn/bob/issues/908)) ([b9f5252](https://github.com/mdn/bob/commit/b9f52521e34b4b8ed98507add6dc62e08cbfc89c))
- Minimum top margin in tabbed examples ([#820](https://github.com/mdn/bob/issues/820)) ([870de64](https://github.com/mdn/bob/commit/870de64079f15c1664c5b00c72e4b5946ece79f3))
- Fix mask-clip live example ([#873](https://github.com/mdn/bob/issues/873)) ([29ee5f2](https://github.com/mdn/bob/commit/29ee5f2fe9662d96cc816baaaf52b2ecba8cb7e7))
- Fix horizontal scrollbar ([#837](https://github.com/mdn/bob/issues/837)) ([54c2d4c](https://github.com/mdn/bob/commit/54c2d4c51f0b92259c02bd330b761990fe9d4b5d))
- **editor:** handle paste events properly ([#776](https://github.com/mdn/bob/issues/776)) ([5beccb7](https://github.com/mdn/bob/commit/5beccb7f45fe86280ef520cedb8cb3a4e55e97c3))
- **editor:** replace margin-top on tab-list by border-top on tab ([#773](https://github.com/mdn/bob/issues/773)) ([d34d8a0](https://github.com/mdn/bob/commit/d34d8a06810d15f510cf275822b8b20cb5a9c05d))
- **editor:** warn if JavaScript disabled or unsupported feature ([#759](https://github.com/mdn/bob/issues/759)) ([08fe714](https://github.com/mdn/bob/commit/08fe714908ad23dc3557d7778c03ff5c07c51692))

## [2.2.0](https://github.com/mdn/bob/compare/v2.1.7...v2.2.0) (2022-04-27)

### Features

- **editor:** allow setting defaultTab in tabbed examples ([#758](https://github.com/mdn/bob/issues/758)) ([7bc449d](https://github.com/mdn/bob/commit/7bc449d533d44e97c5e42e0fc68c695bbfa84df9))

### [2.1.7](https://github.com/mdn/bob/compare/v2.1.6...v2.1.7) (2022-04-20)

### Bug Fixes

- palette ~ update color palette to reflect new palette ([#760](https://github.com/mdn/bob/issues/760)) ([6822412](https://github.com/mdn/bob/commit/682241218a04010791f86366c774eea457f8b1a7))

### [2.1.6](https://github.com/mdn/bob/compare/v2.1.5...v2.1.6) (2022-04-15)

### Bug Fixes

- **editor/console:** detect object constructor/prototype properly ([#745](https://github.com/mdn/bob/issues/745)) ([39f75ae](https://github.com/mdn/bob/commit/39f75ae317212eef87f65509a2ecb746e0e8904f))
- **editor:** add missing font ([#752](https://github.com/mdn/bob/issues/752)) ([0928e77](https://github.com/mdn/bob/commit/0928e7750781f1770f47e40223783353fcbadb98))

### [2.1.5](https://github.com/mdn/bob/compare/v2.1.4...v2.1.5) (2022-03-04)

### Bug Fixes

- editor style cursor for light and dark modes ([#726](https://github.com/mdn/bob/issues/726)) ([3af8794](https://github.com/mdn/bob/commit/3af879435cabba189108f4d83f9f2a45a1994a0e))

### [2.1.4](https://github.com/mdn/bob/compare/v2.1.3...v2.1.4) (2022-03-04)

### Bug Fixes

- editor use domcontentloaded ([#723](https://github.com/mdn/bob/issues/723)) ([d73801c](https://github.com/mdn/bob/commit/d73801c5820d2d15200802f4c986850b79f30523))

### [2.1.3](https://github.com/mdn/bob/compare/v2.1.2...v2.1.3) (2022-03-01)

### Bug Fixes

- release - Merge redesign changes into main ([#711](https://github.com/mdn/bob/issues/711)) ([28c31ec](https://github.com/mdn/bob/commit/28c31ec392efe83a030115515154c51095bac56f))

### [2.1.2](https://github.com/mdn/bob/compare/v2.1.1...v2.1.2) (2022-03-01)

### Bug Fixes

- release - Merge redesign changes into main ([#711](https://github.com/mdn/bob/issues/711)) ([28c31ec](https://github.com/mdn/bob/commit/28c31ec392efe83a030115515154c51095bac56f))

### [2.1.1](https://github.com/mdn/bob/compare/v2.1.0...v2.1.1) (2022-03-01)

### Bug Fixes

- release - Merge redesign changes into main ([#711](https://github.com/mdn/bob/issues/711)) ([28c31ec](https://github.com/mdn/bob/commit/28c31ec392efe83a030115515154c51095bac56f))

## [2.1.0](https://github.com/mdn/bob/compare/v2.0.1...v2.1.0) (2022-01-28)

### Features

- Added wasm example type ([#619](https://github.com/mdn/bob/issues/619)) ([2dc54ae](https://github.com/mdn/bob/commit/2dc54aefbd025a811ac3ebea83cd54aa214ea862))

### Bug Fixes

- add support for special object types in console ([#578](https://github.com/mdn/bob/issues/578)) ([04a3b9d](https://github.com/mdn/bob/commit/04a3b9dbb2d3d5121c0fe82f2cb7af0a14f17b01))
- add workflows for new issues and pull requests ([#628](https://github.com/mdn/bob/issues/628)) ([8d07fc6](https://github.com/mdn/bob/commit/8d07fc687f6f486f3e28f248964a7d1c03f93ae5))
- cleanup and update post message listener ([#642](https://github.com/mdn/bob/issues/642)) ([e27ddf8](https://github.com/mdn/bob/commit/e27ddf8deabb9f08a75a361e39b6ae1631e19b06))
- do not auto focus js editor ([#598](https://github.com/mdn/bob/issues/598)) ([e64fee8](https://github.com/mdn/bob/commit/e64fee87f2c83602e255824a928ba47ae320cfdb)), closes [#593](https://github.com/mdn/bob/issues/593)
- publish workflow ([#644](https://github.com/mdn/bob/issues/644)) ([7815cf7](https://github.com/mdn/bob/commit/7815cf75663e61eb3cc8575799ff544c9656b475))
- use appropriate GitHub token ([#639](https://github.com/mdn/bob/issues/639)) ([b0b44fd](https://github.com/mdn/bob/commit/b0b44fd5fa362ca717eac2318c2f5674cd6a7d04))
