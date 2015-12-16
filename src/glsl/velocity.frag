uniform vec2 resolution;
uniform vec3 volumeResolution;

uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform sampler2D textureVolume;
uniform vec4 sliceInfo;
uniform float gravity;
uniform float time;
uniform float pop;
// uniform float useBox;
// uniform float treeOffset;

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

    vec3 g = vec3(0.0, -gravity * (0.1 + r * 0.05), 0.0);

    // velocity *= 0.995;

    // volume test
    float density = getDensity( (position + velocity) / volumeResolution );
    float densityG = getDensity( (position + velocity + g) / volumeResolution );
    velocity += step(-1.5 - r * 0.5, -densityG) * step(densityG, density) * g;
    density = getDensity( (position + velocity) / volumeResolution );

    // snow inter-bounce
    if(density > 1.8) {
        velocity = length(velocity) * 1.7 * density * pow(0.5, density) * reflect(normalize(velocity - g), calcNormal( position / volumeResolution ));
    }

    // sphere and base bounce test
    vec3 v = (position + velocity) / volumeResolution - 0.5;
    velocity = mix(velocity, reflect(velocity, normalize(-v )) * 0.5, step(0.5 , length(v) - 0.5 / volumeResolution.x ));
    velocity.y *= mix(1.0, -0.3,  step(-20.0, -position.y));

    // sdf
    vec3 p = position + velocity - volumeResolution * 0.5;
    float d = map(p);
    velocity = mix( velocity, reflect(velocity, calcMapNormal(p))  * -d * 0.5, step(0.0, -d));

    // pop noise
    velocity.xz += vec2(r - 0.5, r2 -0.5) * step(0.5, pop);

    gl_FragColor = vec4(velocity, 1.0);

}
