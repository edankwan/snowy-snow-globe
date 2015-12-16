#pragma glslify: getDensity = require(./getDensity)

vec3 calcNormal( in vec3 p ) {

    vec2 e = vec2(1.0, -1.0) * 0.5773;

    return normalize( e.xyy * length(getDensity( p + e.xyy / GLOBAL_VAR_volumeResolution )) +
        e.yyx * length(getDensity( p + e.yyx / GLOBAL_VAR_volumeResolution )) +
        e.yxy * length(getDensity( p + e.yxy / GLOBAL_VAR_volumeResolution )) +
        e.xxx * length(getDensity( p + e.xxx / GLOBAL_VAR_volumeResolution )) );
}

#pragma glslify: export(calcNormal)
