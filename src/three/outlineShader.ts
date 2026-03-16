import * as THREE from 'three'

/**
 * Post-process outline shader — edge detection using depth + normal buffers.
 * Based on OmarShehata/webgl-outlines approach.
 */
export const OutlineShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    tNormal: { value: null as THREE.Texture | null },
    screenSize: { value: new THREE.Vector4(1, 1, 1, 1) },
    outlineColor: { value: new THREE.Color(0x000000) },
    // x = depthBias, y = depthMultiplier, z = normalBias, w = normalMultiplier
    multiplierParameters: { value: new THREE.Vector4(0.9, 20, 1, 1) },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform sampler2D tNormal;
    uniform vec4 screenSize;
    uniform vec3 outlineColor;
    uniform vec4 multiplierParameters;

    varying vec2 vUv;

    // Three.js RGBA depth unpacking (matches packDepthToRGBA)
    const float UnpackDownscale = 255.0 / 256.0;
    const vec4 UnpackFactors = UnpackDownscale / vec4(
      256.0 * 256.0 * 256.0,
      256.0 * 256.0,
      256.0,
      1.0
    );

    float readDepth(vec2 coord) {
      return dot(texture2D(tDepth, coord), UnpackFactors);
    }

    float getPixelDepth(int x, int y) {
      return readDepth(vUv + screenSize.zw * vec2(x, y));
    }

    vec3 getPixelNormal(int x, int y) {
      return texture2D(tNormal, vUv + screenSize.zw * vec2(x, y)).rgb;
    }

    float saturateValue(float num) {
      return clamp(num, 0.0, 1.0);
    }

    void main() {
      vec4 sceneColor = texture2D(tDiffuse, vUv);
      float depth = getPixelDepth(0, 0);
      vec3 normal = getPixelNormal(0, 0);

      // Depth-based edge detection (cross pattern)
      float depthDiff = 0.0;
      depthDiff += abs(depth - getPixelDepth(1, 0));
      depthDiff += abs(depth - getPixelDepth(-1, 0));
      depthDiff += abs(depth - getPixelDepth(0, 1));
      depthDiff += abs(depth - getPixelDepth(0, -1));

      // Normal-based edge detection (cross + diagonals)
      float normalDiff = 0.0;
      normalDiff += distance(normal, getPixelNormal(1, 0));
      normalDiff += distance(normal, getPixelNormal(-1, 0));
      normalDiff += distance(normal, getPixelNormal(0, 1));
      normalDiff += distance(normal, getPixelNormal(0, -1));
      normalDiff += distance(normal, getPixelNormal(1, 1));
      normalDiff += distance(normal, getPixelNormal(1, -1));
      normalDiff += distance(normal, getPixelNormal(-1, 1));
      normalDiff += distance(normal, getPixelNormal(-1, -1));

      float depthBias = multiplierParameters.x;
      float depthMultiplier = multiplierParameters.y;
      float normalBias = multiplierParameters.z;
      float normalMultiplier = multiplierParameters.w;

      depthDiff = depthDiff * depthMultiplier;
      depthDiff = saturateValue(depthDiff);
      depthDiff = pow(depthDiff, depthBias);

      normalDiff = normalDiff * normalMultiplier;
      normalDiff = saturateValue(normalDiff);
      normalDiff = pow(normalDiff, normalBias);

      float outline = saturateValue(depthDiff + normalDiff);

      vec4 outColor = vec4(outlineColor, 1.0);
      gl_FragColor = vec4(mix(sceneColor, outColor, outline));
    }
  `,
}
