"use strict";

import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import * as pulumi from './pulumi';

async function run() {
    tl.setResourcePath(path.join(__dirname, "task.json"));

    pulumi.getPulumiVersion()
        .then(version => pulumi.getPulumi(version))
        .then(toolPath => pulumi.verifyPulumiInstall(toolPath))
        .then(() => tl.setResult(tl.TaskResult.Succeeded, tl.loc("Success")))
        .catch(err => {
            tl.error(err.message);
            tl.setResult(tl.TaskResult.Failed, err.message);
        });
}

run();