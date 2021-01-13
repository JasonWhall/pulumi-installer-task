"use strict";

import * as tr from 'azure-pipelines-tool-lib/tool';
import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from  "./utils";

export async function getPulumiVersion(): Promise<string> {
    let version = tl.getInput("version") || "latest";
    tl.debug(tl.loc("Debug_VersionRequested", version));

    if (version == "latest") {
        version = await tr.scrape("https://www.pulumi.com/latest-version", new RegExp("^.*$")).then(x => x[0]);
        tl.debug(tl.loc("Debug_LatestVersion", version));
    }

    return utils.sanitizeVersionString(version);
}

export async function getPulumi(version: string): Promise<string> {
    let cachedToolPath = tr.findLocalTool("pulumi-cli", version);
    const platform = utils.getPlatform();
        
    if (!cachedToolPath) {
        const downloadUrl = 
            `https://get.pulumi.com/releases/sdk/pulumi-v${version}-${platform}-x64.${platform == "windows" ? "zip" : "tar.gz"}`;

        tl.debug(tl.loc("Debug_ToolDownload", downloadUrl));
        const downloadPath = await tr.downloadTool(downloadUrl);

        tl.debug(tl.loc("Debug_Extracting"));
        const extractPath = platform == "windows" 
            ? await tr.extractZip(downloadPath) 
            : await tr.extractTar(downloadPath);
        
        tl.debug(tl.loc("Debug_Caching"));
        cachedToolPath = await tr.cacheDir(extractPath, "pulumi-cli", version);

        tl.setVariable("INSTALLED_PULUMI_VERSION", version);
    }

    return cachedToolPath;
}

export async function verifyPulumiInstall(toolPath: string): Promise<void> {
    tl.debug(tl.loc("Debug_Validating"));
    const pulumiPathGlob = path.join(toolPath, '**' ,`pulumi${utils.getPlatform() == "windows" ? ".exe" : ""}`);
    const searchPaths = tl.find(toolPath);
    const pulumiPaths = tl.match(searchPaths, pulumiPathGlob, toolPath);
    
    // Ensure we're getting the pulumi binary, not the directory back.
    const pulumiPath = pulumiPaths.filter(x => tl.stats(x).isFile())[0];

    if (!pulumiPath) {
        throw new Error("Could not find Pulumi executable from download.")
    }

    fs.chmodSync(pulumiPath, "777");

    tl.debug(tl.loc("Debug_SetPath"));
    if (!process.env['PATH']?.startsWith(path.dirname(pulumiPath))) {
        tr.prependPath(path.dirname(pulumiPath));
    }

    const pulumiHome = utils.getNewTempDirectory();
    tl.debug(tl.loc("Debug_SetHome", pulumiHome));
    tl.setVariable("PULUMI_HOME", pulumiHome);

    await tl.tool(pulumiPath)
        .arg("version")
        .exec();
}