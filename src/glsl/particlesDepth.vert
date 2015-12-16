uniform sampler2D texturePosition;

const float EPS = 0.0001;

//chunk(common);
//chunk(morphtarget_pars_vertex);
//chunk(skinning_pars_vertex);
//chunk(logdepthbuf_pars_vertex);

void main() {

    //chunk(skinbase_vertex);

    //chunk(begin_vertex);

    //chunk(morphtarget_vertex);
    //chunk(skinning_vertex);


    vec4 positionInfo = texture2D( texturePosition, position.xy );
    vec3 pos = positionInfo.xyz;

    transformed = pos;

    //chunk(project_vertex);
    //chunk(logdepthbuf_vertex);

    gl_PointSize = ( mix(300.0, 600.0, clamp(positionInfo.w, 0.0, 1.0)) / length( mvPosition.xyz ) );
}
