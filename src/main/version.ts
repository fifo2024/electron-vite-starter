import packageJson from '../../package.json'

export function getAppVersion(): string {
    console.log(4, packageJson)
    return packageJson.version
}
