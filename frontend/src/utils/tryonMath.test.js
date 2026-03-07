import assert from 'assert'
import { computePlacement, LM } from './tryonMath.js'

// Mock environment and standard assertions
function runTests() {
    console.log('Running Virtual Try-On Math Tests...\n')
    let passed = 0
    let failed = 0

    const runTest = (name, testFn) => {
        try {
            testFn()
            console.log(`✅ PASS: ${name}`)
            passed++
        } catch (e) {
            console.error(`❌ FAIL: ${name}`)
            console.error(e.message)
            failed++
        }
    }

    // TEST CASE 1: Perfect frontal shot with nose and shoulders visible
    runTest('Calculates correct 0-angle and center for a perfectly frontal posture', () => {
        const landmarks = []
        // 0 = nose (center top), 11 = Left shoulder (right side of image), 12 = Right shoulder (left side of image)
        landmarks[LM.NOSE] = { x: 0.5, y: 0.2 }
        landmarks[LM.LEFT_SHOULDER] = { x: 0.7, y: 0.4 }
        landmarks[LM.RIGHT_SHOULDER] = { x: 0.3, y: 0.4 }

        const res = computePlacement(landmarks, 1000, 1000)

        // Shoulders width = 400px. Jersey = 400 * 1.4 = 560
        assert.strictEqual(Math.round(res.scale), 560, 'Scale should be 1.4x shoulder width')
        assert.strictEqual(Math.round(res.angle), 0, 'Angle should be 0 for perfectly horizontal shoulders')
        assert.strictEqual(Math.round(res.x), 500 - 280, 'X should be centered between shoulders')
    })

    // TEST CASE 2: Tilted shoulders
    runTest('Calculates valid angle when the user leans to one side', () => {
        const landmarks = []
        // Leaning to the left in real life (right in image). Right shoulder is higher (smaller Y)
        landmarks[LM.NOSE] = { x: 0.5, y: 0.2 }
        landmarks[LM.LEFT_SHOULDER] = { x: 0.8, y: 0.5 }
        landmarks[LM.RIGHT_SHOULDER] = { x: 0.3, y: 0.3 }

        const res = computePlacement(landmarks, 1000, 1000)

        // Shoulders are not level. Angle should NOT be zero.
        assert.notStrictEqual(Math.round(res.angle), 0, 'Angle should reflect tilted shoulders')
        // We expect positive rotation (clockwise tilt relative to horizontal)
        assert.ok(res.angle > 15, 'Angle should be visibly positive')
    })

    // TEST CASE 3: Fallback handling when landmarks are totally missing
    runTest('Provides safe fallback placement when shoulders are missing', () => {
        const landmarks = []
        // Missing everything!
        const res = computePlacement(landmarks, 500, 500)

        assert.ok(res.scale > 0, 'Should return a valid numeric scale')
        assert.strictEqual(res.angle, 0, 'Angle must be 0 for default fallback')
    })

    console.log(`\nTests finished. Passed: ${passed}, Failed: ${failed}`)
    if (failed > 0) process.exit(1)
}

runTests()
