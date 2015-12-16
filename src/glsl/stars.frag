
varying float vAlpha;
varying float vIntensity;
varying vec3 vColor;

void main() {

    float c = length(gl_PointCoord.xy - .5) * 2.0;
    c = pow(smoothstep(-1.0, 0.0, -c), 0.5 + vIntensity * 2.0);
    gl_FragColor = vec4( mix(vColor, vec3(1.0), c), c) * vAlpha;

}
