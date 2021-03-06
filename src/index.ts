import * as core from "@actions/core"
import * as github from "@actions/github"

import ActionManager, {Input} from "./ActionManager"

new Promise(async () => {

    const token = core.getInput("token")
    const skip_ci = core.getInput("token")
    const version_filename = core.getInput("version_filename")
    const skip_ci_commit_string = core.getInput("skip_ci_commit_string")
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    if (token) {
        const input: Input = {
            token: token,
            owner: owner,
            repo: repo,
            skip_ci: skip_ci == "true",
            version_filename: version_filename,
            skip_ci_commit_string: skip_ci_commit_string
        }

        const manager = new ActionManager(input)
        await manager.run()
    } else {
        console.log("GitHub Token required, please set the `token: ${YOUR_GITHUB_TOKEN}` action input/")
    }
}).then()