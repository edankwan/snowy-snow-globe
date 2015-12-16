var settings = require('../core/settings');
var THREE = require('three');

var undef;

var glslify = require('glslify');
var shaderParse = require('../helpers/shaderParse');
var math = require('../utils/math');

var mesh = exports.mesh = undef;
exports.init = init;
exports.update = update;

var _stars;

function init() {
    var geometry = new THREE.SphereGeometry( 1200, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: settings.envMap,
        fog: false
    });

    mesh = exports.mesh = new THREE.Mesh( geometry, material );

    _initStars();

}

function _initStars() {

    var amount = settings.starAmount;
    var starFrom = settings.starFrom;
    var starTo = settings.starTo;

    var positions = new Float32Array(amount * 3);
    var randoms = new Float32Array(amount * 2);
    var i2, i3, r, phi, theta;
    for(var i = 0; i < amount; i++ ) {
        i2 = i * 2;
        i3 = i * 3;
        r = math.mix( starFrom, starTo,  Math.pow(Math.random(), 0.4));
        phi = (Math.random() - 0.5);
        phi = Math.pow(Math.abs(phi * 2), 1.7) * (phi < 0 ? -1 : 1) * Math.PI;
        theta = Math.random() * Math.PI * 2;
        positions[i3 + 0] = r * Math.cos(theta) * Math.cos(phi);
        positions[i3 + 1] = r * Math.sin(phi);
        positions[i3 + 2] = r * Math.sin(theta) * Math.cos(phi);
        randoms[i2 + 0] = Math.random();
        randoms[i2 + 1] = Math.random();
    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ));
    geometry.addAttribute( 'random', new THREE.BufferAttribute( randoms, 2 ));

    var material = new THREE.ShaderMaterial( {
        uniforms: {
            time: { type: 'f', value: 0 }
        },
        vertexShader: shaderParse(glslify('../glsl/stars.vert')),
        fragmentShader: shaderParse(glslify('../glsl/stars.frag')),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: true,
        depthWrite: false
    });

    _stars = new THREE.Points( geometry, material );
    mesh.add(_stars);
}

function update(dt) {
    _stars.material.uniforms.time.value += dt * 0.001;
}
