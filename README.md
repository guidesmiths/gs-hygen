# gs-hygen

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 12.0.0 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install -g gs-hygen
```

## Install from git repository

```bash
git clone https://github.com/bounteous/gs-hygen
npm install --quiet
npm pack
npm i -g gs-hygen-1.0.0.tgz
gs-hygen --help
```

## Usage examples

```bash
gs-hygen \
template --url git@github.com:guidesmiths/infinitas-hygen-template-generators.git --generator service-systemic-basics,nvm,commitlint,jest-systemic,jest-systemic-mock-bus --output /tmp/generator-demo-repo \
git --private-key ~/.ssh/id_rsa --public-key ~/.ssh/id_rsa.pub
```

## Creating templates

This project only supports templates for <a href="https://www.npmjs.com/package/hygen">hygen</a>.
<br />
So what we need is to generate a new project with the hygen templates section already generated.

```bash
mkdir new-templates
cd new-templates
git init -b main
mkdir generator _shared
# Visit the hygen docs for generating some basic hygen generator
# http://www.hygen.io/docs/quick-start
git add .
git commit -m "New template generators"
git remote add origin <REMOTE_URL>
git push origin main
```

This templates project <a href="https://github.com/guidesmiths/infinitas-hygen-template-generators">repo</a> is a good starting point
