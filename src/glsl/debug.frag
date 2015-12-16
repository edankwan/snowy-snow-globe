uniform sampler2D texture;

varying vec2 vUv;

void main() {

    vec3 color = texture2D( texture, vUv ).rgb;

    gl_FragColor = vec4(color, 1.0);

}
