export function rafThrottle<T extends (...args: any[]) => void>(fn: T) {
    let ticking = false
    return (...args: Parameters<T>) => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => {
            fn(...args)
            ticking = false
        })
    }
}
