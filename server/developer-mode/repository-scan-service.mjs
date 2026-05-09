/* =============================================================================
   00) FILE INDEX
   01) IMPORTS
   02) REGISTRY HELPERS
   03) PATH SAFETY
   04) FILE CLASSIFICATION
   05) READ-ONLY SCAN
   06) REPOSITORY INTELLIGENCE
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) IMPORTS
============================================================================= */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { developerModeConfig } from './config.mjs';

/* =============================================================================
   02) REGISTRY HELPERS
============================================================================= */
const REPOSITORY_REGISTRY_PATH = path.join(
  developerModeConfig.docsRoot,
  'assets/data/website/development-cockpit/repository-scope-registry.json'
);

async function loadRepositoryRegistry() {
  const text = await readFile(REPOSITORY_REGISTRY_PATH, 'utf8');
  return JSON.parse(text);
}

export async function resolveRepositoryRoot(repositoryId) {
  const registry = await loadRepositoryRegistry();
  const repository = (registry.repositories || []).find((entry) => entry.id === repositoryId);
  return repository?.root ? path.resolve(repository.root) : '';
}

/* =============================================================================
   03) PATH SAFETY
============================================================================= */
function isAllowedRoot(candidate) {
  const resolved = path.resolve(candidate);
  return developerModeConfig.allowedRoots.some((allowedRoot) => {
    const relative = path.relative(allowedRoot, resolved);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  });
}

function shouldSkip(name) {
  return [
    '.git',
    '.codex',
    '.env',
    '.env.local',
    'node_modules',
    '.DS_Store',
    '__pycache__',
    '.cache'
  ].includes(name);
}

/* =============================================================================
   04) FILE CLASSIFICATION
============================================================================= */
function classifyFile(filePath = '') {
  const extension = path.extname(filePath).toLowerCase();

  if (['.mjs', '.js', '.ts', '.tsx', '.jsx'].includes(extension)) {
    return 'runtime_source';
  }

  if (['.css'].includes(extension)) {
    return 'style_source';
  }

  if (['.html'].includes(extension)) {
    return 'markup_source';
  }

  if (['.json', '.yaml', '.yml'].includes(extension)) {
    return 'configuration_source';
  }

  if (['.md'].includes(extension)) {
    return 'documentation_source';
  }

  return 'generic_source';
}

/* =============================================================================
   05) READ-ONLY SCAN
============================================================================= */
async function walkFiles(root, current = root, files = []) {
  if (files.length >= 240) return files;

  const entries = await readdir(current, { withFileTypes:true });
  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue;

    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(root, absolute, files);
      continue;
    }

    if (entry.isFile()) {
      const fileStat = await stat(absolute);
      const relativePath = path.relative(root, absolute);

      files.push({
        path:relativePath,
        size:fileStat.size,
        classification:classifyFile(relativePath),
        extension:path.extname(relativePath).toLowerCase(),
        runtimeCritical:Boolean(
          relativePath.includes('server/')
          || relativePath.includes('runtime')
          || relativePath.includes('system/')
          || relativePath.includes('developer-mode')
        )
      });
    }
  }

  return files;
}

export async function scanRepository({ repositoryId }) {
  const root = await resolveRepositoryRoot(repositoryId);
  if (!root) {
    return {
      ok:false,
      status:'repository_not_found',
      reason:'Repository is not present in the governed repository registry.'
    };
  }

  if (!isAllowedRoot(root)) {
    return {
      ok:false,
      status:'repository_root_not_allowed',
      reason:'Repository root is outside DEVELOPER_ALLOWED_ROOTS.'
    };
  }

  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) {
    return {
      ok:false,
      status:'repository_root_invalid',
      reason:'Repository root is not a directory.'
    };
  }

  const files = await walkFiles(root);
  return {
    ok:true,
    status:'read_only_scan_complete',
    repositoryId,
    root,
    fileCount:files.length,
    files
  };
}


/* =============================================================================
   06) REPOSITORY INTELLIGENCE
============================================================================= */
export async function generateRepositoryIntelligence({ repositoryId }) {
  const scan = await scanRepository({ repositoryId });

  if (!scan.ok) {
    return scan;
  }

  const intelligence = {
    generatedAt:new Date().toISOString(),
    repositoryId,
    runtimeFiles:0,
    styleFiles:0,
    markupFiles:0,
    configurationFiles:0,
    documentationFiles:0,
    runtimeCriticalFiles:0,
    extensions:{},
    runtimeZones:new Set()
  };

  for (const file of scan.files) {
    intelligence.extensions[file.extension] = (
      intelligence.extensions[file.extension] || 0
    ) + 1;

    if (file.classification === 'runtime_source') {
      intelligence.runtimeFiles += 1;
    }

    if (file.classification === 'style_source') {
      intelligence.styleFiles += 1;
    }

    if (file.classification === 'markup_source') {
      intelligence.markupFiles += 1;
    }

    if (file.classification === 'configuration_source') {
      intelligence.configurationFiles += 1;
    }

    if (file.classification === 'documentation_source') {
      intelligence.documentationFiles += 1;
    }

    if (file.runtimeCritical) {
      intelligence.runtimeCriticalFiles += 1;
    }

    if (file.path.includes('developer-mode')) {
      intelligence.runtimeZones.add('developer-mode');
    }

    if (file.path.includes('system/')) {
      intelligence.runtimeZones.add('system-layer');
    }

    if (file.path.includes('server/')) {
      intelligence.runtimeZones.add('server-runtime');
    }
  }

  return {
    ok:true,
    status:'repository_intelligence_generated',
    repositoryId,
    intelligence:{
      ...intelligence,
      runtimeZones:Array.from(intelligence.runtimeZones)
    }
  };
}

/* =============================================================================
   07) END OF FILE
============================================================================= */
