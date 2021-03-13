import * as core from "@actions/core"
import * as github from "@actions/github"

import ActionManager, {Input} from "./ActionManager"
import Utils from "./utils";

new Promise(async () => {

    const token = core.getInput("token")
    const skip_ci = core.getInput("token")
    const tmp_version_files = core.getInput("version_files")
    const skip_ci_commit_string = core.getInput("skip_ci_commit_string")

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    const head_ref = process.env.GITHUB_HEAD_REF

    if (!head_ref) {
        core.info("attempted to run action not within context of a Pull Request")
        return
    } else {
        core.info(`working with ${head_ref}`)
    }

    const version_files = Utils.versionFilesToStringArray(tmp_version_files)

    if (token) {
        const input: Input = {
            token: token,
            owner: owner,
            repo: repo,
            skip_ci: skip_ci == "true",
            version_files: version_files,
            skip_ci_commit_string: skip_ci_commit_string,
            head_ref: head_ref
        }

        const manager = new ActionManager(input)
        await manager.run()
    } else {
        console.log("GitHub Token required, please set the `token: ${YOUR_GITHUB_TOKEN}` action input")
    }
}).then()