import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/src',{recursive:true});
for(const file of ['index.html','src/app.mjs','src/engine.mjs','src/style.css'])await copyFile(file,`dist/${file}`);
