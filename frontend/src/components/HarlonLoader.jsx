import { useEffect, useState } from 'react'
import './HarlonLoader.css'

/**
 * HarlonLoader — full-screen branded splash shown once per session.
 * Fades out after ~3.5 s then calls onDone so the parent unmounts it.
 */
export default function HarlonLoader({ onDone }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        // Match the CSS fadeOut delay (3.4 s) + transition (0.5 s)
        const timer = setTimeout(() => {
            setVisible(false)
            onDone?.()
        }, 3900)
        return () => clearTimeout(timer)
    }, [onDone])

    // Animate the percentage counter to match the CSS progress bar
    useEffect(() => {
        const pct = document.getElementById('hl-pct')
        if (!pct) return
        const keyframes = [
            { t: 300, v: 0 },
            { t: 1350, v: 45 },
            { t: 2150, v: 72 },
            { t: 2900, v: 100 },
        ]
        let start = null
        const lerp = (a, b, t) => a + (b - a) * t
        const getTarget = (elapsed) => {
            for (let i = 1; i < keyframes.length; i++) {
                if (elapsed <= keyframes[i].t) {
                    const prev = keyframes[i - 1]
                    const curr = keyframes[i]
                    const t = (elapsed - prev.t) / (curr.t - prev.t)
                    return Math.round(lerp(prev.v, curr.v, Math.min(t, 1)))
                }
            }
            return 100
        }
        let raf
        const tick = (ts) => {
            if (!start) start = ts
            const elapsed = ts - start
            pct.textContent = getTarget(elapsed) + '%'
            if (elapsed < 2900) {
                raf = requestAnimationFrame(tick)
            } else {
                pct.textContent = '100%'
            }
        }
        const t = setTimeout(() => { raf = requestAnimationFrame(tick) }, 300)
        return () => { clearTimeout(t); cancelAnimationFrame(raf) }
    }, [])

    if (!visible) return null

    return (
        <div className="hl-overlay" aria-hidden="true">
            <div className="hl-stitch-ring" />

            <div className="hl-wrap">
                {/* SVG Logo */}
                <svg className="hl-logo-svg" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
                    {/* h */}
                    <path className="hl-fill" d="M18,90 C18,90 20,30 22,28 C24,26 27,26 28,28 C29,30 29,52 29,55 C32,48 38,42 44,42 C50,42 54,46 54,54 L54,90 L47,90 L47,56 C47,52 45,50 42,50 C38,50 32,55 29,62 L29,90 Z" />
                    <path className="hl-path" d="M18,90 C18,90 20,30 22,28 C24,26 27,26 28,28 C29,30 29,52 29,55 C32,48 38,42 44,42 C50,42 54,46 54,54 L54,90 L47,90 L47,56 C47,52 45,50 42,50 C38,50 32,55 29,62 L29,90 Z" />
                    {/* a */}
                    <path className="hl-fill" d="M58,66 C58,52 67,42 78,42 C84,42 89,45 91,50 L92,44 L98,44 L98,90 L92,90 L91,84 C88,88 83,92 77,92 C66,92 58,80 58,66 Z M65,66 C65,76 70,85 77,85 C83,85 89,79 91,72 L91,60 C89,54 84,49 78,49 C71,49 65,57 65,66 Z" />
                    <path className="hl-path" d="M58,66 C58,52 67,42 78,42 C84,42 89,45 91,50 L92,44 L98,44 L98,90 L92,90 L91,84 C88,88 83,92 77,92 C66,92 58,80 58,66 Z M65,66 C65,76 70,85 77,85 C83,85 89,79 91,72 L91,60 C89,54 84,49 78,49 C71,49 65,57 65,66 Z" />
                    {/* r */}
                    <path className="hl-fill" d="M105,90 L105,44 L111,44 L112,52 C115,46 121,42 128,42 L128,49 C120,49 114,55 112,63 L112,90 Z" />
                    <path className="hl-path" d="M105,90 L105,44 L111,44 L112,52 C115,46 121,42 128,42 L128,49 C120,49 114,55 112,63 L112,90 Z" />
                    {/* l */}
                    <path className="hl-fill" d="M133,90 C133,90 135,28 137,26 C139,24 142,24 143,26 C144,28 144,90 144,90 Z" />
                    <path className="hl-path" d="M133,90 C133,90 135,28 137,26 C139,24 142,24 143,26 C144,28 144,90 144,90 Z" />
                    {/* o */}
                    <path className="hl-fill" d="M150,66 C150,52 160,42 172,42 C184,42 194,52 194,66 C194,80 184,92 172,92 C160,92 150,80 150,66 Z M157,66 C157,77 164,85 172,85 C180,85 187,77 187,66 C187,55 180,49 172,49 C164,49 157,55 157,66 Z" />
                    <path className="hl-path" d="M150,66 C150,52 160,42 172,42 C184,42 194,52 194,66 C194,80 184,92 172,92 C160,92 150,80 150,66 Z M157,66 C157,77 164,85 172,85 C180,85 187,77 187,66 C187,55 180,47 172,49 C164,49 157,55 157,66 Z" />
                    {/* n */}
                    <path className="hl-fill" d="M200,90 L200,44 L206,44 L207,51 C210,46 217,42 224,42 C232,42 237,47 237,56 L237,90 L230,90 L230,58 C230,53 227,50 223,50 C218,50 211,55 208,63 L208,90 Z" />
                    <path className="hl-path" d="M200,90 L200,44 L206,44 L207,51 C210,46 217,42 224,42 C232,42 237,47 237,56 L237,90 L230,90 L230,58 C230,53 227,50 223,50 C218,50 211,55 208,63 L208,90 Z" />
                    {/* Tail curl */}
                    <path className="hl-fill" d="M237,88 C245,92 258,96 265,92 C272,88 268,82 260,84 C252,86 245,90 237,90 Z" />
                    <path className="hl-path" d="M237,88 C245,92 258,96 265,92 C272,88 268,82 260,84 C252,86 245,90 237,90" />
                    {/* Swoosh underline */}
                    <path className="hl-swoosh-fill" d="M14,100 C60,108 160,112 245,104 C255,103 262,108 258,114 C255,118 248,118 240,116 C180,110 80,108 14,100 Z" />
                    <path className="hl-swoosh" d="M14,100 C60,108 160,112 245,104 C255,103 262,108 258,114 C255,118 248,118 240,116 C180,110 80,108 14,100" />
                </svg>

                {/* Progress bar */}
                <div className="hl-bar-wrap">
                    <span className="hl-pct" id="hl-pct">0%</span>
                    <div className="hl-bar-track">
                        <div className="hl-bar-fill" />
                    </div>
                </div>

                {/* Pulsing dots */}
                <div className="hl-dots">
                    <div className="hl-dot" />
                    <div className="hl-dot" />
                    <div className="hl-dot" />
                </div>

                <span className="hl-tagline">Premium Jerseys — Est. Since Day One</span>
            </div>
        </div>
    )
}
