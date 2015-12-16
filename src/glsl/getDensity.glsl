#pragma glslify: sampleAs3DTexture = require(./helpers/sampleAs3DTexture)

float getDensity( in vec3 p ) {

    return sampleAs3DTexture( GLOBAL_VAR_textureVolume, p , GLOBAL_VAR_sliceInfo).r;

}

#pragma glslify: export(getDensity)
