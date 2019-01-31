EdgeEngine CLI
==========

EdgeEngine is StackPaths serverless platform. It allows you to add custom logic to your applications or even build entire applications on the edge. With a simple deploy your scripts are deployed to StackPaths vast network containing over 45 POP's. This CLI makes deploying as easy as running a single command. No matter the amount of scripts you have.

[![Version](https://img.shields.io/npm/v/@stackpath/edgeengine-cli.svg)](https://www.npmjs.com/package/@stackpath/edgeengine-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@stackpath/edgeengine-cli.svg)](https://www.npmjs.com/package/@stackpath/edgeengine-cli)
[![License](https://img.shields.io/npm/l/@stackpath/edgeengine-cli.svg)](https://github.com/stackpath/edgeengine-cli/blob/master/LICENSE)

# Introduction
This CLI makes deploying to EdgeEngine as easy as running a single command. It's easy to use, but allows for a variety of use-cases. You can run the CLI locally to make deploying a whole lot quicker, run it in a CI/CD pipeline to automate the deployments or implement it in any way you can think of.


**How to get started?**
1. [Install the CLI](#installing-the-cli)
2. [Save your credentials](#setting-authentication-details)
3. [Set-up the configuration file](#configure-project)
4. [Deploy.](#deploying-with-the-cli)

## Installing the CLI
Depending on your platform and your own preferences there are a couple of ways to get the CLI. The preferred way is probably to install it through NPM.

#### Installing through NPM

`npm install -g edgeengine-cli` to install globally

#### Downloading the installer
* For MacOS (.pkg) -> [Download](https://storage.googleapis.com/cli-dl/edgeengine-v1.0.0.pkg)
* For Windows (.exe) -> Download
* For Ubuntu (.deb) -> Download

## Setting authentication details
The CLI saves your authentication data in a file in your home directory (`~/.stackpath/credentials`). Once you have set this up, the CLI will continue to read the credentials from the file, meaning that you don't have to provide your credentials over and over again.

In order to authenticate yourself, you need a client ID and a client secret. You can find them in [the StackPath client portal](https://control.stackpath.com/api-management).

#### Authenticating in an interactive environment (e.g. on your local machine)
> 👉 To authenticate in an interactive environment you can simply run `edgeengine auth`. The CLI will prompt you with for required details. 


#### Authenticating in a **non**-interactive environment (e.g. in a CI/CD pipeline)
Are you integrating the CLI with a non-interactive environment? Then provide the client ID and the client secret as flags of the command. For example:

`edgeengine auth --client_id example-client-id --client_secret example-client-secret --force`

Use the `--force` (or `-f`) flag so that the credentials file is always overwritten, even if it already exists.

## Configure project
The EdgeEngine CLI works with a per-project (or per-directory) based configuration. Each project should have its own configuration file
defining the scripts that apply to that project. You might use it to order scripts by website, category (such as firewalls) or otherwise.

Start by including a `edgeengine.json`-file in your project directory. The required contents can be found below 👇.

#### edgeengine.json configuration file
When deploying (`edgeengine deploy`), the CLI tries to find the `edgeengine.json` configuration file in the directory you're running the command from. Through this file you can configure which scripts you'd like to deploy to which site.

Here's an example:

```json
{
    "stack_id": "2dad0e92-61f1-4fb2-bbc0-0c26466e91bf",
    "site_id": "1cb3a9ba-06a4-4528-96a4-c4e04598c856",
    "scripts": [
        {
            "name": "Admin IP firewall",
            "paths": [
                "admin/*"
            ],
            "file": "edgeengine_scripts/ip-firewall.js",
            "id": "dcdf7824-b6bd-42b8-9b16-9235eefd583d" // The ID is generated on first deploy, or - optionally - you can configure it yourself.
        },
        {
          "name": "Script to show a deploy to a different site",
          "paths": [
            "demo/*"
          ],
          "file": "edgeengine_scripts/demo.js",
          "site_id": "15ece821-9eed-4590-9577-b83beda947f7"
        }
    ]
}
```

> Note that you can define the `site_id` either in a global scope or in a per-script scope. This allows you to deploy
to different sites from a single configuration file.

#### Overview of all configuration parameters

| Key        | Description     | 
| ------------- | ------ |
| `stack_id` | The ID of the stack where your site is in. |
| `site_id` | The ID of the site you'd like to apply the scripts to. |
| `scripts[name]` | The name of the script. Should be descriptive. Should be unique to each site. |
| `scripts[paths][]` | The paths the script should apply to. Relative to your site. **Without starting `/`**. If you'd like to apply the script to `http://site.com/admin/*` you'd use the `admin/*` path. |
| `scripts[file]` | The file where the required JS is in. Define the path relative to the EdgeEngine configuration JSON. Without a starting `/`. |
| `scripts[id]` | The ID of the script in the EdgeEngine. Will be created after first deploy. Should be checked into version control after being created. |

#### Where to find the stack and site ID?
You can find the stack and site ID in the URL when you're logged into the StackPath client portal and have selected the CDN site you'd like to deploy scripts to. See the illustration below for more information on which IDs to copy.

![How to find the ID's in the URL](https://freave.cdn.freavehd.net/com/cli-dl/ids.png)

## Deploying with the CLI
When talking about deploying in the context of the EdgeEngine we mean getting local code onto the StackPath Edge. You might also call it
"updating" or "pushing" code.

> 👉 Deploying is as easy as running `edgeengine deploy` from your project directory (given it has the `edgeengine.json`-file).

#### Deploying from a non-interactive environment
During the deployment the CLI might prompt you in certain situations. For example when your `edgeengine.json` holds an ID that can not be found in the EdgeEngine. The CLI will then prompt you if you'd like to re-create the script. In non-interactive environments you can use the `--force` or `-f` flag to always try to re-create the script.

# Usage
<!-- usage -->
```sh-session
$ npm install -g @stackpath/edgeengine-cli
$ edgeengine COMMAND
running command...
$ edgeengine (-v|--version|version)
@stackpath/edgeengine-cli/1.0.1 darwin-x64 node-v10.15.0
$ edgeengine --help [COMMAND]
USAGE
  $ edgeengine COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`edgeengine auth`](#edgeengine-auth)
* [`edgeengine deploy`](#edgeengine-deploy)
* [`edgeengine help [COMMAND]`](#edgeengine-help-command)

## `edgeengine auth`

Configures StackPath's authentication details.

```
USAGE
  $ edgeengine auth

OPTIONS
  -c, --client_id=client_id          StackPath Client ID used to authenticate with
  -f, --force                        Set this to always overwrite current credential file, defaults to false.
  -h, --help                         show CLI help
  -s, --client_secret=client_secret  StackPath Client Secret used to authenticate with
  -v, --verbose                      Turns on verbose logging. Defaults to false

EXAMPLE
  $ edgeengine auth
```

_See code: [src/commands/auth.ts](https://github.com/stackpath/edgeengine-cli/blob/v1.0.1/src/commands/auth.ts)_

## `edgeengine deploy`

Deploys the scripts in the working directory according to its edgeengine.json configuration file.

```
USAGE
  $ edgeengine deploy

OPTIONS
  -f, --force    Force recreation of scripts if they do not exist. Defaults to false
  -h, --help     show CLI help
  -v, --verbose  Turns on verbose logging. Defaults to false

EXAMPLE
  $ edgeengine deploy
```

_See code: [src/commands/deploy.ts](https://github.com/stackpath/edgeengine-cli/blob/v1.0.1/src/commands/deploy.ts)_

## `edgeengine help [COMMAND]`

display help for edgeengine

```
USAGE
  $ edgeengine help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_
<!-- commandsstop -->
