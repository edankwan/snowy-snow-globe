var settings = require('../core/settings');
var THREE = require('three');

var undef;

var simulator = require('./simulator');
var glslify = require('glslify');
var shaderParse = require('../helpers/shaderParse');


var _viewport;
var _renderer;
var _mesh;
var _scene;
var _camera;

var TEXTURE_WIDTH = exports.TEXTURE_WIDTH = settings.volumeWidth *  settings.volumeSliceColumn;
var TEXTURE_HEIGHT = exports.TEXTURE_HEIGHT = settings.volumeHeight *  settings.volumeSliceRow;

exports.init = init;
exports.update = update;
exports.sliceInfo = undef;

var renderTarget = exports.renderTarget = undef;
var resolution = exports.resolution = undef;

function init(renderer) {

    _renderer = renderer;
    _viewport = new THREE.Vector4();

    _scene = new THREE.Scene();
    _camera = new THREE.OrthographicCamera(-TEXTURE_WIDTH/ 2, TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2, -TEXTURE_HEIGHT / 2, 1, 3);
    _camera.position.z = 2;

    exports.sliceInfo = new THREE.Vector4(
        settings.volumeSliceColumn * settings.volumeSliceRow,
        settings.volumeSliceColumn,
        1.0 / settings.volumeSliceColumn,
        1.0 / Math.floor((settings.volumeSliceColumn * settings.volumeSliceRow + settings.volumeSliceColumn - 1.0) / settings.volumeSliceColumn)
    );

    resolution = exports.resolution = new THREE.Vector3(settings.volumeWidth, settings.volumeHeight, settings.volumeDepth);

    renderTarget = exports.renderTarget = new THREE.WebGLRenderTarget(TEXTURE_WIDTH, TEXTURE_HEIGHT, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        type: THREE.FloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
    });

    var simulatorTextureWidth = settings.textureWidth;
    var simulatorTextureHeight = settings.textureHeight;
    var particleAmount = settings.textureWidth * settings.textureHeight;

    // it seems that we have to use position attribute even with RawShaderMaterial :/
    var positions = new Float32Array(particleAmount * 3);
    var i3;
    for(var i = 0; i < particleAmount; i++) {
        i3 = i * 3;
        positions[ i3 + 0 ] = (i % simulatorTextureWidth) / simulatorTextureWidth;
        positions[ i3 + 1 ] = ~~(i / simulatorTextureWidth) / simulatorTextureHeight;
        positions[ i3 + 2 ] = 0;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute( positions, 3 ));

    // var rawShaderPrefix = 'precision ' + renderer.capabilities.precision + ' float;\n';
    var material = new THREE.ShaderMaterial({
        uniforms: {
            texturePosition: { type: 't', value: undef },
            resolution: { type: 'v3', value: resolution },
            textureResolution: { type: 'v2', value: new THREE.Vector2(TEXTURE_WIDTH, TEXTURE_HEIGHT) },
            sliceInfo: { type: 'v4', value: exports.sliceInfo }
        },
        vertexShader: shaderParse(glslify('../glsl/volume.vert')),
        fragmentShader:  shaderParse(glslify('../glsl/volume.frag')),
        blending: THREE.AdditiveBlending,
        // blending: THREE.NoBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    _mesh = new THREE.Points( geometry, material );
    _mesh.frustumCulled = false;
    _scene.add( _mesh );

}

function update(dt) {
    _renderer.getViewport(_viewport);
    var autoClearColor = _renderer.autoClearColor;
    var clearColor = _renderer.getClearColor().getHex();
    var clearAlpha = _renderer.getClearAlpha();

    _renderer.setClearColor(0, 0);
    _renderer.clearTarget(renderTarget);
    _renderer.setViewport(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
    _mesh.material.uniforms.texturePosition.value = simulator.positionRenderTarget;
    _renderer.render( _scene, _camera, renderTarget );

    _renderer.setClearColor(clearColor, clearAlpha);
    _renderer.autoClearColor = autoClearColor;
    _renderer.setViewport(_viewport.x, _viewport.y, _viewport.z, _viewport.w);
}


