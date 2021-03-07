import * as core from "@actions/core"
import * as base64 from "base-64"
import {Octokit} from "@octokit/rest"

import Utils from "./utils"
import {VersionType} from "./types"

export type Input = {
    readonly token: string
    readonly owner: string
    readonly repo: string
    readonly skip_ci: boolean
    readonly skip_ci_commit_string: string
    readonly version_filename: string,
    readonly head_ref: string
}

const VERSION_TEMPLATE = `MAJOR=<MAJOR_VERSION>
MINOR=<MINOR_VERSION>
PATCH=<PATCH_VERSION>
HOTFIX=<HOTFIX_VERSION>`

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

        const merged_branch = this.input.head_ref

        const branch_type = Utils.getBranchType(merged_branch)

        if (branch_type == null) {
            core.info(`could not process merged branch ${merged_branch}`)
            return
        }

        let latest_version: VersionType | null

        try {
            const releases = await kit.request("GET /repos/{owner}/{repo}/releases", {
                ...base_params
            })

            if (releases.data.length == 0) {
                latest_version = Utils.getVersion("0.0.0")
            } else if (releases.data.length == 1) {
                latest_version = Utils.getVersion(releases.data[0].tag_name)
            } else {

                let max_version = Utils.getVersion(releases.data[0].tag_name)

                if (max_version == null) {
                    core.info("could not process releases")
                    return
                }

                for (let x of releases.data) {
                    const x_version = Utils.getVersion(x.tag_name)
                    if (x_version != null) {
                        const compare = Utils.compareVersions(max_version, x_version)
                        if (compare == 1) {
                            max_version = x_version
                        }
                    }
                }

                latest_version = max_version
            }

        } catch (e) {
            latest_version = Utils.getVersion("0.0.0")
        }

        if (latest_version == null) {
            core.info("could not process latest release tag_name")
            return
        }

        const new_version = Utils.getNewVersion(latest_version, branch_type)

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

        let prev_blob_sha: string | null

        try {
            const prev_content_blob_response = await kit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                ...base_params,
                path: version_file
            })

            // @ts-ignore
            prev_blob_sha = prev_content_blob_response.data.sha

        } catch (e) {
            core.error(e)
            prev_blob_sha = null
        }

        try {
            const new_content_blob_response = await kit.request("POST /repos/{owner}/{repo}/git/blobs", {
                ...base_params,
                encoding: "base64",
                content: new_version_content
            })

            new_content_blob_sha = new_content_blob_response.data.sha

        } catch (e) {
            core.error(e)
            core.error("could not create content blob")
            new_content_blob_sha = null
        }

        if (new_content_blob_sha == null) {
            return
        }

        core.info(`attempting to create/update ${version_file}`)

        try {
            await kit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                ...base_params,
                headers: {
                    accept: "application/vnd.github.v3+json",
                },
                path: version_file,
                message: update_msg,
                content: base64.encode(new_version_content),
                sha: prev_blob_sha ?? undefined
            })

            core.info(`successfully updated ${version_file}`)
        } catch (e) {
            core.error(e)
            core.error("could not update content")
            return
        }
    }
}

export default ActionManager