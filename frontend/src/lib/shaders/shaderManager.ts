/**
 * Shader Pipeline Manager — regl integration
 *
 * Connects the GLSL shaders to the rendering pipeline via regl,
 * which provides a clean functional API over raw WebGL.
 *
 * Why regl instead of raw WebGL?
 *   - 90% less boilerplate (no manual buffer/program/state management)
 *   - Automatic resource cleanup
 *   - Functional API that composes well with the mood pipeline
 *   - Still gives full access to custom GLSL
 *
 * @module shaderManager
 */

import createREGL, { type Regl, type DrawCommand } from 'regl';
import {
  type FilmicCurveParams,
  FILMIC_DEFAULT,
  FILMIC_PRESETS,
  type FilmicPresetName,
} from '../color/toneMapping';
import { oklchToRgb, type OklchColor } from '../color/colorSpaces';
import { type OklchMoodAdjustment } from '../../utils/moodMapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShaderPipelineConfig {
  /** Canvas element to render to */
  canvas: HTMLCanvasElement;
  /** Optional pixel ratio (defaults to window.devicePixelRatio) */
  pixelRatio?: number;
}

export interface GradingUniforms {
  // Color adjustments
  hueDelta: number;
  chromaDelta: number;
  lightnessDelta: number;
  contrastDelta: number;
  temperatureDelta: number;

  // Split toning
  splitHighlight: [number, number, number];
  splitHighlightStr: number;
  splitShadow: [number, number, number];
  splitShadowStr: number;

  // Filmic
  filmicA: number;
  filmicB: number;
  filmicC: number;
  filmicD: number;
  filmicE: number;
  filmicF: number;
  filmicW: number;

  // Vignette
  vignetteAmount: number;
  vignetteRadius: number;

  // Blend
  strength: number;
}

// ---------------------------------------------------------------------------
// Shader sources
// ---------------------------------------------------------------------------

const VERTEX_SHADER = `
  precision highp float;
  attribute vec2 a_position;
  varying vec2 v_texCoord;

  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    v_texCoord.y = 1.0 - v_texCoord.y; // flip Y for image coordinates
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// The fragment shader is loaded as a string — in production, use a bundler
// plugin (e.g., vite-plugin-glsl) to import .glsl files directly.
// For now, we inline the core logic.
const FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_image;
  uniform vec2 u_resolution;

  uniform float u_hueDelta;
  uniform float u_chromaDelta;
  uniform float u_lightnessDelta;
  uniform float u_contrastDelta;
  uniform float u_temperatureDelta;

  uniform vec3 u_splitHighlight;
  uniform float u_splitHighlightStr;
  uniform vec3 u_splitShadow;
  uniform float u_splitShadowStr;

  uniform float u_filmicA;
  uniform float u_filmicB;
  uniform float u_filmicC;
  uniform float u_filmicD;
  uniform float u_filmicE;
  uniform float u_filmicF;
  uniform float u_filmicW;

  uniform float u_vignetteAmount;
  uniform float u_vignetteRadius;

  uniform float u_strength;

  varying vec2 v_texCoord;

  // --- sRGB ↔ Linear ---
  vec3 srgbToLinear(vec3 srgb) {
    vec3 cutoff = step(vec3(0.04045), srgb);
    vec3 lo = srgb / 12.92;
    vec3 hi = pow((srgb + 0.055) / 1.055, vec3(2.4));
    return mix(lo, hi, cutoff);
  }

  vec3 linearToSrgb(vec3 lin) {
    vec3 cutoff = step(vec3(0.0031308), lin);
    vec3 lo = lin * 12.92;
    vec3 hi = 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055;
    return mix(lo, hi, cutoff);
  }

  // --- OKLab / OKLCH ---
  vec3 rgbToOklab(vec3 rgb) {
    float l = 0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b;
    float m = 0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b;
    float s = 0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b;
    float l_ = pow(max(l, 0.0), 1.0/3.0);
    float m_ = pow(max(m, 0.0), 1.0/3.0);
    float s_ = pow(max(s, 0.0), 1.0/3.0);
    return vec3(
      0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
      1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
      0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
    );
  }

  vec3 oklabToRgb(vec3 lab) {
    float l_ = lab.x + 0.3963377774*lab.y + 0.2158037573*lab.z;
    float m_ = lab.x - 0.1055613458*lab.y - 0.0638541728*lab.z;
    float s_ = lab.x - 0.0894841775*lab.y - 1.2914855480*lab.z;
    return vec3(
      4.0767416621*l_*l_*l_ - 3.3077115913*m_*m_*m_ + 0.2309699292*s_*s_*s_,
      -1.2684380046*l_*l_*l_ + 2.6097574011*m_*m_*m_ - 0.3413193965*s_*s_*s_,
      -0.0041960863*l_*l_*l_ - 0.7034186147*m_*m_*m_ + 1.7076147010*s_*s_*s_
    );
  }

  vec3 oklabToOklch(vec3 lab) {
    float C = sqrt(lab.y*lab.y + lab.z*lab.z);
    float h = atan(lab.z, lab.y);
    return vec3(lab.x, C, h);
  }

  vec3 oklchToOklab(vec3 lch) {
    return vec3(lch.x, lch.y*cos(lch.z), lch.y*sin(lch.z));
  }

  // --- Filmic ---
  float filmicCurve(float x) {
    float num = (x*(u_filmicA*x + u_filmicC*u_filmicB) + u_filmicD*u_filmicE);
    float den = (x*(u_filmicA*x + u_filmicB) + u_filmicD*u_filmicF);
    return num/den - u_filmicE/u_filmicF;
  }

  vec3 filmicTonemap(vec3 c) {
    float ws = 1.0 / filmicCurve(u_filmicW);
    return vec3(filmicCurve(c.r)*ws, filmicCurve(c.g)*ws, filmicCurve(c.b)*ws);
  }

  // --- Temperature ---
  vec3 applyTemp(vec3 lin, float t) {
    return vec3(lin.r*(1.0+t*0.1), lin.g, lin.b*(1.0-t*0.08));
  }

  // --- Split tone ---
  vec3 applySplitTone(vec3 lin, float lum) {
    float sw = 1.0 - smoothstep(0.0, 0.5, lum);
    float hw = smoothstep(0.5, 1.0, lum);
    vec3 sc = mix(lin, u_splitShadow, sw * u_splitShadowStr);
    vec3 hc = mix(lin, u_splitHighlight, hw * u_splitHighlightStr);
    float origLum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
    vec3 combined = mix(sc, hc, lum);
    float newLum = dot(combined, vec3(0.2126, 0.7152, 0.0722));
    return combined * (origLum > 0.001 ? origLum/max(newLum,0.001) : 1.0);
  }

  // --- Vignette ---
  float vignette(vec2 uv) {
    float d = length(uv - 0.5);
    return 1.0 - smoothstep(u_vignetteRadius, u_vignetteRadius+0.3, d) * u_vignetteAmount;
  }

  void main() {
    vec4 tex = texture2D(u_image, v_texCoord);
    vec3 lin = srgbToLinear(tex.rgb);

    lin = applyTemp(lin, u_temperatureDelta);

    float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
    if (u_splitHighlightStr > 0.001 || u_splitShadowStr > 0.001) {
      lin = applySplitTone(lin, lum);
    }

    vec3 oklab = rgbToOklab(lin);
    vec3 oklch = oklabToOklch(oklab);
    oklch.z += u_hueDelta;
    oklch.y = max(0.0, oklch.y + u_chromaDelta);
    oklch.x = clamp(oklch.x + u_lightnessDelta, 0.0, 1.0);
    lin = max(oklabToRgb(oklchToOklab(oklch)), vec3(0.0));

    lin = filmicTonemap(lin);
    lin = 0.18 + (lin - 0.18) * (1.0 + u_contrastDelta);
    lin = clamp(lin, 0.0, 1.0);
    lin *= vignette(v_texCoord);

    vec3 graded = linearToSrgb(lin);
    gl_FragColor = vec4(mix(tex.rgb, graded, u_strength), tex.a);
  }
`;

// ---------------------------------------------------------------------------
// Pipeline class
// ---------------------------------------------------------------------------

export class ShaderPipeline {
  private regl: Regl;
  private drawGrading: DrawCommand;
  private imageTexture: any;

  constructor(config: ShaderPipelineConfig) {
    this.regl = createREGL({
      canvas: config.canvas,
      pixelRatio: config.pixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
      attributes: {
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      },
    });

    // Create fullscreen quad
    const quadBuffer = this.regl.buffer([
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]);

    this.imageTexture = this.regl.texture({
      width: 1,
      height: 1,
      data: [0, 0, 0, 255],
    });

    this.drawGrading = this.regl({
      vert: VERTEX_SHADER,
      frag: FRAGMENT_SHADER,

      attributes: {
        a_position: quadBuffer,
      },

      uniforms: {
        u_image: () => this.imageTexture,
        u_resolution: () => [config.canvas.width, config.canvas.height],
        u_hueDelta: this.regl.prop<any, 'hueDelta'>('hueDelta'),
        u_chromaDelta: this.regl.prop<any, 'chromaDelta'>('chromaDelta'),
        u_lightnessDelta: this.regl.prop<any, 'lightnessDelta'>('lightnessDelta'),
        u_contrastDelta: this.regl.prop<any, 'contrastDelta'>('contrastDelta'),
        u_temperatureDelta: this.regl.prop<any, 'temperatureDelta'>('temperatureDelta'),
        u_splitHighlight: this.regl.prop<any, 'splitHighlight'>('splitHighlight'),
        u_splitHighlightStr: this.regl.prop<any, 'splitHighlightStr'>('splitHighlightStr'),
        u_splitShadow: this.regl.prop<any, 'splitShadow'>('splitShadow'),
        u_splitShadowStr: this.regl.prop<any, 'splitShadowStr'>('splitShadowStr'),
        u_filmicA: this.regl.prop<any, 'filmicA'>('filmicA'),
        u_filmicB: this.regl.prop<any, 'filmicB'>('filmicB'),
        u_filmicC: this.regl.prop<any, 'filmicC'>('filmicC'),
        u_filmicD: this.regl.prop<any, 'filmicD'>('filmicD'),
        u_filmicE: this.regl.prop<any, 'filmicE'>('filmicE'),
        u_filmicF: this.regl.prop<any, 'filmicF'>('filmicF'),
        u_filmicW: this.regl.prop<any, 'filmicW'>('filmicW'),
        u_vignetteAmount: this.regl.prop<any, 'vignetteAmount'>('vignetteAmount'),
        u_vignetteRadius: this.regl.prop<any, 'vignetteRadius'>('vignetteRadius'),
        u_strength: this.regl.prop<any, 'strength'>('strength'),
      },

      primitive: 'triangle strip',
      count: 4,
    });
  }

  /**
   * Upload an image to the GPU texture.
   * Call this when the source image changes.
   */
  setImage(source: HTMLImageElement | HTMLCanvasElement | ImageData): void {
    if (source instanceof ImageData) {
      this.imageTexture({
        width: source.width,
        height: source.height,
        data: source.data,
        format: 'rgba',
      });
    } else {
      this.imageTexture({
        data: source,
        flipY: true,
      });
    }
  }

  /**
   * Render the color grading pipeline with the given uniforms.
   */
  render(uniforms: GradingUniforms): void {
    this.regl.clear({ color: [0, 0, 0, 1] });

    (this.drawGrading as any)({
      ...uniforms,
    });
  }

  /**
   * Convenience: render from an OklchMoodAdjustment.
   * This is the primary API for the mood system.
   */
  renderMood(mood: OklchMoodAdjustment, globalStrength: number = 1.0): void {
    const filmic = FILMIC_PRESETS[mood.filmicPreset] ?? FILMIC_DEFAULT;

    // Convert split-tone OKLCH colors to linear RGB for the shader
    const highlightRgb = mood.splitHighlight
      ? oklchToLinearRgb(mood.splitHighlight)
      : [0, 0, 0] as [number, number, number];
    const shadowRgb = mood.splitShadow
      ? oklchToLinearRgb(mood.splitShadow)
      : [0, 0, 0] as [number, number, number];

    const raw = mood.raw;

    this.render({
      hueDelta: mood.hueDelta * (Math.PI / 180), // convert to radians for GLSL
      chromaDelta: mood.chromaDelta,
      lightnessDelta: mood.lightnessDelta,
      contrastDelta: (raw.contrastDelta ?? 0) / 100,
      temperatureDelta: (raw.temperatureDelta ?? 0) / 20,

      splitHighlight: highlightRgb,
      splitHighlightStr: mood.splitHighlight ? mood.splitHighlight.c * 3 : 0,
      splitShadow: shadowRgb,
      splitShadowStr: mood.splitShadow ? mood.splitShadow.c * 3 : 0,

      filmicA: filmic.shoulderStrength,
      filmicB: filmic.linearStrength,
      filmicC: filmic.linearAngle,
      filmicD: filmic.toeStrength,
      filmicE: filmic.toeNumerator,
      filmicF: filmic.toeDenominator,
      filmicW: filmic.whitePoint,

      vignetteAmount: (raw.vignetteAmount ?? 0) / 40,
      vignetteRadius: 0.5,

      strength: globalStrength,
    });
  }

  /**
   * Read the rendered result back as ImageData.
   */
  readPixels(): ImageData {
    const canvas = this.regl._gl.canvas as HTMLCanvasElement;
    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);

    this.regl._gl.readPixels(0, 0, width, height, this.regl._gl.RGBA, this.regl._gl.UNSIGNED_BYTE, pixels);

    // Flip vertically (WebGL reads bottom-to-top)
    const flipped = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < height; y++) {
      const srcRow = (height - y - 1) * width * 4;
      const dstRow = y * width * 4;
      flipped.set(pixels.subarray(srcRow, srcRow + width * 4), dstRow);
    }

    return new ImageData(flipped, width, height);
  }

  /**
   * Clean up GPU resources.
   */
  destroy(): void {
    this.regl.destroy();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert OKLCH color to linear RGB (0–1 scale) for shader uniforms.
 */
function oklchToLinearRgb(color: OklchColor): [number, number, number] {
  const srgb = oklchToRgb(color.l, color.c, color.h);
  // sRGB to linear
  const toLinear = (v: number) => {
    v = v / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return [toLinear(srgb.r), toLinear(srgb.g), toLinear(srgb.b)];
}

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

/**
 * Create a shader pipeline for a canvas element.
 *
 * Usage:
 *   const pipeline = createShaderPipeline({ canvas: myCanvasEl });
 *   pipeline.setImage(myImageElement);
 *   pipeline.renderMood(oklchMoodAdjustment, 0.8);
 *   const result = pipeline.readPixels();
 */
export function createShaderPipeline(config: ShaderPipelineConfig): ShaderPipeline {
  return new ShaderPipeline(config);
}
