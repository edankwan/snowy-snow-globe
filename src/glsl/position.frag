uniform vec2 resolution;
uniform vec3 volumeResolution;

uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform sampler2D textureVolume;
uniform vec4 sliceInfo;
uniform float gravity;
uniform float time;
uniform float useBox;
uniform float treeOffset;

const float EPS = 0.0001;

#pragma glslify: getDensity = require(./getDensity)
#pragma glslify: calcNormal = require(./calcNormal)
#pragma glslify: random = require(glsl-random)

#pragma glslify: map = require(./map)
#pragma glslify: calcMapNormal = require(./calcMapNormal)

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 velocityInfo = texture2D( textureVelocity, uv );
    vec3 velocity = velocityInfo.xyz;
    vec4 positionInfo = texture2D( texturePosition, uv );
    vec3 position = positionInfo.xyz;

    // randomness
    float sinTime = sin(time);
    float r = random(uv + sinTime);
    float r2 = random(uv + 13.58 + sinTime);

    position += velocity;
    vec3 p = position - volumeResolution * 0.5;
    float sd = map(p);

    float density = getDensity( position / volumeResolution ) * smoothstep(0.3, 3.0, sd);

    // snow inter-bounce
    if(density > 2.4) {
        position += density * (0.2 + r * 0.2) * reflect(normalize(velocity + vec3((r - 0.5) * 0.2, gravity, (r2 - 0.5) * 0.2)), calcNormal( position / volumeResolution ));
    }

    // sphere and base bounce test
    vec3 v = position / volumeResolution - 0.5;
    float d = min(0.5 , length(v));
    position = (d * normalize(v) + 0.5) * volumeResolution;
    position.y = max(20.0, position.y);

    // sdf
    p = position - volumeResolution * 0.5;
    sd = map(p);
    position += step(-0.5, -sd) * sd * calcMapNormal(p) * 0.1;
    density += step(-0.5, -sd); // make the snow looks bigger

    gl_FragColor = vec4(position, density * 0.2 + positionInfo.w * 0.8);

}
