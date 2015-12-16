uniform sampler2D texturePosition;

// chunk(shadowmap_pars_vertex);

void main() {

    vec4 positionInfo = texture2D( texturePosition, position.xy );

    vec4 worldPosition = modelMatrix * vec4( positionInfo.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    gl_PointSize = ( mix(350.0, 800.0, clamp(positionInfo.w, 0.0, 1.0)) / length( mvPosition.xyz ) );
    // mvPosition.y += gl_PointSize;

    // chunk(shadowmap_vertex);

    gl_Position = projectionMatrix * mvPosition;

}
