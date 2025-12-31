import { requestMicPermission } from './permissions'

export async function ensureMicPermission(): Promise<boolean> {
  return await requestMicPermission()
}
