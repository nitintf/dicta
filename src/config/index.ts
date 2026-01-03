import { DictaConfig } from './types'
import packageJson from '../../package.json'

export const appConfig: DictaConfig = {
  version: packageJson.version,
}
