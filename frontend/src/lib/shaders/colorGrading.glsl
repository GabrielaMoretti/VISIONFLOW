/**
 * Color Grading GLSL Shader
 *
 * Full color grading pipeline running on the GPU.
 * All operations happen in LINEAR space (not gamma-encoded sRGB).
 * This is critical — gamma-encoded math causes saturated colors to go
 * to white/black instead of naturally brighter/darker tones.
 *
 * Pipeline order:
 *   1. sRGB → Linear (degamma)
 *   2. Temperature shift (Bradford-like chromatic adaptation)
 *   3. Split toning (shadows/highlights color cast)
 *   4. HSL/OKLCH-space adjustments (hue, chroma, lightness)
 *   5. Filmic tonemapping (S-curve with highlight rolloff)
 *   6. Contrast (around mid-gray pivot)
 *   7. Vignette
 *   8. Linear → sRGB (regamma)
 *
 * Based on glsl-color-spaces (tobspr) and Blender's filmic pipeline.
 * @module colorGrading.glsl
 */

precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;

// --- Color adjustments ---
uniform float u_hueDelta;         // hue rotation in radians
uniform float u_chromaDelta;      // chroma adjustment (-0.1 to 0.1)
uniform float u_lightnessDelta;   // lightness adjustment (-0.15 to 0.15)
uniform float u_contrastDelta;    // contrast (-0.3 to 0.3)
uniform float u_temperatureDelta; // temperature shift (-1 to 1, mapped)

// --- Split toning ---
uniform vec3 u_splitHighlight;    // highlight cast color (linear RGB)
uniform float u_splitHighlightStr; // highlight cast strength (0–1)
uniform vec3 u_splitShadow;       // shadow cast color (linear RGB)
uniform float u_splitShadowStr;    // shadow cast strength (0–1)

// --- Filmic tonemapping ---
uniform float u_filmicA;  // shoulder strength
uniform float u_filmicB;  // linear strength
uniform float u_filmicC;  // linear angle
uniform float u_filmicD;  // toe strength
uniform float u_filmicE;  // toe numerator
uniform float u_filmicF;  // toe denominator
uniform float u_filmicW;  // white point

// --- Vignette ---
uniform float u_vignetteAmount;   // 0 = none, 1 = max
uniform float u_vignetteRadius;   // falloff radius (0.5 = edge, 1.0 = center)

// --- Blend ---
uniform float u_strength;         // global effect strength (0–1)

varying vec2 v_texCoord;

// ============================================================================
// Color space conversions (from glsl-color-spaces)
// ============================================================================

// sRGB gamma → linear
vec3 srgbToLinear(vec3 srgb) {
    vec3 cutoff = step(vec3(0.04045), srgb);
    vec3 lo = srgb / 12.92;
    vec3 hi = pow((srgb + 0.055) / 1.055, vec3(2.4));
    return mix(lo, hi, cutoff);
}

// linear → sRGB gamma
vec3 linearToSrgb(vec3 linear) {
    vec3 cutoff = step(vec3(0.0031308), linear);
    vec3 lo = linear * 12.92;
    vec3 hi = 1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055;
    return mix(lo, hi, cutoff);
}

// Linear RGB → OKLab
vec3 rgbToOklab(vec3 rgb) {
    float l = 0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b;
    float m = 0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b;
    float s = 0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b;

    float l_ = pow(l, 1.0 / 3.0);
    float m_ = pow(m, 1.0 / 3.0);
    float s_ = pow(s, 1.0 / 3.0);

    return vec3(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    );
}

// OKLab → Linear RGB
vec3 oklabToRgb(vec3 lab) {
    float l_ = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m_ = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s_ = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
         4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

// OKLab → OKLCH
vec3 oklabToOklch(vec3 lab) {
    float C = sqrt(lab.y * lab.y + lab.z * lab.z);
    float h = atan(lab.z, lab.y);
    return vec3(lab.x, C, h);
}

// OKLCH → OKLab
vec3 oklchToOklab(vec3 lch) {
    return vec3(
        lch.x,
        lch.y * cos(lch.z),
        lch.y * sin(lch.z)
    );
}

// ============================================================================
// Filmic tonemapping (Hable/Uncharted 2)
// ============================================================================

float filmicCurve(float x) {
    float num = (x * (u_filmicA * x + u_filmicC * u_filmicB) + u_filmicD * u_filmicE);
    float den = (x * (u_filmicA * x + u_filmicB) + u_filmicD * u_filmicF);
    return num / den - u_filmicE / u_filmicF;
}

vec3 filmicTonemap(vec3 color) {
    float whiteScale = 1.0 / filmicCurve(u_filmicW);
    return vec3(
        filmicCurve(color.r) * whiteScale,
        filmicCurve(color.g) * whiteScale,
        filmicCurve(color.b) * whiteScale
    );
}

// ============================================================================
// Temperature shift (simplified Bradford-like)
// ============================================================================

vec3 applyTemperature(vec3 linear, float temp) {
    // Warm: boost red, slightly reduce blue
    // Cool: boost blue, slightly reduce red
    return vec3(
        linear.r * (1.0 + temp * 0.1),
        linear.g,
        linear.b * (1.0 - temp * 0.08)
    );
}

// ============================================================================
// Split toning
// ============================================================================

vec3 applySplitTone(vec3 linear, float luminance) {
    // Smooth shadow/highlight transition using luminance-based weighting
    // This is the key to avoiding the "filter divided in half" look
    float shadowWeight = 1.0 - smoothstep(0.0, 0.5, luminance);
    float highlightWeight = smoothstep(0.5, 1.0, luminance);

    vec3 shadowCast = mix(linear, u_splitShadow, shadowWeight * u_splitShadowStr);
    vec3 highlightCast = mix(linear, u_splitHighlight, highlightWeight * u_splitHighlightStr);

    // Blend: preserve luminance while applying split tone
    float origLum = dot(linear, vec3(0.2126, 0.7152, 0.0722));
    vec3 combined = mix(shadowCast, highlightCast, luminance);
    float newLum = dot(combined, vec3(0.2126, 0.7152, 0.0722));

    // Luminance preservation ratio
    float lumRat = origLum > 0.001 ? origLum / max(newLum, 0.001) : 1.0;
    return combined * lumRat;
}

// ============================================================================
// Vignette
// ============================================================================

float vignette(vec2 uv) {
    vec2 center = uv - 0.5;
    float dist = length(center);
    return 1.0 - smoothstep(u_vignetteRadius, u_vignetteRadius + 0.3, dist) * u_vignetteAmount;
}

// ============================================================================
// Main
// ============================================================================

void main() {
    vec2 uv = v_texCoord;
    vec4 texColor = texture2D(u_image, uv);

    // --- 1. sRGB → Linear ---
    vec3 linear = srgbToLinear(texColor.rgb);

    // --- 2. Temperature ---
    linear = applyTemperature(linear, u_temperatureDelta);

    // --- 3. Split toning ---
    float lum = dot(linear, vec3(0.2126, 0.7152, 0.0722));
    if (u_splitHighlightStr > 0.001 || u_splitShadowStr > 0.001) {
        linear = applySplitTone(linear, lum);
    }

    // --- 4. OKLCH adjustments ---
    vec3 oklab = rgbToOklab(linear);
    vec3 oklch = oklabToOklch(oklab);

    // Hue rotation
    oklch.z += u_hueDelta;

    // Chroma (perceptual saturation)
    oklch.y = max(0.0, oklch.y + u_chromaDelta);

    // Lightness
    oklch.x = clamp(oklch.x + u_lightnessDelta, 0.0, 1.0);

    oklab = oklchToOklab(oklch);
    linear = oklabToRgb(oklab);
    linear = max(linear, vec3(0.0)); // clamp negatives from gamut

    // --- 5. Filmic tonemapping ---
    linear = filmicTonemap(linear);

    // --- 6. Contrast (around 0.18 mid-gray for photographic accuracy) ---
    float midGray = 0.18;
    linear = midGray + (linear - midGray) * (1.0 + u_contrastDelta);
    linear = clamp(linear, 0.0, 1.0);

    // --- 7. Vignette ---
    linear *= vignette(uv);

    // --- 8. Linear → sRGB ---
    vec3 graded = linearToSrgb(linear);

    // --- Blend with original based on strength ---
    vec3 finalColor = mix(texColor.rgb, graded, u_strength);

    gl_FragColor = vec4(finalColor, texColor.a);
}
