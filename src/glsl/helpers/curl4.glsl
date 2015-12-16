#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

vec4 curlNoise( in vec4 p, in float noiseTime, in float persistence ) {

    vec4 xNoisePotentialDerivatives = vec4(0.0);
    vec4 yNoisePotentialDerivatives = vec4(0.0);
    vec4 zNoisePotentialDerivatives = vec4(0.0);

    for (int i = 0; i < 3; ++i) {

        float twoPowI = pow(2.0, float(i));
        float scale = 0.5 * twoPowI * pow(persistence, float(i));

        // float scale = (1.0 / 2.0) * pow(2.0, float(i));
        // float noiseScale = pow(persistence, float(i));
        // if(persistence == 0.0 && i == 0){ //fix undefined behaviour
        //     noiseScale = 1.0;
        // }

        xNoisePotentialDerivatives += snoise4(vec4(p * twoPowI, noiseTime)) * scale;
        yNoisePotentialDerivatives += snoise4(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
        zNoisePotentialDerivatives += snoise4(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
    }

    return vec3(
        zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
        xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
        yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
    );

}

#pragma glslify: export(curlNoise)
