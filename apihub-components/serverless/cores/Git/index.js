const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const fs = require("fs");
const path = require("path");
const https = require('https');
const { URL } = require('url');

function GitCore() {

    this.allow = async function (forWhom, methodName, ...args) {
        return true;
    }

    this.checkGitHubRepoVisibility = async function (repoUrl) {
        try {
            const url = new URL(repoUrl);
            let repoPath = url.pathname.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes

            if(repoPath.includes('.git')){
                repoPath = repoPath.replace('.git', '');
            }

            const options = {
                hostname: 'api.github.com',
                path: `/repos/${repoPath}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'NodeJS',
                },
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            const repoData = JSON.parse(data);
                            resolve(repoData.private ? 'Private' : 'Public');
                        } else if (res.statusCode === 404) {
                            reject(new Error('Repository not found or private'));
                        } else {
                            reject(new Error(`GitHub API responded with status code ${res.statusCode}`));
                        }
                    });
                });

                req.on('error', (err) => {
                    reject(err);
                });

                req.end();
            });
        } catch (error) {
            throw error;
        }
    }

    this.clone = async function (repository, folderPath, token) {
        let visibility;
        try {
            visibility = await this.checkGitHubRepoVisibility(repository);
        } catch (error) {
            console.log(error);
        }

        if(!visibility || visibility === "Private") {
            if (!token) {
                throw new Error("GitHub token not set");
            }

            const authenticatedRepo = repository.replace(
                "https://github.com/",
                `https://${token}@github.com/`
            );
            return await execAsync(`git clone ${authenticatedRepo} ${folderPath}`);
        }

        let parentFolder = path.dirname(folderPath);
        let mkDir = util.promisify(fs.mkdir);
        await mkDir(parentFolder, {recursive: true});

        await execAsync(`git clone ${repository} ${folderPath}`);
    }

    this.getLastCommitDate = async function (repoPath) {
        try {
            const { stdout } = await execAsync(`git -C ${repoPath} log -1 --format=%cd`);
            return stdout.trim();
        } catch (error) {
            throw new Error(`Failed to get last commit date: ${error.message}`);
        }
    }

    this.checkForUpdates = async function (localPath, remoteUrl, token) {
        if (!fs.existsSync(localPath)) {
            throw new Error("Local repository path does not exist.");
        }

        if (!fs.existsSync(path.join(localPath, '.git'))) {
            throw new Error("The specified path is not a Git repository.");
        }
        
        if (!token) {
            return false;
        }
        const remoteUrlWithToken = token
            ? remoteUrl.replace("https://github.com/", `https://${token}@github.com/`)
            : remoteUrl;

        try {
            // const { stdout: currentRemoteUrl } = await execAsync(`git -C ${localPath} remote get-url origin`);
            // if (currentRemoteUrl.trim() !== remoteUrl && currentRemoteUrl.trim() !== remoteUrlWithToken) {
            //     throw new Error(`Remote URL mismatch. Expected: ${remoteUrl} or ${remoteUrlWithToken}, Found: ${currentRemoteUrl.trim()}`);
            // }

            await execAsync(`git -C ${localPath} fetch`);

            const { stdout: branchStdout } = await execAsync(`git -C ${localPath} rev-parse --abbrev-ref HEAD`);
            const branch = branchStdout.trim();

            const { stdout: localCommit } = await execAsync(`git -C ${localPath} rev-parse ${branch}`);
            const { stdout: remoteCommit } = await execAsync(`git -C ${localPath} rev-parse origin/${branch}`);

            return localCommit.trim() !== remoteCommit.trim();
        } catch (error) {
            if (!token) {
                throw new Error(`Failed to check for updates: ${error.message}`);
            }

            try {
                const { stdout: currentRemoteUrl } = await execAsync(`git -C ${localPath} remote get-url origin`);
                if (currentRemoteUrl.trim() !== remoteUrlWithToken) {
                    throw new Error(`Remote URL mismatch even after retry. Expected: ${remoteUrlWithToken}, Found: ${currentRemoteUrl.trim()}`);
                }

                await execAsync(`git -C ${localPath} fetch`);
                const { stdout: branchStdout } = await execAsync(`git -C ${localPath} rev-parse --abbrev-ref HEAD`);
                const branch = branchStdout.trim();
                const { stdout: localCommit } = await execAsync(`git -C ${localPath} rev-parse ${branch}`);
                const { stdout: remoteCommit } = await execAsync(`git -C ${localPath} rev-parse origin/${branch}`);

                return localCommit.trim() !== remoteCommit.trim();
            } catch (retryError) {
                throw new Error(`Failed to check for updates after retry with token: ${retryError.message}`);
            }
        }
    }
}

module.exports = {
    getCoreInstance: async () => {
        return new GitCore()
    }
};
