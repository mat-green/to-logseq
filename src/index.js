#!/usr/bin/env node

'use strict';

const fs = require('fs/promises');
const path = require('path');

const program = require('commander');
const pkg = require('../package.json');


async function walkDirectory(input) {
  let result = [];
  try {
    const files = await fs.readdir(input);
    for (const file of files) {
      const location = path.join(input, file);
      const stat = await fs.stat(location)
      if (stat.isFile()) {
        result.push(location);
      } else if (stat.isDirectory()) {
        const sub = await walkDirectory(location);
        result = result.concat(sub);
      }
    }
  }
  catch (error) {
    console.error("Could not list the directory.", error);
    return [];
  }
  return result;
}


program.version(pkg.version);

program
  .command('journals <input> <output>')
  .description('Print specific company data to console')
  .action(function (input, output) {
    (async () => {
      const CREATED = 'Created:';
      const files = await walkDirectory(input);
      const target = path.join(output, "journals")
      try {
        await fs.stat(target)
      } catch (error) {
        await fs.mkdir(target, { recursive: true })
      }

      for (const file of files) {
        const data = await fs.readFile(file);
        const start = data.indexOf(CREATED);
        if(start >= 0){
          const from = start + CREATED.length + 1;
          const end = data.indexOf('\n', from);
          const slice = data.subarray(from, end);
          
          const date = new Date(Date.parse(slice));
          const year = date.getFullYear();
          const month = String((date.getMonth() + 1)).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');

          const journal_name = year + "_" + month + "_" + day;
          const location = path.join(target, journal_name + ".md");

          try {
            
            const image_folder = file.substring(0, file.length-3);
            const assets_folder = path.join(output, "assets", journal_name);
            try {
              await fs.stat(image_folder);
              await fs.mkdir(assets_folder, { recursive: true })
              const images = await fs.readdir(image_folder);
              for (const image of images) {
                const image_output = path.join(assets_folder, image);
                const image_input = path.join(image_folder, image);
                const image_data = await fs.readFile(image_input)
                await fs.writeFile(image_output, image_data)
              }
            }
            catch(error) {
              console.warn("WARN: Unable to find", image_folder);
            }

            const page_assets_folder = encodeURI(path.join("..", "assets", journal_name));
            const page_image_folder = encodeURI(image_folder.substring(image_folder.lastIndexOf('/')+1));
            console.debug("replace", page_image_folder, "with", page_assets_folder)
            const adjusted_data = data.toString().replaceAll(page_image_folder, page_assets_folder);
            // console.debug(adjusted_data)
            await fs.writeFile(location, adjusted_data, { flag: 'a' });
          }
          catch (error) {
            // append file
            console.error("ERROR:", error);
          }
         }
      }
    })();
  });

  program.parse(process.argv);