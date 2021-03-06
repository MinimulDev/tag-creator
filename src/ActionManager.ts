import * as core from "@actions/core"
import {Octokit, RestEndpointMethodTypes} from "@octokit/rest"

import Utils from "./utils"
import {VersionType} from "./types";

export type Input = {
    readonly token: string
    readonly owner: string
    readonly repo: string
    readonly skip_ci: boolean
    readonly version_file: string | null
}

const INVALID_MERGE_MSG = "Merge commit message contains more info than needed to make a tag"

class ActionManager {

    private readonly input: Input

    constructor(
        input: Input
    ) {
        this.input = input
    }

    run = async () => {
        await this._run()
    }

    private _run = async () => {
        const owner = this.input.owner
        const repo = this.input.repo
        const kit = new Octokit({
            auth: this.input.token
        })

        const repository = await kit.request("GET /repos/{owner}/{repo}", {
            owner: owner,
            repo: repo
        })

        const default_branch = repository.data.default_branch

        core.info(`using default branch ${default_branch}`)

        const latest_commit = await kit.request(`GET /repos/{owner}/{repo}/commits/${default_branch}`, {
            owner: owner,
            repo: repo
        })

        core.info(`latest commit ${JSON.stringify(latest_commit.data)}`)

        const message = latest_commit.data.message

        const is_merge_commit = Utils.isMergeCommit(message)

        if (!is_merge_commit) {
            core.info(`latest commit is not a Merge commit: ${message}`)
            return
        }

        const merged_branch = Utils.getBranchFromMergeCommit(owner, message)

        if (merged_branch == null) {
            core.info(INVALID_MERGE_MSG)
            return
        }

        const branch_type = Utils.getBranchType(merged_branch)

        if (branch_type == null) {
            core.info(`could not process merged branch ${merged_branch}`)
            return
        }

        let current_version: VersionType | null

        try {
            let latest_release: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"] = await kit.repos.getLatestRelease({
                owner: this.input.owner,
                repo: this.input.repo
            })

            core.info(`latest release response ${latest_release}`)

            current_version = Utils.getVersion(latest_release.data.tag_name)
        } catch (e) {
            current_version = Utils.getVersion("0.0.0")
        }

        if (current_version == null) {
            core.info("could not process latest release tag_name")
            return
        }

        const new_version = Utils.getNewVersion(current_version, branch_type)

        if (new_version == null) {
            core.info(`could not update version from branch ${merged_branch}`)
            return
        }

        core.info(`new version ${Utils.versionTypeToString(new_version)}`)
    }
}

export default ActionManager