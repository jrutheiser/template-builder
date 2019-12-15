# Template Builder

## Usage

### Folder Structure

    .
    ├── ...
    ├── templates                    
    │   ├── components               # Components/partials used within the templates
    │   |   ├── header.hbs           
    │   ├── layouts                  # Layouts (must use `{{{yield}}}` to output template body)
    │   |   ├── default.hbs          
    │   └── index.hbs                # Templates
    └── ...

### Code

```javascript
const templateCompiler = require('template-builder');

templateBuilder({
  path: './templates',         // relative path to template directory
  layout: 'default.hbs',       // layout file name
  output: './dist',            // relative path to output build directory
  watch: false,                // watch files for changes
  componentsAsTemplates: false // build component files like it would templates
});
```

### CLI

```bash
  $ template-builder --path=./templates --layout=default.hbs --output=./dist --buildComponents --watch
```