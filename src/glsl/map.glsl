float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}


float sdCone( in vec3 p, in vec3 c ) {
    vec2 q = vec2( length(p.xz), p.y );
    float d1 = -q.y-c.z;
    float d2 = max( dot(q,c.xy), q.y);
    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);
}


float map(vec3 p) {

    return sdBox(p, vec3(20.0, 20.0, 20.0));


    // doesn't look natural with sdf on the tree

    // vec2 coneParams = normalize(vec2(1.0, 1.0));

    // float d = sdCone(p + vec3(0.0, -11.8 - GLOBAL_VAR_treeOffset, 0.0), vec3(coneParams, 5.8));
    // d = min( d, sdCone(p + vec3(0.0, -7.5 - GLOBAL_VAR_treeOffset, 0.0), vec3(coneParams, 8.0)) );
    // d = min( d, sdCone(p + vec3(0.0, -2.5 - GLOBAL_VAR_treeOffset, 0.0), vec3(coneParams, 13.0)) );

    // p.x += GLOBAL_VAR_useBox * 1000.0;
    // d = min( d, sdBox(p, vec3(20.0, 20.0, 20.0)));

    // return d;

}

#pragma glslify: export(map)
