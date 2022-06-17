# Let's rollup the local dev environment 

## Project setup
`yarn` or `npm i`

## Prepare `.env`
Copy the `.env.samle` to the `.env` and fill up the `# Development` section in the file.

```dotenv
...

# Development
# - API url
VUE_APP_API_DEV_URL=https://backend.heyka
# - Web app url
VUE_APP_WEB_DEV_URL=https://web.heyka

...
```

## Launch the application in the development mode with HMR enabled
```dotenv
# With yarn
yarn electron:serve

# With npm
npm run electron:serve
```

## Launch the electron-builder and build production ready app
Builds will be placed in the `./dist_electron` folder
```dotenv
# With yarn
yarn electron:build

# With npm
npm run electron:build
```

## Lint and fix `.js .vue` files
```dotenv
# With yarn
yarn lint-fix

# With npm
npm run lint-fix
```
