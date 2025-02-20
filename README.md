# BoB

> [!WARNING]
> This repository is in the process of being **archived**!
>
> New pull requests will be closed, so do not work on issues or tasks relating to this repository to avoid lost time and work.
> For more information, see <https://github.com/orgs/mdn/discussions/782>.

Builder of Bits aka The [MDN Web Docs interactive examples](https://github.com/mdn/interactive-examples) example builder.

## Contributing

If you want to contribute to BoB, please follow these steps:

- [Create a fork](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#forking-a-repository)
- [Open an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue) if one does not [already exist](https://github.com/mdn/bob/issues)
- Create a [feature branch](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) based on the issue you are working on
- [Add and commit](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#making-and-pushing-changes) your changes
- [Open a pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#making-a-pull-request)

Thank you for your interest in contributing to MDN Web Docs.

> NOTE: By contributing to BoB and MDN Web Docs you acknowledge that you have read and agree to our [code of conduct](./CODE_OF_CONDUCT.md).

## Source Folder Structure

```
-editor # All files related to the interactive examples editor
|--> css
|--> js
|--> media # media used only by the editor
|--> tmpl
-live-examples # All example related files and media (only used for testing purposes)
|--> css-examples
|--> fonts # fonts used by the editor and examples
|--> html-examples
|--> js-examples
|--> mathml-examples
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
|----> wat # WebAssembly examples
|----> mathml # MathML examples
|----> webapi-tabbed # Web API examples (not currently used in production)
```

## Testing Bob without the interactive examples repository

As mentioned above, this repository contains a couple of representative examples that you can use to test Bob. For most use cases, this should be enough and allow you to test your changes without installing BoB locally and integrating it with the interactive examples repository.

To test your changes, run:

```
npm start
```

You should see output similar to the following:

```bash
MDN-BOB: Cleaning or creating ./docs/....
MDN-BOB: Copying static assets....
MDN-BOB: Compiling editor JavaScript....
MDN-BOB:  ../editor/js/editable-css-bundle.js written to disk
MDN-BOB:  ../editor/js/editable-js-bundle.js written to disk
MDN-BOB:  ../editor/js/editable-wat-bundle.js written to disk
MDN-BOB:  ../editor/js/editor-bundle.js written to disk
MDN-BOB: Pages built successfully
```

This will build the local examples and startup a local server serving the examples. Navigate to [localhost:4444](http://127.0.0.1:4444/) and open one of the examples to test your changes.

## Testing Bob as part of interactive examples

When working on changes to BoB, you might need to test against more examples than those that are a part of this repository. In those cases, you will need to run a local version of Bob inside the interactive-examples repo. Use the following command from the root of your local copy of the [interactive-examples](https://github.com/mdn/interactive-examples) repo:

```
npx install-local ~/path/to/bob && node node_modules/.bin/mdn-bob
```

### Stuck? Ask for help.

If you get stuck while working on BoB, there are a couple of ways to get help.

- Add a comment to the issue you are working on and tag the @mdn/code-dev team.
- Open a discussion in the [platform](https://github.com/orgs/mdn/discussions/categories/platform) category.
- Connect with the team and the rest of the community on [Matrix](https://chat.mozilla.org/#/room/#mdn:mozilla.org).
