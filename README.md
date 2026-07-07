# OCP form server
This project handles Github authentication and creates Pull Requests for [OCP forms](https://github.com/developmentseed/ocp-form). Please check that repo for more information.

This project is a fork of a [Blue Pencil server](https://github.com/developmentseed/blue-pencil-server).

### Requirements
- [Node.js](https://nodejs.org/) (see the `engines` field in `package.json` for the supported version)
- [pnpm](https://pnpm.io/)

### Setup
Install dependencies:
```
pnpm install
```

**GitHub token**
The app needs a GitHub token. Either set the `GH_TOKEN` environment variable, or create `app/config/local.js`:
```js
module.exports = {
    ghToken: "<token>",
};
```

**GitHub repo**
The repo used for data storage is set in `app/config/production.js`, and can be overridden in `app/config/local.js`:
```js
module.exports = {
    ghUser: "<user>",
    ghRepo: "<repo>",
};
```

### Running the app
Development (restarts on file changes via [nodemon](https://nodemon.io/), serving at `http://localhost:3000`):
```
OC_ENV=development pnpm exec nodemon app/index.js
```

Production:
```
OC_ENV=production node app/index.js
```

### Linting
Check formatting and lint (as CI does):
```
pnpm exec biome ci --indent-style=space --line-width=119
```
Apply fixes:
```
pnpm exec biome check --write
```

