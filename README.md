assemble-static-boilerplate
===========================

A boilerplate using Assemble and Gulp to quickly and efficiently create static websites.

**Warning:** There is currently a bug in `gulp-assemble` that prevents data from being passed to templates. I have created an issue [here](https://github.com/assemble/gulp-assemble/issues/8). For now, data can be utilized by wrapping your JSON objects in a `module.exports` in a normal `.js` file, and importing it/working with it from there.

---

### Getting up and running

1. Clone this repo from `https://github.com/jakemmarsh/assemble-static-boilerplate.git`
2. Run `npm install` from the directory
3. Run `gulp dev` (may require installing Gulp globally)
4. Navigate to `localhost:3000` to view the application

Now that `gulp dev` is running, the server is up as well and serving files from the `/build` directory. Any changes in the `/public` directory will be automatically processed by Gulp and the server will be updated.

---

This boilerplate uses the latest versions of the following libraries:

- [Assemble](http://assemble.io/)
- [SASS](http://sass-lang.com/)
- [Gulp](http://gulpjs.com/)
- [Browserify](http://browserify.org/)

Along with many Gulp libraries (these can be seen in either `package.json` or at the top of `gulpfile.js`).

---

### Assemble

Assemble is a static site generator for Node.js. It is able to process data files, layouts, partials, and page files to compile your static site.

##### File Organization

All the files used to generate your static site are located within the `/public` directory, structured in the following manner:

```
/data              (any data files, in JSON format)
  team.json        (placeholder data file)
/helpers           (any custom Handlebars helpers)
  if_equals.js     (placeholder helper file)
/images            (all image files)
  browserify.png   (placeholder image file)
  gulp.png         (placeholder image file)
/js                (all Javascript files)
  main.js          (placeholder Javascript file)
/pages             (all HBS page files)
  index.hbs        (main index page)
  team.hbs         (example page using data files)
/styles            (all SASS files)
  /elements        (element-specific stylesheet files)
    _footer.scss   (placeholder stylesheet file)
    _header.scss   (placeholder stylesheet file)
  /pages           (page-specific stylesheet files)
    _team.scss     (placeholder stylesheet file)
  _base.scss       (base-level styles)
  _colors.scss     (color variables)
  _reset.scss      (simple CSS reset)
  _typography.scss (any universal typography/font variables or styles)
  main.scss        (main SASS file read by Gulp, into which all other SASS files should be imported)
/templates         (any reusable Handlebars files)
  /layouts         (top-level layouts to be used by pages)
    default.hbs    (simple layout example file)
  /partials        (reusable Handlebars components)
    footer.hbs     (simple partial example file)
    header.hbs     (simple partial example file)
```

##### Data

Assemble is able to automatically pull in data from JSON or YAML files (this boilerplate only utilizes JSON) and make them available to your pages via Handlebars. Any data JSON files should be placed within the `/data` directory. An example can be seen in `team.json`, which is referenced on the `team.hbs` page.

##### Helpers

Assemble is also able to utilize custom Handlebars helpers. These should all be placed within the `/helpers` directory and defined on `module.exports`. Once defined, you can then use them in any of your pages or partials. An example can be seen in `if_equals.js`.

##### Pages

The pages directory should contain any of your static website's pages, as the name suggests. For example, this boilerplate comes with an `index.hbs` (the home page), and `team.hbs` (a page to list team members). Each page uses a layout and can also have a custom page title (both defined at the top of the file).

##### Layouts

Layouts are the highest level of organization in a static website for Assemble. This is where the actual page is imported, along with any partials or additional code. This boilerplate comes with one layout, `default.hbs`, which pulls in a header partial, a footer partial, the "body" (the actual page), while also referencing any CSS or Javascript files necessary.

##### Partials

Partials can be thought of as reusable components written in Handlebars. This boilerplate comes with two very basic examples, `header.hbs` and `footer.hbs`. Partials can be imported into any page or layout by name using the Handlebars syntax, for example `{{> header }}` (as seen in the default layout discussed above).

---

### SASS

SASS, standing for 'Syntactically Awesome Style Sheets', is a CSS extension language adding things like extending, variables, and mixins to the language. This boilerplate provides some base styling along with the `main.scss` file, into which all your SASS files should be imported. A Gulp task (discussed later) is provided for compilation and minification of the stylesheets based on this file.

---

### Browserify

Browserify is a Javascript file and module loader, allowing you to `require('modules')` in all of your files in the same manner as you would on the backend in a node.js environment. The bundling and compilation is then taken care of by Gulp, discussed below.

---

### Gulp

Gulp is a "streaming build system", providing a very fast and efficient method for running your build tasks.

##### Web Server

Gulp is used here to provide a very basic node/Express web server for viewing and testing your application as you build. It serves static files from the `build/` directory. All Gulp tasks are configured to automatically reload the server upon file changes. The application is served to `localhost:3000` once you run the `gulp dev` task.

##### Scripts

A number of build processes are automatically run on all of our Javascript files, run in the following order:

- **JSHint:** Gulp is currently configured to run a JSHint task before processing any Javascript files. This will show any errors in your code in the console, but will not prevent compilation or minification from occurring.
- **Browserify:** The main build process run on any Javascript files. This processes any of the `require('module')` statements, compiling the files as necessary.
- **Uglifyify:** This will minify the file created by Browserify and ngAnnotate.

The resulting file (`main.min.js`) is placed inside the directory `/build/js/`.

##### Styles

Just one task is necessary for processing our SASS files, and that is `gulp-sass`. This will read the `main.scss` file, processing and importing any dependencies and then minifying the result. This file (`main.min.css`) is placed inside the directory `/build/css/`.

##### Images

Any images placed within `/app/images` will be compressed via imagemin, and the compressed images will be placed within the `/build/images` directory when preparing for production.

##### Data, Helpers, Pages, Partials, and Templates

These are all of the files used to actually build your static site via Assemble. Just one task (`assemble`) is run to process all of these files via Assemble, generating the corresponding static site files and placing them in the `/build` directory.

##### Watching files

All of the Gulp processes mentioned above are run automatically when any of the corresponding files in the `/public` directory are changed, and this is thanks to our Gulp watch tasks. Running `gulp dev` will begin watching all of these files, while also serving to `localhost:3000`.

##### Production Task

Just as there is the `gulp dev` task for development, there is also a `gulp prod` task for putting your project into a production-ready state. This will run each of the tasks, while also adding the `image` task discussed above. There is also an empty `gulp deploy` task that is included when running the production task. This deploy task can be fleshed out to automatically push your production-ready site to your hosting setup.
