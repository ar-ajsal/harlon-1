// MediaPipe landmark indices
export const LM = { NOSE: 0, LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_HIP: 23, RIGHT_HIP: 24 }

/**
 * Computes the placement (x, y, scale, angle) for the jersey overlay
 * based on MediaPipe Pose landmarks.
 *
 * @param {Array} landmarks - Array of landmarks from MediaPipe Pose.
 * @param {number} imgW - Width of the image/canvas.
 * @param {number} imgH - Height of the image/canvas.
 * @returns {Object} { x, y, scale, angle }
 */
export function computePlacement(landmarks, imgW, imgH) {
    const ls = landmarks[LM.LEFT_SHOULDER]
    const rs = landmarks[LM.RIGHT_SHOULDER]
    const nose = landmarks[LM.NOSE]

    if (!ls || !rs) {
        return { x: imgW * 0.15, y: imgH * 0.18, scale: imgW * 0.70, angle: 0 }
    }

    const lsx = ls.x * imgW, lsy = ls.y * imgH
    const rsx = rs.x * imgW, rsy = rs.y * imgH

    // Shoulder width → jersey width. Add ~40% padding because shoulders
    // represent the biological joints, not the outer edge of the shirt.
    const shoulderW = Math.abs(rsx - lsx)
    const jerseyW = shoulderW * 1.4

    // Center X between shoulders
    const centerX = (lsx + rsx) / 2
    let shoulderY = (lsy + rsy) / 2

    // If nose is visible, anchor collar relative to nose and shoulders
    // The collar of a jersey usually sits roughly halfway down the theoretical neck.
    if (nose) {
        const noseY = nose.y * imgH
        shoulderY = noseY + (shoulderY - noseY) * 0.8
    }

    const x = centerX - jerseyW / 2
    const y = shoulderY - jerseyW * 0.15  // slight pull-up for 3D perspective

    // Calculate angle of the shoulder line. Let's use arctangent.
    // In MediaPipe, Left Shoulder (LM 11) is on the user's left.
    // In an unmirrored selfie, this is on the Right Hand Side of the image (larger X).
    const angleRad = Math.atan2(lsy - rsy, lsx - rsx)
    let angleDeg = angleRad * (180 / Math.PI)

    // Cap the angle to prevent upside down jerseys
    if (angleDeg > 90) angleDeg -= 180
    if (angleDeg < -90) angleDeg += 180

    return { x, y, scale: jerseyW, angle: angleDeg }
}
