import * as core from "@actions/core"
import * as github from "@actions/github"
import {Octokit, RestEndpointMethodTypes} from "@octokit/rest"

export type Input = {
    readonly token: string
    readonly owner: string
    readonly repo: string
    readonly skip_ci: boolean
    readonly version_file: string | null
}

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
        const kit = new Octokit({
            auth: this.input.token
        })

        const current_ref = github.context.ref

        let latest_release: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"] | null

        try {
            latest_release = await kit.repos.getLatestRelease({
                owner: this.input.owner,
                repo: this.input.repo
            })

            core.info(`latest release response ${latest_release}`)
        } catch (e) {
            latest_release = null
        }

        core.info(`current ref ${current_ref}`)
    }

}

export default ActionManager