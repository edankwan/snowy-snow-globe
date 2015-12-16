
// attribute vec3 position;

uniform vec3 resolution;
uniform vec2 textureResolution;

uniform sampler2D texturePosition;
uniform vec4 sliceInfo;

varying vec3 vVelocity;

#pragma glslify: coord3to2 = require(./helpers/coord3to2)

void main() {
    vec3 pos = texture2D( texturePosition, position.xy ).xyz;
    pos.z = floor(pos.z + 0.5);
    gl_Position = vec4( (coord3to2(pos / resolution, sliceInfo) * 2.0 - 1.0), 0.0, 1.0 );
    gl_PointSize = 1.0;
}
