import {Octokit} from "@octokit/rest"

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

        const releases = await kit.repos.listReleases({
            owner: this.input.owner,
            repo: this.input.repo
        })

        console.log(releases)
    }

}

export default ActionManager