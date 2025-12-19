/**
 * Debug utility - Only logs in development mode
 * Usage: import { debug } from '../utils/debug'
 *        debug.log('🔌 [WIRING]', message)
 */

const isDev = import.meta.env.DEV

export const debug = {
    log: (...args) => isDev && console.log(...args),
    warn: (...args) => isDev && console.warn(...args),
    error: (...args) => console.error(...args), // Always show errors
    info: (...args) => isDev && console.info(...args),
}

/**
 * Setup debug globals on window (only in development)
 */
export const setupDebugGlobals = (globals) => {
    if (!isDev) return

    Object.entries(globals).forEach(([key, value]) => {
        window[key] = value
    })
}

/**
 * Check if running in development mode
 */
export const isDevMode = () => isDev

export default debug
