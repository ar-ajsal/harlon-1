/**
 * Device performance detection utilities
 * Used to disable/reduce animations on low-end devices
 */

export function isLowEndDevice() {
    const lowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4
    const lowRAM = navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2
    const saveData = navigator.connection?.saveData === true
    const slowNet = ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType)

    return lowCPU || lowRAM || saveData || slowNet
}

export function getMotionPreset() {
    if (typeof window === 'undefined') return 'full'
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || isLowEndDevice()) return 'none'
    return 'full'
}
