# rntrc-js

![NPM Version](https://img.shields.io/npm/v/rntrc?style=flat)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dnrovs/rntrc-js/ci-cd.yml?style=flat)
![NPM Last Update](https://img.shields.io/npm/last-update/rntrc?style=flat)
![NPM Downloads](https://img.shields.io/npm/d18m/rntrc?style=flat)

Library for decoding and generating Ukrainian taxpayer identification numbers.

**[Documentation](https://dnrovs.github.io/rntrc-js/)** | **[RNTRC on Ukrainian Wikipedia](https://uk.wikipedia.org/wiki/Реєстраційний_номер_облікової_картки_платника_податків)**

## Installation
```
npm i rntrc
```

## Importing
### ES Modules
```javascript
import Rntrc from 'rntrc'
```
### CommonJS
```javascript
const Rntrc = require('rntrc')
```
### Browser (CDN)
```html
<script src="https://unpkg.com/rntrc@1/dist/index.umd.js"></script>
```
### Browser (module)
```html
<script type="module">
    import Rntrc from 'https://unpkg.com/rntrc@1/dist/index.js'
</script>
```

## Usage
### Decoding
```javascript
const instance = new Rntrc(1234567899)

console.log(
    instance.birthdate().toLocaleDateString(),
    instance.gender()
)
```
### Generating
```javascript
const generated = Rntrc.generate({
    month: 4,
    gender: 'male'
})

console.log(generated)
```