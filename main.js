const { spawn } = require('child_process');
const { DefaultArtifactClient } = require('@actions/artifact');
const core = require('@actions/core');

const fs = require('fs');
const os = require('os');

// Function to check the platform the Node.js application is running on
function checkPlatform() {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        // Gets the current platform using the 'os' module
        const platform = os.platform();

        // Checks if the platform is one of the supported platforms: Linux, macOS, or Windows
        if (!['linux', 'darwin', 'win32'].includes(platform)) {
            // If the platform is not supported, logs an error message to the console
            console.error(`Unsupported Platform: ${platform}.`);
            // Rejects the Promise with an error message indicating the unsupported platform
            reject(`Unsupported Platform: ${platform}`);
        } else {
            // If the platform is supported, resolves the Promise
            resolve();
        }
    });
}

// Function to check the version of Python installed on the system
function checkPythonVersion() {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        // Logs a message indicating that Python version is being checked
        console.log('Checking Python version.');

        // Spawns a child process to execute the 'python --version' command
        const pythonProcess = spawn('python', ['--version']);

        let output = '';

        // Event listener for capturing standard output from the Python process
        pythonProcess.stdout.on('data', (data) => {
            // Appends the output from the Python process to the 'output' variable
            output += data.toString();
        });

        // Event listener for capturing standard error from the Python process
        pythonProcess.stderr.on('data', (data) => {
            // Logs an error message to the console
            console.error(`Error occurred: ${data.toString()}`);
            // Rejects the Promise with the error message
            reject(data.toString());
        });

        // Event listener for handling the close event of the Python process
        pythonProcess.on('close', (code) => {
            // Checks if the Python process exited with a non-zero exit code
            if (code !== 0) {
                // Logs an error message indicating failure to check Python version
                console.error(`Failed to check Python version with code ${code}.`);
                // Rejects the Promise with the exit code
                reject(code);
            } else {
                // Logs a success message indicating that Python version was checked successfully
                console.log('Python version checked successfully.');
                // Resolves the Promise with the trimmed output from the Python process
                resolve(output.trim());
            }
        });

        // Event listener for handling errors that occur during spawning of the Python process
        pythonProcess.on('error', (error) => {
            // Logs an error message to the console
            console.error(`Error occurred: ${error.message}.`);
            // Rejects the Promise with the error object
            reject(error);
        });
    });
}

// Function to upgrade pip (Python package manager)
function upgradePip() {
    // Returns a Promise for asynchronous operation
    return new Promise((resolve, reject) => {
        // Executes a function to check Python version asynchronously
        checkPythonVersion().then((output) => {
            // Logs the output of Python version to the console
            console.log('Python version: ', output);
            // Logs a message indicating pip upgrade process initiation
            console.log('Upgrading pip.');

            let pipCommand;

            // Gets the current platform using the 'os' module
            const platform = os.platform();

            // Determines the appropriate pip upgrade command based on platform and Python version
            if (platform === 'darwin' && output.startsWith('Python 3.10')) {
                pipCommand = 'python3.10 -m pip install --upgrade pip';
            } else {
                pipCommand = 'pip install --upgrade pip';
            }

            // Spawns a new process to execute the pip upgrade command
            const pipProcess = spawn('sh', ['-c', pipCommand], { stdio: 'inherit' });

            // Listens for the 'close' event emitted when the pip process terminates
            pipProcess.on('close', (code) => {
                // Checks if the pip process terminated with a non-zero exit code
                if (code !== 0) {
                    // Logs an error message if pip upgrade failed
                    console.error(`Failed to upgrade pip with code ${code}.`);
                    // Rejects the Promise with the exit code
                    reject(code);
                } else {
                    // Resolves the Promise if pip upgrade succeeds
                    resolve();
                }
            });

            // Listens for the 'error' event emitted if an error occurs during pip process execution
            pipProcess.on('error', (error) => {
                // Logs an error message if an error occurs
                console.error(`Error occurred: ${error.message}.`);
                // Rejects the Promise with the error object
                reject(error);
            });
        }).catch((error) => {
            // Logs an error message if there's an error in checking Python version
            console.error(`Error occurred: ${error.message}.`);
            // Rejects the Promise with the error object
            reject(error);
        });
    });
}

// Function to install a tool using pip
function installTool(tool) {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        // Logs a message indicating the tool being installed
        console.log(`Installing ${tool}.`);
        // Spawns a child process to execute the pip install command for the specified tool
        const pipProcess = spawn('pip', ['install', tool], { stdio: 'inherit' });

        // Listens for the 'close' event emitted when the pip process exits
        pipProcess.on('close', (code) => {
            // Checks if the pip process exited with a non-zero exit code
            if (code !== 0) {
                // Logs an error message indicating the failure to install the tool
                console.error(`Failed to install ${tool} with code ${code}.`);
                // Rejects the Promise with the exit code
                reject(code);
            } else {
                // If the pip process exited successfully (with exit code 0), logs a success message
                console.log(`${tool} installed successfully.`);
                // Resolves the Promise
                resolve();
            }
        });

        // Listens for the 'error' event emitted if an error occurs with the pip process
        pipProcess.on('error', (error) => {
            // Logs an error message indicating the error that occurred
            console.error(`Error occurred: ${error.message}.`);
            // Rejects the Promise with the error object
            reject(error);
        });
    });
}

// Function to run linting using different tools
function runLinting(tool, path, artifactName, verbose, color, statistics, arguments) {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        // Logs a message indicating which linting tool is being run
        console.log(`Running ${tool} linting.`);

        let command; // Variable to store the linting command
        let lintProcess; // Variable to store the child process for running the linting command

        // Switch statement to determine the linting command based on the specified tool
        switch (tool) {
            case 'flake8': // For Python (flake8) linting
                command = `flake8 ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color auto';
                if (statistics) command += ' --count --statistics';
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command += ` --format=default --output-file=${artifactName}`;
                break;
            case 'pylint': // For Python (pylint) linting
                command = `pylint ${path}`;
                if (verbose) command += ' -v';
                if (color) command += ' --output-format=colorized';
                if (statistics) command += " --msg-template='{path}:{line}:{column}: {msg_id} {msg} [{symbol}]'";
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command += ` --reports=y --exit-zero > ${artifactName}`;
                break;
            case 'pycodestyle': // For Python (pycodestyle) linting
                command = `pycodestyle ${path}`;
                if (verbose) command += ' --verbose';
                if (statistics) command += " --count --statistics";
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command += ` --format=default > ${artifactName}`;
                break;
            case 'pyflakes': // For Python (pyflakes) linting
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command = `pyflakes ${path} > ${artifactName}`;
                break;
            case 'black': // For Python (black) linting
                command = `black ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color';
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command += ` > ${artifactName}`;
                break;
            case 'mypy': // For Python (mypy) linting
                command = `mypy ${path}`;
                if (verbose) command += ' --verbose';
                if (color) command += ' --color-output';
                if (arguments.trim() !== '') command += ` ${arguments.trim()}`;
                command += ` --show-error-codes --html-report .`;
                break;
            default:
                // If an unsupported tool is specified, log an error and reject the Promise
                console.error(`Unsupported tool: ${tool}`);
                reject(`Unsupported tool: ${tool}`);
                return;
        }

        // Logs the linting command that will be executed
        console.log(command);

        // Spawns a child process to execute the linting command
        lintProcess = spawn('sh', ['-c', command], { stdio: 'inherit' });

        // Event listener for when the linting process is closed
        lintProcess.on('close', (code) => {
            // Checks if the lint process exited with a non-zero exit code
            if (code !== 0) {
                // If the linting process exits with a non-zero code, log an error and reject the Promise
                console.error(`Failed to run ${tool} with code ${code}.`);
                reject(code);
            } else {
                // If the linting process exits successfully (code 0), log success message and resolve the Promise
                console.log(`${tool} linting completed.`);
                resolve();
            }
        });

        // Event listener for errors that occur during the linting process
        lintProcess.on('error', (error) => {
            // Logs the error message and rejects the Promise
            console.error(`Error occurred: ${error.message}.`);
            reject(error);
        });
    });
}

// Function to upload an artifact
function uploadArtifact(artifactName) {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        let content; // Variable to store the content of the artifact

        try {
            // Reads the content of the artifact synchronously
            content = fs.readFileSync(artifactName, 'utf-8');
            // Creates a new instance of the DefaultArtifactClient class
            const artifactClient = new DefaultArtifactClient();
            // Specifies the list of files to upload
            const files = [artifactName];
            // Uploads the artifact using the artifact client
            const { id, size } = artifactClient.uploadArtifact(artifactName, files, '.');
            // If the upload is successful, resolves the Promise
            resolve();
        } catch (error) {
            // If an error occurs during the process, logs an error message to the console
            console.error(`Error occurred: ${error.message}.`);
            // Rejects the Promise with the error object
            reject(error);
        }
    });
}

// Function to rename a file asynchronously
function renameFile(sourceName, targetName) {
    // Returns a Promise, which is an asynchronous operation
    return new Promise((resolve, reject) => {
        // Uses the 'fs' module to rename the file from 'sourceName' to 'targetName'
        fs.rename(sourceName, targetName, (error) => {
            // Checks if an error occurred during the renaming process
            if (error) {
                // If an error occurred, logs an error message to the console
                console.error(`Failed to rename file: ${error}`);
                // Rejects the Promise with the error object
                reject(error);
            } else {
                // If renaming is successful, logs a success message to the console
                console.log(`File renamed successfully from ${sourceName} to ${targetName}`);
                // Resolves the Promise
                resolve();
            }
        });
    });
}

// Asynchronous function that serves as the main entry point for the script
async function main() {
    try {
        // Waits for the platform check to complete before proceeding
        await checkPlatform();

        // Retrieves input values from GitHub Actions workflow
        const tool = core.getInput('tool');
        const path = core.getInput('path');
        const artifactName = core.getInput('artifact-name');
        const verbose = ['true', 'True', 'TRUE'].includes(core.getInput('verbose'));
        const color = ['true', 'True', 'TRUE'].includes(core.getInput('color'));
        const statistics = ['true', 'True', 'TRUE'].includes(core.getInput('statistics'));
        const arguments = core.getInput('arguments');

        // Checks if the specified linting tool is supported
        if (!['flake8', 'pylint', 'pycodestyle', 'pyflakes', 'black', 'mypy'].includes(tool)) {
            // Outputs a warning message if the linting tool is unsupported
            core.warning(`Unsupported Linting Tool: ${tool}`);
            // Exits the process with a success status code
            process.exit(0);
        }

        // Ensures pip is upgraded before installing any Python packages
        await upgradePip();

        // Installs the specified linting tool and its dependencies
        await installTool(tool);
        // Special case for mypy: installs lxml as a dependency
        if (tool == 'mypy') {
            await installTool('lxml');
        }

        // Runs linting using the specified tool and parameters
        await runLinting(tool, path, artifactName, verbose, color, statistics, arguments);
        // Special case for mypy: renames the generated HTML report
        if (tool == 'mypy') {
            await renameFile('index.html', artifactName);
        }

        // Uploads the linting report artifact to GitHub Actions
        await uploadArtifact(artifactName);
    } catch (error) {
        // Handles any errors that occur during the execution of the script
        core.error(error);
        // Exits the process with a failure status code
        process.exit(1);
    }
}

main();