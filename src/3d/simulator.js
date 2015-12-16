var settings = require('../core/settings');
var THREE = require('three');

var undef;

var volume = require('./volume');
var glslify = require('glslify');
var shaderParse = require('../helpers/shaderParse');

var _copyShader;
var velocityShader = exports.velocityShader = undef;
var _positionShader;
var _velocityRenderTarget;
var _velocityRenderTarget2;
var _positionRenderTarget;
var _positionRenderTarget2;

var _renderer;
var _mesh;
var _scene;
var _camera;
var _treeOffset = 0;

var TEXTURE_WIDTH = exports.TEXTURE_WIDTH = settings.textureWidth;
var TEXTURE_HEIGHT = exports.TEXTURE_HEIGHT = settings.textureHeight;
var AMOUNT = exports.AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

exports.init = init;
exports.update = update;

exports.positionRenderTarget = undef;
exports.velocityRenderTarget = undef;

function init(renderer) {

    _renderer = renderer;

    var rawShaderPrefix = 'precision ' + renderer.capabilities.precision + ' float;\n';

    var gl = _renderer.getContext();
    if ( !gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) ) {
        alert( 'No support for vertex shader textures!' );
        return;
    }
    if ( !gl.getExtension( 'OES_texture_float' )) {
        alert( 'No OES_texture_float support for float textures!' );
        return;
    }
    if ( !gl.getExtension( 'OES_texture_float_linear' )) {
        alert( 'No OES_texture_float_linear support for float textures!' );
        return;
    }

    volume.init(renderer);

    _scene = new THREE.Scene();
    _camera = new THREE.Camera();
    _camera.position.z = 1;

    _copyShader = new THREE.RawShaderMaterial({
        uniforms: {
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
            texture: { type: 't', value: undef }
        },
        vertexShader: rawShaderPrefix + shaderParse(glslify('../glsl/fbo.vert')),
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/fboThrough.frag'))
    });

    velocityShader = exports.velocityShader = new THREE.RawShaderMaterial({
        uniforms: {
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
            volumeResolution: { type: 'v3', value: volume.resolution },
            sliceInfo: { type: 'v4', value: volume.sliceInfo },
            texturePosition: { type: 't', value: undef },
            textureVelocity: { type: 't', value: undef },
            textureVolume: { type: 't', value: volume.renderTarget },
            pop: { type: 'f', value: 0 },
            gravity: { type: 'f', value: 0 },
            // useBox: { type: 'f', value: 0 },
            // treeOffset: { type: 'f', value: 0 },
            time: { type: 'f', value: 0 }
        },
        vertexShader: rawShaderPrefix + shaderParse(glslify('../glsl/fbo.vert')),
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/velocity.frag')),
        blending: THREE.NoBlending,
        transparent: false,
        depthWrite: false,
        depthTest: false
    });

    _positionShader = new THREE.RawShaderMaterial({
        uniforms: {
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_WIDTH, TEXTURE_HEIGHT ) },
            volumeResolution: { type: 'v3', value: volume.resolution },
            sliceInfo: { type: 'v4', value: volume.sliceInfo },
            texturePosition: { type: 't', value: undef },
            textureVelocity: { type: 't', value: undef },
            textureVolume: { type: 't', value: volume.renderTarget },
            gravity: { type: 'f', value: 0 },
            // useBox: { type: 'f', value: 0 },
            // treeOffset: { type: 'f', value: 0 },
            time: { type: 'f', value: 0 }
        },
        vertexShader: rawShaderPrefix + shaderParse(glslify('../glsl/fbo.vert')),
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/position.frag')),
        blending: THREE.NoBlending,
        transparent: false,
        depthWrite: false,
        depthTest: false
    });

    _mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _copyShader );
    _scene.add( _mesh );

    _velocityRenderTarget = new THREE.WebGLRenderTarget( TEXTURE_WIDTH, TEXTURE_HEIGHT, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBFormat,
        type: THREE.FloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
    });
    _velocityRenderTarget2 = _velocityRenderTarget.clone();
    _copyTexture(_createVelocityTexture(), _velocityRenderTarget);
    _copyTexture(_velocityRenderTarget, _velocityRenderTarget2);

    _positionRenderTarget = new THREE.WebGLRenderTarget(TEXTURE_WIDTH, TEXTURE_HEIGHT, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
    });
    _positionRenderTarget2 = _positionRenderTarget.clone();
    _copyTexture(_createPositionTexture(), _positionRenderTarget);
    _copyTexture(_positionRenderTarget, _positionRenderTarget2);

}

function _updateVelocity(dt) {

    // swap
    var tmp = _velocityRenderTarget;
    _velocityRenderTarget = _velocityRenderTarget2;
    _velocityRenderTarget2 = tmp;

    _mesh.material = velocityShader;
    velocityShader.uniforms.textureVelocity.value = _velocityRenderTarget2;
    velocityShader.uniforms.texturePosition.value = _positionRenderTarget;
    velocityShader.uniforms.gravity.value = settings.pop ? (settings.gravity > 0 ? -5 : 5) : settings.gravity;
    velocityShader.uniforms.pop.value = +settings.pop;
    velocityShader.uniforms.time.value += dt * 0.001;
    // velocityShader.uniforms.useBox.value = +settings.useBox;
    // velocityShader.uniforms.treeOffset.value = settings.treeOffset;
    _renderer.render( _scene, _camera, _velocityRenderTarget );
}

function _updatePosition(dt) {

    // swap
    var tmp = _positionRenderTarget;
    _positionRenderTarget = _positionRenderTarget2;
    _positionRenderTarget2 = tmp;

    _mesh.material = _positionShader;
    _positionShader.uniforms.textureVelocity.value = _velocityRenderTarget;
    _positionShader.uniforms.texturePosition.value = _positionRenderTarget2;
    _positionShader.uniforms.gravity.value = settings.pop ? (settings.gravity > 0 ? -5 : 5) : settings.gravity;
    _positionShader.uniforms.time.value += dt * 0.001;
    // _positionShader.uniforms.useBox.value = +settings.useBox;
    // _positionShader.uniforms.treeOffset.value = settings.treeOffset;
    _renderer.render( _scene, _camera, _positionRenderTarget );
}

function _copyTexture(input, output) {
    _mesh.material = _copyShader;
    _copyShader.uniforms.texture.value = input;
    _renderer.render( _scene, _camera, output );
}

function _createVelocityTexture() {
    var velocities = new Float32Array( AMOUNT * 3 );
    var i3;
    for(var i = 0; i < AMOUNT; i++) {
        i3 = i * 3;
        velocities[i3 + 0] = (Math.random() - 0.5) * 5.0;
        velocities[i3 + 1] = -5.0 - Math.random() * 5;
        velocities[i3 + 2] = (Math.random() - 0.5) * 5.0;
    }
    var texture = new THREE.DataTexture( velocities, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
}


function _createPositionTexture() {
    var volumeWidth = settings.volumeWidth;
    var volumeHeight = settings.volumeHeight;
    var volumeDepth = settings.volumeDepth;
    var positions = new Float32Array( AMOUNT * 4 );
    var i4;
    var r, phi, theta;
    var d = Math.sqrt(volumeWidth * volumeWidth + volumeHeight * volumeHeight + volumeDepth * volumeDepth) / 2 - 15;
    for(var i = 0; i < AMOUNT; i++) {
        i4 = i * 4;
        r = (0.5 + Math.pow(Math.random(), 0.4) * 0.5) * d;
        phi = -Math.abs(Math.random() - 0.5) * Math.PI;
        theta = Math.random() * Math.PI * 2;
        positions[i4 + 0] = volumeWidth / 2 + r * Math.cos(theta) * Math.cos(phi);
        positions[i4 + 1] = volumeHeight / 2 + r * Math.sin(phi);
        positions[i4 + 2] = volumeDepth / 2 + r * Math.sin(theta) * Math.cos(phi);
        positions[i4 + 3] = 1;
    }
    var texture = new THREE.DataTexture( positions, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
}

function update(dt) {

    volume.update(dt);

    var autoClearColor = _renderer.autoClearColor;
    var clearColor = _renderer.getClearColor().getHex();
    var clearAlpha = _renderer.getClearAlpha();

    _renderer.autoClearColor = false;
    _updateVelocity(dt);
    _renderer.autoClearColor = true;
    _renderer.setClearColor(0, 0);
    _updatePosition(dt);

    _renderer.setClearColor(clearColor, clearAlpha);
    _renderer.autoClearColor = autoClearColor;
    exports.positionRenderTarget = _positionRenderTarget;
    exports.velocityRenderTarget = _velocityRenderTarget;
}


