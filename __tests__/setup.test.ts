// Resources
process.env.AVOID_AUTOSTART = 'true';
// Modules
import path from 'path';
import { tmpdir } from 'os';
import { isArray } from 'lodash';
import { removeSync, mkdirSync, copySync, pathExistsSync, readFileSync } from 'fs-extra';
import { prompt, PromptModule } from 'inquirer';
jest.mock('inquirer');
// Libs
jest.mock('../src/utils/git');
import { clone as gitClone } from '../src/utils/git';
import { main } from '../setup';
// Dev types
import { TestConstants } from './@types/setup.type';
// Triggers
const mockedGitClone = gitClone as jest.Mock<Promise<void>>;
const mockedInquirerPrompt = prompt as unknown as jest.Mock<PromptModule>;

describe('Testing generated ouput files', () => {
    const outputPath: string = path.join(tmpdir(), 'gs-hygen/.__tests__/output');
    const projectTemplateFolder: string = path.join(tmpdir(), 'gs-hygen/templates/');
    const removeTemplatesFolder = () => removeSync(projectTemplateFolder);
    const constants: TestConstants = {
        promptCounter: 0,
        originalArgv: process.argv,
    };

    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        console.log = () => {};
    });

    beforeEach(() => {
        removeSync(outputPath);
        mkdirSync(outputPath, { recursive: true });
        process.argv = constants.originalArgv.map((value: string) => value);
        constants.promptCounter = 0;
        removeTemplatesFolder();
    });

    afterEach(() => {
        removeTemplatesFolder();
        jest.clearAllMocks();
    });

    afterAll(() => {
        removeSync(path.join(tmpdir(), 'gs-hygen'));
    });

    describe('should fail', () => {
        it('should fail if the output arguments is not an absolute path', async () => {
            let error: Error = new Error();
            process.argv.push(
                'template',
                '--url',
                'git@github.com:guidesmiths/gs-hygen-templates.git',
                '--generator',
                'docker-node-lts,nvm',
                '--output',
                'not/an/absolute/path',
            );
            try {
                await main();
            } catch (_error) {
                error = _error;
            }
            expect(error.message).toBe('The provided value "not/an/absolute/path" is not an absolute path');
        });
    });

    describe('should not fail', () => {
        beforeAll(() => {
            mockedGitClone.mockImplementation(async () => {
                copySync('./__tests__/templates/template_one', projectTemplateFolder);
            });
        });

        const templatesExpects = {
            dockerNodeLts: (outputPath: string) => {
                expect(pathExistsSync(`${outputPath}/.dockerignore`)).toBeTruthy();
                expect(pathExistsSync(`${outputPath}/Dockerfile`)).toBeTruthy();
            },
        };

        describe('should generate "docker-node-lts,nvm" templates', () => {
            it('from CLI argv', async () => {
                mockedInquirerPrompt.mockImplementation((params): PromptModule => {
                    const { name } = isArray(params) ? params[0] : params;
                    if (name === 'npm_package_version') {
                        return { npm_package_version: 16 } as never;
                    }
                });
                process.argv.push(
                    'template',
                    '--url',
                    'git@github.com:guidesmiths/gs-hygen-templates.git',
                    '--generator',
                    'docker-node-lts,nvm',
                    '--output',
                    outputPath,
                );
                await main();
                templatesExpects.dockerNodeLts(outputPath);
                expect(readFileSync(`${outputPath}/.nvmrc`, 'utf-8')).toBe('16\n');
            });

            it('from checkbox prompt', async () => {
                mockedInquirerPrompt.mockImplementation((params): PromptModule => {
                    const { name } = isArray(params) ? params[0] : params;
                    if (name === 'npm_package_version') {
                        return { npm_package_version: 12 } as never;
                    } else if (name === 'generatorsNames') {
                        return { generatorsNames: ['nvm', 'docker-node-lts'] } as never;
                    }
                });
                process.argv.push(
                    'template',
                    '--url',
                    'git@github.com:guidesmiths/gs-hygen-templates.git',
                    '--output',
                    outputPath,
                );
                await main();
                templatesExpects.dockerNodeLts(outputPath);
                expect(readFileSync(`${outputPath}/.nvmrc`, 'utf-8')).toBe('12\n');
            });
        });
    });
});
