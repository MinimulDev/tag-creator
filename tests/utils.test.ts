import {expect} from "chai"

import Utils from "../src/utils"
import {describe} from "mocha";

describe("utils", () => {
    describe("isMergeCommit", () => {
        it("should return true for 'Merge pull request #1 from someOwner/feature/something'", () => {
            const actual = Utils.isMergeCommit("Merge pull request #1 from someOwner/feature/something")
            expect(actual).to.be.true
        })

        it("should return true for 'Merge pull request #99 from someOwner/feature/something'", () => {
            const actual = Utils.isMergeCommit("Merge pull request #99 from someOwner/feature/something")
            expect(actual).to.be.true
        })

        it("should return false for 'Merge pull request from someOwner/feature/something'", () => {
            const actual = Utils.isMergeCommit("Merge pull request from someOwner/feature/something")
            expect(actual).to.be.false
        })

        it("should return false for 'someOwner/feature/something'", () => {
            const actual = Utils.isMergeCommit("someOwner/feature/something")
            expect(actual).to.be.false
        })
    })

    describe("isBranchType", () => {
        it("should return feature on feature/something", () => {
            const actual = Utils.getBranchType("feature/something")
            expect(actual).to.eq("feature")
        })

        it("should return chore on chore/something", () => {
            const actual = Utils.getBranchType("chore/something")
            expect(actual).to.eq("chore")
        })

        it("should return hotfix on hotfix/something", () => {
            const actual = Utils.getBranchType("hotfix/something")
            expect(actual).to.eq("hotfix")
        })

        it("should return docs on docs/something", () => {
            const actual = Utils.getBranchType("docs/something")
            expect(actual).to.eq("docs")
        })

        it("should return null on unknown/something", () => {
            const actual = Utils.getBranchType("unknown/something")
            expect(actual).to.be.null
        })

        it("should return null on feature", () => {
            const actual = Utils.getBranchType("feature")
            expect(actual).to.be.null
        })
    })

    describe("isMinorType", () => {
        it("should return true for feature", () => {
            const type = Utils.getBranchType("feature/something")!
            const actual = Utils.isMinorType(type)
            expect(actual).to.be.true
        })

        it("should return false for chore", () => {
            const type = Utils.getBranchType("chore/something")!
            const actual = Utils.isMinorType(type)
            expect(actual).to.be.false
        })

        it("should return false for hotfix", () => {
            const type = Utils.getBranchType("hotfix/something")!
            const actual = Utils.isMinorType(type)
            expect(actual).to.be.false
        })
    })

    describe("isPatchType", () => {
        it("should return true for chore", () => {
            const type = Utils.getBranchType("chore/something")!
            const actual = Utils.isPatchType(type)
            expect(actual).to.be.true
        })

        it("should return true for docs", () => {
            const type = Utils.getBranchType("docs/something")!
            const actual = Utils.isPatchType(type)
            expect(actual).to.be.true
        })

        it("should return true for test", () => {
            const type = Utils.getBranchType("test/something")!
            const actual = Utils.isPatchType(type)
            expect(actual).to.be.true
        })

        it("should return false for feature", () => {
            const type = Utils.getBranchType("feature/something")!
            const actual = Utils.isPatchType(type)
            expect(actual).to.be.false
        })

        it("should return false for hotfix", () => {
            const type = Utils.getBranchType("hotfix/something")!
            const actual = Utils.isPatchType(type)
            expect(actual).to.be.false
        })
    })

    describe("getVersion", () => {
        it("should transform 0.0.0", () => {
            const actual = Utils.getVersion("0.0.0")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: null
            })
        })

        it("should transform 0.0.1", () => {
            const actual = Utils.getVersion("0.0.1")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 0,
                patch: 1,
                hotfix: null
            })
        })

        it("should transform 0.1.0", () => {
            const actual = Utils.getVersion("0.1.0")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 1,
                patch: 0,
                hotfix: null
            })
        })

        it("should transform 1.0.0", () => {
            const actual = Utils.getVersion("1.0.0")
            expect(actual).to.deep.equal({
                major: 1,
                minor: 0,
                patch: 0,
                hotfix: null
            })
        })

        it("should transform 0.1.1", () => {
            const actual = Utils.getVersion("0.1.1")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 1,
                patch: 1,
                hotfix: null
            })
        })

        it("should transform 1.1.0", () => {
            const actual = Utils.getVersion("1.1.0")
            expect(actual).to.deep.equal({
                major: 1,
                minor: 1,
                patch: 0,
                hotfix: null
            })
        })

        it("should transform 1.1.1", () => {
            const actual = Utils.getVersion("1.1.1")
            expect(actual).to.deep.equal({
                major: 1,
                minor: 1,
                patch: 1,
                hotfix: null
            })
        })

        it("should transform 0.0.0.1", () => {
            const actual = Utils.getVersion("0.0.0.1")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: 1
            })
        })

        it("should transform 0.1.1.1", () => {
            const actual = Utils.getVersion("0.1.1.1")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 1,
                patch: 1,
                hotfix: 1
            })
        })

        it("should transform 1.1.1.1", () => {
            const actual = Utils.getVersion("1.1.1.1")
            expect(actual).to.deep.equal({
                major: 1,
                minor: 1,
                patch: 1,
                hotfix: 1
            })
        })

        it("should transform 0.0.1.1", () => {
            const actual = Utils.getVersion("0.0.1.1")
            expect(actual).to.deep.equal({
                major: 0,
                minor: 0,
                patch: 1,
                hotfix: 1
            })
        })

        it("should not transform unknown major", () => {
            const actual = Utils.getVersion("v0.0.0")
            expect(actual).to.be.null
        })

        it("should not transform unknown minor", () => {
            const actual = Utils.getVersion("0.v0.0")
            expect(actual).to.be.null
        })

        it("should not transform unknown patch", () => {
            const actual = Utils.getVersion("0.0.v0")
            expect(actual).to.be.null
        })

        it("should not transform unknown hotfix", () => {
            const actual = Utils.getVersion("0.0.0.v0")
            expect(actual).to.be.null
        })
    })

    describe("getNewVersion", () => {
        describe("use_semver == true", () => {
            const use_semver = true
            const current_version = {
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: null
            }
            it("should update minor", () => {
                const actual = Utils.getNewVersion(current_version, "feature", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 1,
                        patch: 0,
                        hotfix: null
                    }
                )
            })
            it("should update patch", () => {
                const actual = Utils.getNewVersion(current_version, "chore", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 0,
                        patch: 1,
                        hotfix: null
                    }
                )
            })
            it("should update hotfix", () => {
                const actual = Utils.getNewVersion(current_version, "hotfix", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 0,
                        patch: 1,
                        hotfix: null
                    }
                )
            })
        })
        describe("use_semver == false", () => {
            const use_semver = false
            const current_version = {
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: 0
            }

            it("should update minor", () => {
                const actual = Utils.getNewVersion(current_version, "feature", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 1,
                        patch: 0,
                        hotfix: 0
                    }
                )
            })
            it("should update patch", () => {
                const actual = Utils.getNewVersion(current_version, "chore", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 0,
                        patch: 1,
                        hotfix: 0
                    }
                )
            })
            it("should update hotfix", () => {
                const actual = Utils.getNewVersion(current_version, "hotfix", use_semver)
                expect(actual).to.deep.eq(
                    {
                        major: 0,
                        minor: 0,
                        patch: 0,
                        hotfix: 1
                    }
                )
            })
        })
    })

    describe("versionTypeToString", () => {
        it("should convert 0.0.0", () => {
            const version = {
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: 0
            }
            const actual = Utils.versionTypeToString(version)
            expect(actual).to.eq("0.0.0")
        })
        it("should convert 0.0.1", () => {
            const version = {
                major: 0,
                minor: 0,
                patch: 1,
                hotfix: 0
            }
            const actual = Utils.versionTypeToString(version)
            expect(actual).to.eq("0.0.1")
        })
        it("should convert 0.1.0", () => {
            const version = {
                major: 0,
                minor: 1,
                patch: 0,
                hotfix: 0
            }
            const actual = Utils.versionTypeToString(version)
            expect(actual).to.eq("0.1.0")
        })
        it("should convert 1.0.0", () => {
            const version = {
                major: 1,
                minor: 0,
                patch: 0,
                hotfix: 0
            }
            const actual = Utils.versionTypeToString(version)
            expect(actual).to.eq("1.0.0")
        })
        it("should convert 0.0.0.1", () => {
            const version = {
                major: 0,
                minor: 0,
                patch: 0,
                hotfix: 1
            }
            const actual = Utils.versionTypeToString(version)
            expect(actual).to.eq("0.0.0.1")
        })
    })

    describe("versionFilesToStringArray", () => {
        it("should handle single file", () => {
            const version_files = "version.txt"

            const actual = Utils.versionFilesToStringArray(version_files)

            expect(actual).to.deep.eq([version_files])
        })

        it("should handle 2 files", () => {
            const version_files = "[version.txt, ./some/other/file.txt]"

            const actual = Utils.versionFilesToStringArray(version_files)

            expect(actual).to.deep.eq(["version.txt", "some/other/file.txt"])
        })

        it("should handle 3 files", () => {
            const version_files = "[version.txt, ./some/other/version.properties, \"/yet/another/version.tmp\"]"

            const actual = Utils.versionFilesToStringArray(version_files)

            expect(actual).to.deep.eq(["version.txt", "some/other/version.properties", "yet/another/version.tmp"])
        })
    })
})