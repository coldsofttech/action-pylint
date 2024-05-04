const { spawn } = require('child_process');
const { DefaultArtifactClient } = require('@actions/artifact');
const core = require('@actions/core');

const fs = require('fs');
const os = require('os');

function checkPlatform() {
    return new Promise((resolve, reject) => {
        const platform = os.platform();

        if (!['linux', 'darwin', 'win32'].includes(platform)) {
            console.error(`Unsupported Platform: ${platform}.`);
            reject(`Unsupported Platform: ${platform}`);
        } else {
            resolve();
        }
    });
}

function checkPythonVersion() {
    return new Promise((resolve, reject) => {
        console.log('Checking Python version.');
        const pythonProcess = spawn('python', ['--version']);

        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error occurred: ${data.toString()}`);
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Failed to check Python version with code ${code}.`);
                reject(code);
            } else {
                console.log('Python version checked successfully.');
                resolve(output.trim());
            }
        });

        pythonProcess.on('error', (error) => {
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        });
    });
}

function upgradePip() {
    return new Promise((resolve, reject) => {
        checkPythonVersion().then((output) => {
            console.log('Python version: ', output);
            console.log('Upgrading pip.');
            let pipCommand;

            const platform = os.platform();
            console.log(platform);
            console.log(output.startsWith('3.10'));

            if (platform === 'darwin' && output.startsWith('3.10')) {
                console.log('darwin-3.10');
                pipCommand = 'python3.10 -m pip install --upgrade pip';
            } else {
                pipCommand = 'pip install --upgrade pip';
            }

            const pipProcess = spawn('sh', ['-c', pipCommand], { stdio: 'inherit' });

            pipProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Failed to upgrade pip with code ${code}.`);
                    reject(code);
                } else {
                    resolve();
                }
            });

            pipProcess.on('error', (error) => {
                console.error(`Error occurred: ${error.message}.`);
                reject(error);
            });
        }).catch((error) => {
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        });
    });
}

function installTool(tool) {
    return new Promise((resolve, reject) => {
        console.log(`Installing ${tool}.`);
        const pipProcess = spawn('pip', ['install', tool], { stdio: 'inherit' });

        pipProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Failed to install ${tool} with code ${code}.`);
                reject(code);
            } else {
                console.log(`${tool} installed successfully.`);
                resolve();
            }
        });

        pipProcess.on('error', (error) => {
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        });
    });
}

function runLinting(tool, path, artifactName, verbose, color, statistics) {
    return new Promise((resolve, reject) => {
        console.log(`Running ${tool} linting.`);
        let command;
        let lintProcess;

        switch (tool) {
            case 'flake8':
                command = `flake8 ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color auto';
                if (statistics) command += ' --count --statistics';
                command += ` --format=default --output-file=${artifactName}`;
                break;
            case 'pylint':
                command = `pylint ${path}`;
                if (verbose) command += ' -v';
                if (color) command += ' --output-format=colorized';
                if (statistics) command += " --msg-template='{path}:{line}:{column}: {msg_id} {msg} [{symbol}]'";
                command += ` --reports=y --exit-zero > ${artifactName}`;
                break;
            case 'pycodestyle':
                command = `pycodestyle ${path}`;
                if (verbose) command += ' --verbose';
                if (statistics) command += " --count --statistics";
                command += ` --format=default > ${artifactName}`;
                break;
            case 'pyflakes':
                command = `pyflakes ${path} > ${artifactName}`;
                break;
            case 'black':
                command = `black ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color';
                command += ` > ${artifactName}`;
                break;
            case 'mypy':
                command = `mypy ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color-output';
                command += ` --show-error-codes --html-report .`;
                break;
            default:
                console.error(`Unsupported tool: ${tool}`);
                reject(`Unsupported tool: ${tool}`);
                return;
        }

        lintProcess = spawn('sh', ['-c', command], { stdio: 'inherit' });

        lintProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Failed to run ${tool} with code ${code}.`);
                reject(code);
            } else {
                console.log(`${tool} linting completed.`);
                resolve();
            }
        });

        lintProcess.on('error', (error) => {
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        });
    });
}

function uploadArtifact(artifactName) {
    return new Promise((resolve, reject) => {
        let content;

        try {
            content = fs.readFileSync(artifactName, 'utf-8');
            const artifactClient = new DefaultArtifactClient();
            const files = [artifactName];
            const { id, size } = artifactClient.uploadArtifact(artifactName, files, '.');
            resolve();
        } catch (error) {
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        }
    });
}

function renameFile(sourceName, targetName) {
    return new Promise((resolve, reject) => {
        fs.rename(sourceName, targetName, (error) => {
            if (error) {
                console.error(`Failed to rename file: ${error}`);
                reject(error);
            } else {
                console.log(`File renamed successfully from ${sourceName} to ${targetName}`);
                resolve();
            }
        });
    });
}

async function main() {
    try {
        await checkPlatform();

        const tool = core.getInput('tool') || 'flake8';
        const path = core.getInput('path') || '.';
        const artifactName = core.getInput('artifact-name') || 'lint-report';
        const verbose = core.getInput('verbose') || true;
        const color = core.getInput('color') || true;
        const statistics = core.getInput('statistics') || true;

        console.log(`Linting Tool: ${tool}`);
        console.log(`Path: ${path}`);
        console.log(`Artifact Name: ${artifactName}`);
        console.log(`Verbose: ${verbose}`);
        console.log(`Color: ${color}`);
        console.log(`Statistics: ${statistics}`);

        await upgradePip();

        if (['flake8', 'pylint', 'pycodestyle', 'pyflakes', 'black', 'mypy'].includes(tool)) {
            await installTool(tool);
            if (tool == 'mypy') {
                await installTool('lxml');
            }

            await runLinting(tool, path, artifactName, verbose, color, statistics);
            if (tool == 'mypy') {
                await renameFile('index.html', artifactName);
            }

            await uploadArtifact(artifactName);
        } else {
            core.warning(`Unsupported Linting Tool: ${tool}`);
        }
    } catch (error) {
        core.error(error);
        process.exit(1);
    }
}

main();