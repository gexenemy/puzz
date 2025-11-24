import { RANDOM_COLORS, RANDOM_NAMES } from './constants'

export function randomName() {
    const n = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    const b = Math.floor(100 + Math.random() * 900)
    return `${n}-${b}`
}

export function randomColor() {
    return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)]
}
