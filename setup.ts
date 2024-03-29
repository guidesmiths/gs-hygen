#!/usr/bin/env node

// Libs
import { parseCliArguments } from './src/utils/arguments';
import { clone as gitClone } from './src/utils/git';
import { testOutputFiles } from './src/utils/checks';
import { getTemplatesPath } from './src/utils/storage';
import { getGenerators } from './src/utils/generator';
// Types
import { ArgumentsList } from './src/types/argument';
import { SpinnerList } from './src/types/cli';
// Modules
import del from 'del';
import colors from 'colors';
import execa from 'execa';
import { Spinner } from 'cli-spinner';
import { existsSync, readFileSync } from 'fs-extra';
import { runner as hygen, Logger } from 'hygen';

export async function main(): Promise<void> {
    const argumentsList: ArgumentsList = parseCliArguments();
    const templatesPath: string = getTemplatesPath();
    if (existsSync(templatesPath)) {
        del.sync(templatesPath, { force: true });
    }
    await gitClone({
        url: argumentsList.url,
        destination: templatesPath,
        username: argumentsList.username,
        publicKey: argumentsList.publicKey ? readFileSync(argumentsList.publicKey).toString() : '',
        privateKey: argumentsList.privateKey ? readFileSync(argumentsList.privateKey).toString() : '',
        credentials: argumentsList.credentials,
    });

    const generators: string[] = await getGenerators(argumentsList, templatesPath);
    console.log(colors.bold(`\nFound ${generators.length} hygen generators`));

    let count = 1;
    for (const generator of generators) {
        console.log(colors.cyan(`\n(${count}/${generators.length}) >`), colors.bgCyan(`${generator}`));
        await hygen(['generator', generator], {
            templates: templatesPath,
            cwd: argumentsList.output,
            logger: new Logger(() => ''),
            createPrompter: () => require('inquirer'),
            exec: async (action, body) => {
                const opts = body?.length > 0 ? { input: body } : {};
                const spinner = new Spinner(action).setSpinnerString(SpinnerList.HARD).start();
                await execa.command(action, { ...opts, shell: true, cwd: argumentsList.output });
                spinner.stop(!!'clear');
            },
            debug: !!process.env.DEBUG,
        });
        count++;
    }

    if (!existsSync(argumentsList.output)) {
        console.error('This generator did no generated any output files');
        process.exit(1);
    }

    testOutputFiles(generators, argumentsList.output);
}

if (!process.env.AVOID_AUTOSTART) {
    main();
}
