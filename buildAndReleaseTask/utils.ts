"use strict";

import * as tl from "azure-pipelines-task-lib/task";
import * as tr from 'azure-pipelines-tool-lib/tool';
import * as path from 'path';
import * as os from "os";

export function getTempDirectory(): string {
    return tl.getVariable('agent.tempDirectory') || os.tmpdir();
}

export function getNewTempDirectory(): string {
    return path.join(getTempDirectory(), getCurrentTime().toString());
}

export function getCurrentTime(): number {
    return new Date().getTime();
}

export function getPlatform(): string {
    let platform = "";
    switch (os.platform()) {
        case "linux": platform = "linux"; break;
        case "darwin": platform = "darwin"; break;
        case "win32": platform = "windows"; break;
        default: throw new Error(tl.loc("Unsupported_OS"));
    }
    tl.debug(`Platform is ${platform}`);
    return platform;
}

export function sanitizeVersionString(inputVersion: string): string {
    const version = tr.cleanVersion(inputVersion);
    if (!version) {
        throw new Error(tl.loc("Invalid_Version"));
    }
    return version;
}
