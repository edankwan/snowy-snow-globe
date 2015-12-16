
// chunk(common);
// chunk(fog_pars_fragment);
// chunk(shadowmap_pars_fragment);

void main() {

    vec3 outgoingLight = vec3(1.0);

    // chunk(shadowmap_fragment);

    outgoingLight *= 0.65 + pow(shadowMask, vec3(0.5)) * 0.35;

    // chunk(fog_fragment);
    // chunk(linear_to_gamma_fragment);

    // float d = length(gl_PointCoord.xy - .5) * 2.0;

    gl_FragColor = vec4(outgoingLight, 1.0 );// * (1.0 - step(1.0, d)) ;

}
