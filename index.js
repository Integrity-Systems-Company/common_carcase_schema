const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const fs = require('fs');
const generator = require("./docs/lib/JSONSchemaMarkdown");

try {
  runMDGeneration();
} catch (error) {
  core.setFailed(error.message);
}

async function runMDGeneration(){
  // Creates to globber to search through the repository for the JSON files
  const patterns = ['**/*.json', '!**/node_modules/**/*.json', '!**/package*.json', '!**/schema.json', '!**/jsdoc_config.json', '!**/.vs/**/*.json'];
  const globber = await glob.create(patterns.join('\n'));

  var fileList = [];
  var contents = "test";

  var Doc = new generator.JSONSchemaMarkdown();

  // hopefully if this works right should iterate of the list of all the JSON files in the repository
  for await (const file of globber.globGenerator()){
    fileList.push(file);
    
    try{
      contents = fs.readFileSync(file); 
    } catch (error) {
      core.setFailed(error.message);
    }

    Doc.load(contents.toString());
    Doc.generate();
    var markdown = Doc.markdown;

    var mdFile = file.toString().replace(".json", ".md");

    fileList.push(mdFile);

    fs.writeFileSync(mdFile, markdown);
  }

  core.setOutput("files", fileList.join('\n'));

  try{
    core.setOutput("content", markdown.toString());
  } catch (error) {
    core.setFailed(error.message);
  }
}
