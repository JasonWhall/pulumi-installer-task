"use strict";

import * as tl from 'azure-pipelines-task-lib/task';
import * as tr from 'azure-pipelines-tool-lib/tool';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from  "./utils";

async function run() {
    getPulumiVersion()
        .then(version => getPulumi(version))
        .then(toolPath => verifyPulumiInstall(toolPath))
        .then(() => tl.setResult(tl.TaskResult.Succeeded, "Pulumi Cli Installed. 🔨"))
        .catch(err => {
            tl.error(err.message);
            tl.setResult(tl.TaskResult.Failed, err.message);
        });
}

async function getPulumiVersion(): Promise<string> {
    let version = tl.getInput("version") || "latest";
    tl.debug(`Version requested is ${version}`);

    if (version == "latest") {
        version = await tr.scrape("https://www.pulumi.com/latest-version", new RegExp("^.*$")).then(x => x[0]);
        tl.debug(`Latest Pulumi version is ${version}`);
    }

    return utils.sanitizeVersionString(version);
}

async function getPulumi(version: string): Promise<string> {
    let cachedToolPath = tr.findLocalTool("pulumi", version);
    const platform = utils.getPlatform();
        
    if (!cachedToolPath) {
        const downloadUrl = 
            `https://get.pulumi.com/releases/sdk/pulumi-v${version}-${platform}-x64.${platform == "windows" ? "zip" : "tar.gz"}`;

        tl.debug(`Tool not cached, downloading from: ${downloadUrl}`);
        const downloadPath = await tr.downloadTool(downloadUrl);

        tl.debug("Extracting...");
        const extractPath = platform == "windows" 
            ? await tr.extractZip(downloadPath) 
            : await tr.extractTar(downloadPath);
        
        tl.debug("Adding Pulumi Cli to tools");
        cachedToolPath = await tr.cacheDir(extractPath, "pulumi", version);
    }

    return cachedToolPath;
}

async function verifyPulumiInstall(toolPath: string): Promise<void> {
    tl.debug("Validating Pulumi executable...");
    const pulumiPathGlob = path.join(toolPath, '**' ,`pulumi${utils.getPlatform() == "windows" ? ".exe" : ""}`);
    const searchPaths = tl.find(toolPath);
    const pulumiPaths = tl.match(searchPaths, pulumiPathGlob, toolPath);
    
    // Ensure we're getting the pulumi binary, not the directory back.
    let pulumiPath = pulumiPaths.filter(x => tl.stats(x).isFile())[0];

    if (!pulumiPath) {
        throw new Error("Could not find Pulumi executable from download.")
    }

    fs.chmodSync(pulumiPath, "777");

    if (!process.env['PATH']?.startsWith(path.dirname(pulumiPath))) {
        tr.prependPath(path.dirname(pulumiPath));
    }

    const pulumiHome = utils.getNewTempDirectory();
    tl.debug(`Setting PULUMI_HOME variable: ${pulumiHome}`);
    tl.setVariable("PULUMI_HOME", pulumiHome);

    await tl.tool(pulumiPath)
        .arg("version")
        .exec();
}

run();