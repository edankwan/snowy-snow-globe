var settings = require('../core/settings');
var THREE = require('three');
var shaderParse = require('../helpers/shaderParse');
var glslify = require('glslify');
var simulator = require('./simulator');

var undef;

var mesh = exports.mesh = undef;
exports.init = init;
exports.update = update;

var _geometry;
var _depthMaterial;

var TEXTURE_WIDTH = settings.textureWidth;
var TEXTURE_HEIGHT = settings.textureHeight;
var AMOUNT = settings.textureWidth * settings.textureHeight;

function init() {

    var position = new Float32Array(AMOUNT * 3);
    var i3;
    for(var i = 0; i < AMOUNT; i++ ) {
        i3 = i * 3;
        position[ i3 + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
        position[ i3 + 1 ] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
        position[ i3 + 2 ] = Math.random();
    }

    _geometry = new THREE.BufferGeometry();
    _geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));

    var material = new THREE.ShaderMaterial( {
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.shadowmap,
            {
                texturePosition: { type: 't', value: undef }
            }
        ]),
        vertexShader: shaderParse(glslify('../glsl/particles.vert')),
        fragmentShader: shaderParse(glslify('../glsl/particles.frag')),
        // blending: THREE.NoBlending,
        blending: THREE.NormalBlending,
        depthTest: true,
        depthWrite: true
    });

    mesh = exports.mesh = new THREE.Points(_geometry, material);
    mesh.position.set(
        -settings.volumeWidth / 2,
        -settings.volumeHeight / 2,
        -settings.volumeDepth / 2
    );

    mesh.customDepthMaterial = _depthMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            texturePosition: { type: 't', value: undef }
        },
        vertexShader: shaderParse(glslify('../glsl/particlesDepth.vert')),
        fragmentShader: shaderParse(glslify('../glsl/particlesDepth.frag')),
        blending: THREE.NoBlending,
        depthTest: true,
        depthWrite: true
    });
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

}

function update(dt) {
    mesh.material.uniforms.texturePosition.value = simulator.positionRenderTarget;
    _depthMaterial.uniforms.texturePosition.value = simulator.positionRenderTarget;

}
