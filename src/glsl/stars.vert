attribute vec2 random;

varying float vAlpha;
varying float vIntensity;
varying vec3 vColor;

uniform float time;

void main() {

    vAlpha = sin( time * (0.3 + random.x) - random.y * 211.01);
    vIntensity = 0.5 + sin( time * (0.1 + random.x) - random.y * 2.01) * 0.5;

    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    mvPosition.x += 10000.0 * step(-800.0, -length(worldPosition.xyz - cameraPosition));

    vColor = mix(
        vec3(115.0, 54.0, 0.0) / 255.0,
        vec3(0.0, 95.0, 94.0) / 255.0,
        fract(random.x + random.y * 123.512)
    );

    gl_PointSize = ( mix(1200.0, 12000.0, random.x) / length( mvPosition.xyz ) );

    gl_Position = projectionMatrix * mvPosition;

}
