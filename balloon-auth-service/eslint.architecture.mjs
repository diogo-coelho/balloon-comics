import path from 'node:path';
import { builtinModules } from 'node:module';

const layers = new Set([
  'application',
  'db',
  'domain',
  'infrastructure',
  'modules',
  'presentation',
]);

const allowedImports = {
  application: new Set(['application', 'domain']),
  domain: new Set(['domain']),
  infrastructure: new Set(['application', 'domain', 'infrastructure']),
  modules: layers,
  presentation: new Set(['application', 'domain', 'presentation']),
};

function getLayer(filename) {
  const normalizedFilename = filename.replaceAll('\\', '/');
  const sourcePath = normalizedFilename.includes('/src/')
    ? normalizedFilename.split('/src/').pop()
    : normalizedFilename.replace(/^src\//, '');
  if (!sourcePath) return undefined;

  const [layer] = sourcePath.split('/');
  return allowedImports[layer] ? layer : undefined;
}

function getImportedLayer(filename, importPath) {
  if (!importPath.startsWith('.')) return undefined;

  const importedPath = path.resolve(path.dirname(filename), importPath).replaceAll('\\', '/');
  const sourcePath = importedPath.split('/src/').pop();
  if (!sourcePath) return undefined;

  const [layer] = sourcePath.split('/');
  return layers.has(layer) ? layer : undefined;
}

function isBuiltinModule(importPath) {
  return builtinModules.includes(importPath) || importPath.startsWith('node:');
}

const architectureRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce clean architecture layer dependencies',
    },
    schema: [],
    messages: {
      forbiddenLayer: 'The {{fromLayer}} layer cannot import the {{toLayer}} layer.',
      forbiddenExternal: 'The {{fromLayer}} layer cannot import external packages.',
    },
  },
  create(context) {
    const filename = context.filename;
    const fromLayer = getLayer(filename);

    if (!fromLayer || filename.includes(`${path.sep}test${path.sep}`)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const toLayer = getImportedLayer(filename, importPath);

        if (toLayer && !allowedImports[fromLayer].has(toLayer)) {
          context.report({
            node: node.source,
            messageId: 'forbiddenLayer',
            data: { fromLayer, toLayer },
          });
        } else if (
          (fromLayer === 'domain' || fromLayer === 'application') &&
          !importPath.startsWith('.') &&
          !isBuiltinModule(importPath)
        ) {
          context.report({
            node: node.source,
            messageId: 'forbiddenExternal',
            data: { fromLayer },
          });
        }
      },
    };
  },
};

export const architectureConfig = {
  files: ['src/**/*.ts'],
  ignores: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  plugins: {
    architecture: {
      rules: {
        'layer-dependencies': architectureRule,
      },
    },
  },
  rules: {
    'architecture/layer-dependencies': 'error',
  },
};