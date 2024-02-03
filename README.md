<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: nuxt-i18n-auto-config
- Description: My new Nuxt module
-->

# nuxt-i18n-auto-config

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

I wanted to see if it was possible to seperate each language definition away from the `nuxt.config` file. It worked, while not being too pretty. But i managed to make language definitions simpler. \
A language definition looks like

```ts
import { defineProjectLocale } from "nuxt-i18n-auto-config/runtime/composables";

export default defineProjectLocale({
  locale: { code: "en", iso: "en", name: "English" },
  datetimeFormats: {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  },
  numberFormats: {
    currency: {
      style: "currency",
      currency: "USD",
    },
  },
});
```

Havent figured out how it can auto import the `defineProjectLocale` function.


<!-- - [✨ &nbsp;Release Notes](/CHANGELOG.md) -->
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-i18n-auto-config?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->

- Auto loading locale files
- Datetime & Number format

### Planned

- Namespaced files

### Maybe

- Output locale messages to build dir

## Config

```ts
export default defineNuxtConfig({
  modules: ["nuxt-i18n-auto-config", "@nuxtjs/i18n"],
  i18nAutoConfig: {
    paths: {

      /**
       * The path where your locale definitions are placed
       */
      localeDefinitionsPath: "config/locales",

      /**
       * The path where your locales are placed
       */
      localesPath: "locales",
    },

    /**
     * Expressions are used to match paths and files
     */
    expressions: {

      /**
       * {localeDefinitionsPath} replaced with i18nAutoconfig.paths.localeDefinitionsPath
       * Default is "./config/locales/"
       * Example "./config/locales/en.ts"
       */
      localeDefinition: "{localeDefinitionsPath}/",

      /**
       * {localePath} is replaced with the variable in i18nAutoconfig.paths.localesPath
       * {locale} is replaced with the code for that specific locale be it "en" or "en-UK"
       * Default is "./locales/{locale}/"
       * Example "./locales/en/" - contains *.json files
       */
      locales: "{localesPath}/{locale}/",
    },
  },
});
```

## Quick Setup

0. Install [`@nuxtjs/i18n`](https://i18n.nuxtjs.org/getting-started/setup)

1. Add `nuxt-i18n-auto-config` dependency to your project

```bash
# Using npm
npm install --save-dev nuxt-i18n-auto-config

...
```

2. Add `nuxt-i18n-auto-config` to the `modules` section of `nuxt.config.ts`, before `@nuxtjs/i18n`. Reason mentioned [here](https://i18n.nuxtjs.org/guide/extend-messages)

```js
export default defineNuxtConfig({
  modules: ["nuxt-i18n-auto-config", "@nuxtjs/i18n"],
});
```

That's it! You can now use `nuxt-i18n-auto-config` in your Nuxt app ✨

## Development

```bash
# Install dependencies
bun install

# Generate type stubs
bun run dev:prepare

# Develop with the playground
bun run dev

# Build the playground
bun run dev:build

# Run ESLint
bun run lint

# Run Vitest
bun run test
bun run test:watch

# Release new version
bun run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-i18n-auto-config/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-i18n-auto-config
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-i18n-auto-config.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-i18n-auto-config
[license-src]: https://img.shields.io/npm/l/nuxt-i18n-auto-config.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-i18n-auto-config
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
