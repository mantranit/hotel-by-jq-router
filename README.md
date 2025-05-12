## Boilerplate HTML

### Features

* Simple **setup** instructions
  * Start development of a project right away with *simple*, *configured*, *browser synced*, *linter monitored* asset files.
* Starter assets directory for reference and **demo** building of:
  * JavaScript
  * SASS
  * Images
  * Fonts
* Support for **assets optimization** for production:
  * **Minification** of *JavaScript* and *CSS* files.
  * **Inline** **images** / **fonts** files having file size below a *configurable* threshold value.
* Code style and formatting **linters** configuration and setup for:
  * SASS
  * JavaScript
* Template engine
  * Twig
* Latest [Webpack 4](https://github.com/webpack/webpack) - JavaScript module bundler.
* Latest [SASS/CSS](https://github.com/sass/node-sass) compiler based on `node-sass` which provides bindings to `libsass`.
* Latest [Babel 7](https://github.com/babel/babel) (`@babel/core`) - JavaScript compiler - _Use next generation JavaScript, today._
* Configured and ready to use **BrowserSync** plugin - `browser-sync-webpack-plugin`

### Requirements

* `node` _>=_ `10.15.3`
* `npm`

### Setup

Install all dependencies using `npm`. 

```sh 
$ npm ci
$ npm run bundle
```
Enable source files watcher

```sh 
$ npm start
```

> More on the clean install npm command can be read here [`npm ci`](https://docs.npmjs.com/cli/ci.html)

> You can still use `npm install` in cases the `npm ci` raises system error due to specific platfrom incompatibilities.

### Production

Optimize assets for production by:

```sh
$ npm run build
```

* _CSS_ files are located under `/dist/assets/css/`
* _JavaScript_ files with support of _ES6 / ECMAScript 2016(ES7)_ files are located under `/dist/assets/js/`
* _Images_ are located under `/dist/assets/images/`
  * Images part of the _design_ (_usually referenced in the CSS_) are located under `/dist/assets/images/design/`
  * Images part of the _content_ (_usually referenced via `<img>` tags_) are located under `/dist/assets/images/content/`
* _Fonts_ are located under `/dist/assets/fonts/`
* _HTML_ files are located under `/dist/`

### Run Code Style Linters

* **SASS**

```sh
$ npm run lint-sass
```
* **JS**

```sh
$ npm run lint-js
```
