# Pulumi Installer Task for Azure DevOps pipelines.

This extension is to install the [Pulumi](https://www.pulumi.com/) cli onto an Azure DevOps agent.

This allows you to pick a specific version of the cli to install. By default it will use the latest from https://www.pulumi.com/latest-version

## Using the task

```yaml
- task: UsePulumi@0
  inputs:
    version: 2.12.0 # Optional, defaults to 'latest' if not set
```

This will then download and extract the required version of Pulumi into the `agent.ToolsDirectory` which is cached on self-hosted agents for future runs.

Additionally the [`PULUMI_HOME`](https://www.pulumi.com/docs/reference/cli/environment-variables/#environment-variables) variable is set to work from a temporary directory to ensure existing stacks/credentials are not recycled unintentionally.
