# Pulumi Installer Task for Azure DevOps Pipelines

This task is for installing the [Pulumi](https://www.pulumi.com/) cli on Azure DevOps Agents.

## Local Development

### Prerequisites
There are a few tools that need to be installed prior to local development

- Node.js
- Npm
- tslint
- typescript
- tfx-cli (for publishing)

### Setup

- run `npm install` in the `buildAndReleaseTask` folder.
- set 2 variables required to run the task
  - `agent.ToolsDirectory` - Location to store the pulumi cli
  - `agent.TempDirectory` - Location for temporary download/extract files for the task.
- run `npm build` and `npm start` from the `buildAndReleaseTask` to compile the typescript and start the task.

Alternatively there is a `launch.json` in the `.vscode` folder which can be used to start F5 debugging for vs code. This contains a default folder path for the tools and temporary directories.

### Publishing Task

Make sure you have built and compiled from the previous step.
- From the root folder, run `npm run package` to build, increment version and create the `vsix` file.
- Run `tfx login` to authenticate using a PAT token. This requires `Publish Marketplace Images` permissions.
- run `tfx extension publish --vsix $PATH_TO_VSIX` to publish to the marketplace.
