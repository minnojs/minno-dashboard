## PI Dashboard

This is the repository for the PI dashboard.


### Installation
In order to test it out you should first clone it: 

```
git clone https://github.com/ProjectImplicit/pi-validator.git
```

Next you should install all dependencies:

```
npm install
```

You should see all dependencies being downloaded from `npm`. 

### Development
This project is written in es6 (using [babel](https://babeljs.io/) and [rollup](http://rollupjs.org/)). CSS is generated using [SASS](http://sass-lang.com/). Source files are built from the `src` directory to `dist`. All build tasks are managed npm scripts.

Running `npm start` will set up a development server with mocks for all backend operations (see [fixtures.js](fixtures.js)) as well as watch `src` for changes and rebuild the project for every change.

### Structure
We use [mithril.js](http://mithril.js.org/) as our framework of choice, and polyfills to make sure [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [Fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) work everywhere.

The routes are set up in [/src/routes.js](/src/routes.js) and wrapped within the layout component at [/layoutComponent.js](/layoutComponent.js), The layout component is also responsible for user authentication. Each of the main routes of the dashboard has a directory of its own, and there is a directory for commonly used utilities as well.
