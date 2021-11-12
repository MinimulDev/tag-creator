import path from "path"

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

        if (first.hotfix != null && second.hotfix != null) {
            if (first.hotfix > second.hotfix) {
                return -1
            } else if (first.hotfix < second.hotfix) {
                return 1
            }
        } else if (first.hotfix != null) {
            return -1
        } else if (second.hotfix != null) {
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
                    hotfix: null
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

    static getNewVersion = (current_version: VersionType, branch_type: BranchType, use_semver: boolean): VersionType | null => {
        if (Utils.isMinorType(branch_type)) {
            return {
                ...current_version,
                minor: current_version.minor + 1,
                patch: 0,
                hotfix: use_semver ? null : 0
            }
        } else if (Utils.isPatchType(branch_type)) {
            return {
                ...current_version,
                patch: current_version.patch + 1,
                hotfix: use_semver ? null : 0
            }
        } else if (Utils.isHotfixType(branch_type)) {
            if (use_semver) {
                return {
                    ...current_version,
                    patch: current_version.patch + 1,
                    hotfix: null
                }
            } else {
                let new_hotfix: number
                if (current_version.hotfix == null) new_hotfix = 1
                else new_hotfix = current_version.hotfix + 1
                return {
                    ...current_version,
                    hotfix: new_hotfix
                }
            }
        } else {
            return null
        }
    }

    static versionTypeToString = (type: VersionType): string => {
        let suffix: string = ""
        if (type.hotfix != null && type.hotfix != 0) suffix = `.${type.hotfix}`
        return `${type.major}.${type.minor}.${type.patch}${suffix}`
    }

    static versionFilesToStringArray = (version_files: string): string[] => {
        const output: string[] = []

        if (version_files.startsWith("[") && version_files.endsWith("]")) {
            const split = version_files.substring(1).slice(0, -1).split(",").map((t) => {
                let trimmed = t.trim()
                trimmed = trimmed
                    .replace(/['"]+/g, '')
                if (trimmed.startsWith("/")) trimmed = trimmed.substring(1)
                return trimmed
            })

            const normalized = split.map((t) => {
                return path.normalize(t)
            })

            output.push(...normalized)
        } else {
            output.push(version_files)
        }

        return output
    }

    private static isBranchType = (type: string): type is BranchType => {
        return (branch_types).includes(type)
    }
}

export default Utils