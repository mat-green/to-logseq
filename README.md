# To Logseq

Welcome!

This is a simple tool that can help convert Notion files in journal entries. If the export file contains a `Created:` then the data can be used to create the date of the journal file. Same date file will be appended. Images will be moved to assets and the url changed in the files.

## Setup

```
npm install
npm link
```

## Execution

```
to-logseq journals ${INPUT_DIR} ${OUTPUT_DIR}
```

Your chosen output directory will be created if missing.
