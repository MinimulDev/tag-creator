import * as core from "@actions/core"
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

        try {
            const latestRelease: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"] = await kit.repos.getLatestRelease({
                owner: this.input.owner,
                repo: this.input.repo
            })

            core.info(`latest release response ${latestRelease}`)
        } catch (e) {
            core.setFailed(e)
        }
    }

}

export default ActionManager