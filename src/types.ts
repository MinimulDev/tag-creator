export const minor_types: string[] = ["feature"]
export const patch_types: string[] = ["chore", "test", "docs"]
export const hotfix_types: string[] = ["hotfix"]

export type MinorType = (typeof minor_types)[number]
export type PatchType = (typeof patch_types)[number]
export type HotfixType = (typeof hotfix_types)[number]

export const branch_types = minor_types.concat(patch_types, hotfix_types)

export type BranchType = (typeof branch_types)[number]

export type VersionType = {
    major: number
    minor: number
    patch: number
    hotfix: number
}