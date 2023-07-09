const vertexShaderSource = `
attribute vec4 position;
varying vec2 fragmentCoordinates;

void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    fragmentCoordinates = position.xy * 1.;
}
`;

const fragmentShaderSource = `
precision highp float;
varying vec2 fragmentCoordinates;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float iZoomOffset;
uniform float iInitialXOffset;
uniform float iPortfolioScrollPercentage;

// Configuration
#define NOISE_STRENGTH 0.08
#define SPECULAR_STRENGTH 0.17
#define ANIMATION_SPEED 0.2
#define DEPTH 60.0
#define SEGMENT_QUALITY 1.2

// Shape Definition
float blob(vec3 q) {
    float f = DEPTH;
    f *= (cos(q.z * 1.1)) * (atan(q.x) + 0.2) * (cos(q.y * cos(q.z * 2.)) + 1.0) + cos(q.z * 5. + iTime * ANIMATION_SPEED) * cos(q.x) * sin(q.y) * ((.6 * (1.0)));
    return f;
}

// Gaussian Noise Effect
float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(4.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

// Output
void main(void) {
    gl_FragColor = vec4(0, 0, 0, 1.);

    vec2 p = -3. + 1.6 * fragmentCoordinates + (iZoomOffset * 0.2);
    vec3 o = vec3(p.x + 14. - (iZoomOffset * 3.0) - (iInitialXOffset * 3.0) - ((1.0 - iMouse.x) * 0.5) + ((iPortfolioScrollPercentage * 5.0) * iZoomOffset), p.y + 2.7 - (iZoomOffset * 0.3) - (iMouse.y * 0.15), -0.35 + (iZoomOffset * 0.4));
    vec3 d = vec3(p.x * 8. + ((1.0 - iMouse.x) * 0.5) - (iZoomOffset * 2.0), p.y + 0.5 + ((1.0 - iMouse.y) * 0.25) - (iZoomOffset * 0.5), 0.8 + (iZoomOffset * 2.0)) / 140.;

    vec4 c = vec4(0.);
    float t = 0.;
    for (int i = 0; i < 140; i++) {
        if (blob(o + d * t) < 20.) {
            vec3 e = vec3(.1, .0, 2.1 - (iZoomOffset * 0.8));
            vec3 n = vec3(.0);
            n.x = blob(o + d * t) - blob(vec3(o + d * t + e.xyy)) - (iZoomOffset * 4.0);
            n.y = blob(o + d * t) - blob(vec3(o + d * t + e.yxy)) - (iZoomOffset * 7.0);
            n.z = blob(o + d * t) - blob(vec3(o + d * t + e.yyx)) + 1.0;
            n = normalize(n);
            c += max(dot(vec3(0.2 + (iZoomOffset * 1.0 + iInitialXOffset) + (iMouse.x * 0.1), 1.5, -1. - (iZoomOffset * 0.5)), n), .0) + min(dot(vec3(3.0 - (iZoomOffset * 2.0), 10.2 - (iZoomOffset * 3.0), -11. - (iZoomOffset * 3.0)), n), .1) * 0.1;
            break;
        }
        t += SEGMENT_QUALITY;
    }

    // Base Color
    gl_FragColor += vec4(.16, 0.05, .38, 0.) * (0.8 + (iZoomOffset * 0.3));

    // Specular
    gl_FragColor += c * (SPECULAR_STRENGTH + (iZoomOffset * 0.1)) * vec4(.40, 0.6, 0.89 - (iZoomOffset * 0.01), 1);

    // Brightness
    gl_FragColor *= (t * (.04 + (iZoomOffset * 0.03)));

    // Apply Noise
    vec2 ps = vec2(1.0) / iResolution.xy;
    vec2 uv = fragmentCoordinates * ps;
    float seed = dot(uv * vec2(1000.), vec2(12, 52));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian(noise, float(0.0), float(0.5) * float(0.5));
    vec3 grain = vec3(noise) * (1.0 - gl_FragColor.rgb);
    gl_FragColor.rgb -= grain * NOISE_STRENGTH;
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, -1,
        1, -1,
        -1, 1,
        1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const iMouseLocation = gl.getUniformLocation(program, 'iMouse');
    const iZoomOffsetLocation = gl.getUniformLocation(program, 'iZoomOffset');
    const iInitialXOffsetLocation = gl.getUniformLocation(program, 'iInitialXOffset');
    const iPortfolioScrollPercentageLocation = gl.getUniformLocation(program, 'iPortfolioScrollPercentage');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height);
    }

    function animate() {
        gl.uniform1f(iTimeLocation, performance.now() / 1000);
        gl.uniform2f(iMouseLocation, 0, 0);
        gl.uniform1f(iZoomOffsetLocation, 0);
        gl.uniform1f(iInitialXOffsetLocation, 0);
        gl.uniform1f(iPortfolioScrollPercentageLocation, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(animate);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
}

main();
