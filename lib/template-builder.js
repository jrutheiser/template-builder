const path = require('path');
const fs = require('fs');
const glob = require('glob');
const nsfw = require('nsfw');
const Handlebars = require('handlebars');
const repeatHelper = require('handlebars-helper-repeat');

const LAYOUT_PATH = 'layouts';
const COMPONENTS_PATH = 'components';
const FILE_PATTERN = '*.hbs';
const BUILD_FILE_PATTERN = '*.html';

const state = {
  watcher: null,
  registeredComponents: []
};

Handlebars.registerHelper('repeat', repeatHelper);
Handlebars.registerHelper('equals', (arg1, arg2, options) => {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const getHandlebarsTemplate = (file) => {
  const data = fs.readFileSync(file, 'utf-8');
  if (!data) return '';

  return Handlebars.compile(data);
};

const registerComponents = (componentFiles) => {
  state.registeredComponents.forEach((componentName) => {
    Handlebars.unregisterPartial(componentName);
  });
  state.registeredComponents = [];

  componentFiles.forEach((componentFile) => {
    const ext = path.extname(componentFile);
    const componentName = path.basename(componentFile, ext);
    const componentData = fs.readFileSync(componentFile, 'utf-8');

    Handlebars.registerPartial(componentName, componentData);
    state.registeredComponents.push(componentName)
  });
};

const buildTemplate = (templateFile, layout, outputPath, data) => {
  const ext = path.extname(templateFile);
  const templateName = path.basename(templateFile, ext);
  const outputFilePath = path.resolve(outputPath, `${templateName}.html`);

  const compiled =  layout({
    yield: getHandlebarsTemplate(templateFile),
    ...data
  });

  fs.writeFile(outputFilePath, compiled, () => {
    console.log(`Updated template: ${templateName}${ext}`);
  });
};

const cleanTemplates = (basePath, outputPath) => {
  const buildFilePattern = path.resolve(basePath, outputPath, BUILD_FILE_PATTERN);
  const buildFiles = glob.sync(buildFilePattern);

  buildFiles.forEach(fs.unlinkSync);
};

const createComponentDir = (outputPath) => {
  const directoryPath = path.resolve(outputPath, COMPONENTS_PATH);
  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }
};

const createBuildDir = () => {
  const directoryPath = path.resolve(outputPath);
  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }
};

const buildTemplates = ({
  layout,
  watch = false,
  componentsAsTemplates = false,
  path: basePath,
  output: outputPath,
}) => {
  const templateFilePattern = path.resolve(basePath, FILE_PATTERN);
  const componentFilePattern = path.resolve(basePath, COMPONENTS_PATH, FILE_PATTERN);
  const layoutFile = path.resolve(basePath, LAYOUT_PATH, layout);
  const componentOutputPath = path.resolve(outputPath, COMPONENTS_PATH);

  createBuildDir();

  if (componentsAsTemplates) {
    createComponentDir(outputPath);
  }

  const buildTemplateItems = () => {
    const layoutTemplate = getHandlebarsTemplate(layoutFile);
    const templateFiles = glob.sync(templateFilePattern);
    const componentFiles = glob.sync(componentFilePattern);

    cleanTemplates(basePath, outputPath);
    registerComponents(componentFiles);

    try {
      templateFiles.forEach(
        templateFile => buildTemplate(templateFile, layoutTemplate, outputPath)
      );

      if (componentsAsTemplates) {
        componentFiles.forEach(
          componentFile => buildTemplate(
            componentFile,
            layoutTemplate,
            componentOutputPath,
            { isComponent: true }
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (watch) {
    nsfw(
      basePath,
      buildTemplateItems
    )
      .then((watcher) => {
        state.watcher = watcher;
        return watcher.start();
      });
  }

  buildTemplateItems();
};

process.on('exit', () => {
  if (state.watcher !== null) {
    state.watcher.stop();
  }
});

process.on('SIGINT', () => {
  process.exit(2);
});

module.exports = buildTemplates;