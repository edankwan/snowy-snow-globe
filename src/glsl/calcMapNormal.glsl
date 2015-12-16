#pragma glslify: map = require(./map)

vec3 calcMapNormal( in vec3 p ) {

    vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.01;

    return normalize( e.xyy * length(map( p + e.xyy )) +
        e.yyx * length(map( p + e.yyx )) +
        e.yxy * length(map( p + e.yxy )) +
        e.xxx * length(map( p + e.xxx )) );
}

#pragma glslify: export(calcMapNormal)
