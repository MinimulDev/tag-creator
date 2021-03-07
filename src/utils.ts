import {
    branch_types,
    BranchType,
    hotfix_types,
    HotfixType,
    minor_types,
    MinorType,
    patch_types,
    PatchType,
    VersionType
} from "./types"

class Utils {

    static MergeRegex = new RegExp(/Merge pull request #[0-9]* from /)

    static isMergeCommit = (msg: string): boolean => {
        return Utils.MergeRegex.test(msg)
    }

    static getBranchFromMergeCommit = (owner: string, msg: string): string | null => {
        if (owner == "" || msg == "") return null

        try {
            const split = msg.split(Utils.MergeRegex)

            if (split.length != 2) {
                return null
            }

            const owner_branch_split = split[1].trimEnd().split(`${owner}/`)

            if (owner_branch_split.length != 2) {
                return null
            }

            return owner_branch_split[1].trimEnd()
        } catch (e) {
            return null
        }
    }

    static getBranchType(branch: string): BranchType | null {
        const split = branch.split("/")
        if (split.length <= 1) return null
        const first = split[0]
        if (Utils.isBranchType(first)) {
            return first
        }
        return null
    }

    static isMinorType = (type: BranchType): type is MinorType => {
        return (minor_types).includes(type)
    }

    static isPatchType = (type: BranchType): type is PatchType => {
        return (patch_types).includes(type)
    }

    static isHotfixType = (type: BranchType): type is HotfixType => {
        return (hotfix_types).includes(type)
    }

    static compareVersions(first: VersionType, second: VersionType): number {
        if (first.major == second.major &&
            first.minor == second.minor &&
            first.patch == second.patch &&
            first.hotfix == second.hotfix
        ) {
            return 0
        }

        if (first.major > second.major) {
            return -1
        } else if (first.major < second.major) {
            return 1
        }

        if (first.minor > second.minor) {
            return -1
        } else if (first.minor < second.minor) {
            return 1
        }

        if (first.patch > second.patch) {
            return -1
        } else if (first.patch < second.patch) {
            return 1
        }

        if (first.hotfix > second.hotfix) {
            return -1
        } else if (first.hotfix < second.hotfix) {
            return 1
        }

        return 0
    }

    static getVersion = (tag_name: string): VersionType | null => {
        const split = tag_name.split(".")
        const l = split.length
        if (l == 0) return null
        if (l >= 3) {
            const str_major = split[0]
            const str_minor = split[1]
            const str_patch = split[2]

            const major = parseInt(str_major)
            const minor = parseInt(str_minor)
            const patch = parseInt(str_patch)

            if (isNaN(major) || isNaN(minor) || isNaN(patch)) return null

            if (l == 3) {
                return {
                    major: major,
                    minor: minor,
                    patch: patch,
                    hotfix: 0
                }
            } else if (l == 4) {
                const str_hotfix = split[3]
                const hotfix = parseInt(str_hotfix)
                if (isNaN(hotfix)) return null
                return {
                    major: major,
                    minor: minor,
                    patch: patch,
                    hotfix: hotfix
                }
            }
            return null
        }
        return null
    }

    static getNewVersion = (current_version: VersionType, branch_type: BranchType): VersionType | null => {
        if (Utils.isMinorType(branch_type)) {
            return {
                ...current_version,
                minor: current_version.minor + 1
            }
        } else if (Utils.isPatchType(branch_type)) {
            return {
                ...current_version,
                patch: current_version.patch + 1
            }
        } else if (Utils.isHotfixType(branch_type)) {
            return {
                ...current_version,
                hotfix: current_version.hotfix + 1
            }
        } else {
            return null
        }
    }

    static versionTypeToString = (type: VersionType): string => {
        let suffix: string = ""
        if (type.hotfix != 0) suffix = `.${type.hotfix}`
        return `${type.major}.${type.minor}.${type.patch}${suffix}`
    }

    private static isBranchType = (type: string): type is BranchType => {
        return (branch_types).includes(type)
    }
}

export default Utils