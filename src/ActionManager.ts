import * as core from "@actions/core"
import * as base64 from "base-64"
import {Octokit, RestEndpointMethodTypes} from "@octokit/rest"

import Utils from "./utils"
import {VersionType} from "./types"

export type Input = {
    readonly token: string
    readonly owner: string
    readonly repo: string
    readonly skip_ci: boolean
    readonly skip_ci_commit_string: string
    readonly version_filename: string
}

const INVALID_MERGE_MSG = "Merge commit message contains more info than needed to make a tag"

const VERSION_TEMPLATE = `
MAJOR=<MAJOR_VERSION>
MINOR=<MINOR_VERSION>
PATCH=<PATCH_VERSION>
HOTFIX=<HOTFIX_VERSION>
`

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

        const base_params = {
            owner: owner,
            repo: repo
        }

        const kit = new Octokit({
            auth: this.input.token
        })

        const repository = await kit.request("GET /repos/{owner}/{repo}", base_params)

        const default_branch = repository.data.default_branch

        core.info(`using default branch ${default_branch}`)

        const latest_commit = await kit.request(`GET /repos/{owner}/{repo}/commits/${default_branch}`, base_params)

        const message = latest_commit.data.commit.message

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
            let latest_release: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"] = await kit.repos.getLatestRelease(base_params)

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

        const str_new_version = Utils.versionTypeToString(new_version)

        core.info(`using version ${str_new_version}`)

        const create_release_response = await kit.request("POST /repos/{owner}/{repo}/releases", {
            ...base_params,
            tag_name: str_new_version,
            name: `v${str_new_version}`,
            prerelease: true
        })

        if (create_release_response.status == 201) {
            core.info(`successfully created tag ${str_new_version} --> ${create_release_response.data.html_url}`)
        }

        const version_file = this.input.version_filename

        const new_version_content: string = `${VERSION_TEMPLATE}`
            .replace("<MAJOR_VERSION>", `${new_version.major}`)
            .replace("<MINOR_VERSION>", `${new_version.minor}`)
            .replace("<PATCH_VERSION>", `${new_version.patch}`)
            .replace("<HOTFIX_VERSION>", `${new_version.hotfix}`)

        let update_msg = `release: bump version ${str_new_version}`

        if (this.input.skip_ci) {
            update_msg += ` ${this.input.skip_ci_commit_string}`
        }

        let new_content_blob_sha: string | null

        try {
            const new_content_blob_response = await kit.request("POST /repos/{owner}/{repo}/git/blobs", {
                ...base_params,
                content: new_version_content
            })

            new_content_blob_sha = new_content_blob_response.data.sha

        } catch (e) {
            core.error(e)
            new_content_blob_sha = null
        }

        if (new_content_blob_sha == null) {
            return
        }

        try {
            await kit.request(`PUT /repos/{owner}/{repo}/contents/${version_file}`, {
                ...base_params,
                message: update_msg,
                content: base64.encode(new_version_content),
                sha: new_content_blob_sha
            })

            core.info(`successfully updated ${version_file}`)
        } catch (e) {
            core.error(e)
            return
        }

    }
}

export default ActionManager