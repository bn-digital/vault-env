import { getInput, info, setFailed } from '@actions/core'
import path from 'path'
import VaultEnv from './index'
import crypto from 'crypto'
import { config } from 'dotenv'
import { exec } from '@actions/exec'

/**
 * Executes as Github Action entrypoint
 */
async function run(): Promise<void> {
  config()
  const workspaceDir = process.env.GITHUB_WORKSPACE
  try {
    const vaultEnv = new VaultEnv(getInput('endpoint'), {
      provider: getInput('provider'),
      token: getInput('token') ?? process.env.GITHUB_TOKEN,
    })
    const values = vaultEnv.populate(path.resolve(workspaceDir, getInput('template')), path.resolve(workspaceDir, getInput('target')))

    Object.entries(values).map(([key, value]) =>
      info(`Created entry ${key} with hashed value ${crypto.createHash('sha256').update(value).digest()}`)
    )
    exec('shasum', ['-a', '256', '.env']).then((value) => info(`Exited with code ${value}`))
  } catch (error) {
    setFailed(error.message)
  }
}

run().catch(console.error)
