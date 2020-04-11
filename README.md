# Serverless Scripting CLI

StackPath's [serverless scripting platform](https://www.stackpath.com/products/serverless-scripting/)
allows you to add custom logic to your applications or even build entire
applications on the edge. A single deployment distributes your scripts across
StackPath's vast network containing over 45 POPs.

This CLI makes deploying as easy as running a single command, no matter the
number of scripts you have. It's easy to use, but allows for a variety of use
cases. Run the CLI locally to make for fast deployments, run it in a CI/CD
pipeline to automate deployments, or implement it in any other way you can think
of.

[![Version](https://img.shields.io/npm/v/@stackpath/serverless-scripting-cli.svg)](https://www.npmjs.com/package/@stackpath/serverless-scripting-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@stackpath/serverless-scripting-cli.svg)](https://www.npmjs.com/package/@stackpath/serverless-scripting-cli)
[![License](https://img.shields.io/npm/l/@stackpath/serverless-scripting-cli.svg?style=flat)](https://github.com/stackpath/serverless-scripting-cli/blob/master/LICENSE.md)
[![Build Status](https://travis-ci.org/stackpath/serverless-scripting-cli.svg)](https://travis-ci.org/stackpath/serverless-scripting-cli)

## Installation

Run any of the following commands to install the CLI depending on your platform
and preferences:

### Using NPM

Run `npm install -g @stackpath/serverless-scripting-cli` to install `sp-serverless`
as a global package.

### Using Yarn

Run `yarn global add @stackpath/serverless-scripting-cli` to install `sp-serverless`
as a global package.

### Using Homebrew or Linuxbrew

StackPath maintains a [Homebrew tap](https://github.com/stackpath/homebrew-stackpath)
for users to access utilities through the popular [Homebrew](https://brew.sh/)
and [Linuxbrew](https://docs.brew.sh/Linuxbrew) package managers for macOS and
Linux.

Run `brew tap stackpath/stackpath` to install the tap, then run `brew install sp-serverless`
to install the `sp-serverless` utility.

## Configuration

Perform the following to configure the CLI utility after it's installed:

### Setting authentication details

The CLI saves your authentication data in a file in your home directory
(`~/.stackpath/credentials`). Once this is set up, the CLI will continue
to read the credentials from the file, meaning you don't have to provide
your credentials over and over again.

You need a StackPath API client ID and client secret in order to authenticate.
You can find them in [the StackPath customer portal](https://control.stackpath.com/api-management).

#### Authenticating in an interactive environment (e.g. on your local machine)

Run `sp-serverless auth` to authenticate in an interactive environment. The CLI
will prompt you for required details.

#### Authenticating in a non-interactive environment (e.g. in a CI/CD pipeline)

Are you integrating the CLI with a non-interactive environment? Then provide the
client ID and the client secret as flags of the command. For example:

```bash
sp-serverless auth --client_id example-client-id --client_secret example-client-secret --force
```

Use the `--force` (or `-f`) flag so that the credentials file is always
overwritten, even if it already exists.

### Configuring a project

The serverless scripting CLI works with a per-project (or per-directory) based
configuration. Each project should have its own configuration file defining the
scripts that apply to that project. You might use it to order scripts by site,
category (such as firewalls), or otherwise.

Start by creating a `sp-serverless.json` file in your project's directory.

#### The configuration file

When deploying via `sp-serverless deploy`, the CLI looks for the `sp-serverless.json`
configuration file in the directory you're running the command from. Through
this file you can configure which scripts you'd like to deploy to which site.
For example:

```
{
  "stack_id": "2dad0e92-61f1-4fb2-bbc0-0c26466e91bf",
  "site_id": "1cb3a9ba-06a4-4528-96a4-c4e04598c856",
  "scripts": [
    {
      "name": "Admin IP firewall",
      "paths": [
        "admin/*"
      ],
      "file": "serverless_scripts/ip-firewall.js",
      // The ID is generated on first deploy, or optionally you can configure it yourself.
      "id": "dcdf7824-b6bd-42b8-9b16-9235eefd583d"
    },
    {
      "name": "Script to show a deploy to a different site",
      "paths": [
        "demo/*"
      ],
      "file": "serverless_scripts/demo.js",
      "site_id": "15ece821-9eed-4590-9577-b83beda947f7"
    },
    {
      "name": "Script to show a deploy to a different site and stack",
      "paths": [
        "demo/*"
      ],
      "file": "serverless_scripts/demo.js",
      "site_id": "15ece821-9eed-4590-9577-b83beda947f7",
      "stack_id": "7be2de57-d6d9-4c27-8361-aef01e1870f0"
    }
  ]
}
```

Note that you can define the `site_id` either in a global scope or in a
per-script scope. This allows you to deploy to different sites from a single
configuration file.

The configuration file contains the following parameters:

- **`stack_id`**: The ID or slug of the stack where your site is in
- **`site_id`**: The ID of the site to apply the scripts to
- **`scripts[name]`**: The name of the script. This should be descriptive and unique to each site
- **`scripts[paths][]`**: The HTTP request paths the script should apply to, relative to the site root and without an initial `/`. For example, use the path `admin/*` to apply the script to requests to `https://example.org/admin/*`
- **`scripts[file]`**: The local path to the JavaScript file to use as the serverless script, relative to `sp-serverless.json`'s path and without an initial `/`.
- **`scripts[id]`**: The ID of the script in the serverless scripting platform. This is created after your first deployment. It should be checked into version control after being created

#### Finding the stack slug and site ID

Find the stack slug and site ID in the URL when you're logged into the StackPath
customer portal and have selected the CDN site you'd like to deploy scripts to.

## Deploying serverless scripts

Run `sp-serverless deploy` from your project directory. To push your configured
scripts to the StackPath edge.

### Deploying from a non-interactive environment

The CLI may prompt you in certain situations when deploying scripts. For
example, if your `sp-serverless.json` file contains an ID that cannot be found
in the platform, the CLI will then prompt you if you'd like to re-create the
script. Use the `--force` or `-f` flag to always try to re-create the script.

## Usage

### `sp-serverless auth`

```
Configures StackPath's authentication details.

USAGE
  $ sp-serverless auth

OPTIONS
  -c, --client_id=client_id          StackPath Client ID used to authenticate with
  -f, --force                        Set this to always overwrite current credential file, defaults to false.
  -h, --help                         show CLI help
  -s, --client_secret=client_secret  StackPath Client Secret used to authenticate with
  -v, --verbose                      Turns on verbose logging. Defaults to false

EXAMPLE
  $ sp-serverless auth
```

### `sp-serverless deploy`

```
Deploys the scripts in the working directory according to its sp-serverless.json configuration file.

USAGE
  $ sp-serverless deploy

OPTIONS
  -f, --force    Force recreation of scripts if they do not exist. Defaults to false
  -h, --help     show CLI help
  -v, --verbose  Turns on verbose logging. Defaults to false

EXAMPLE
  $ sp-serverless deploy
```

### `sp-serverless help`

```
Deploy to StackPath's serverless scripting platform from your local machine.

VERSION
  @stackpath/serverless-scripting-cli/2.0.1 darwin-x64 node-v13.12.0

USAGE
  $ sp-serverless [COMMAND]

COMMANDS
  auth    Configures StackPath's authentication details.
  deploy  Deploys the scripts in the working directory according to its sp-serverless.json configuration file.
  help    display help for sp-serverless
```

# Development

The CLI doesn't have any build commands. Make code changes and run `yaen test` to
run the test suite or `bin/run` to test changes directly.

We welcome contributions and pull requests. See our
[contributing guide](https://github.com/stackpath/serverless-scripting-cli/blob/master/.github/contributing.md)
for more information.
