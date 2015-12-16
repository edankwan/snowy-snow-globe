var settings = require('../core/settings');
var THREE = require('three');

var globe = require('./globe');

var undef;

var mesh = exports.mesh = undef;
exports.init = init;
exports.update = update;

var _geometry;
var _material;

function init() {
    var bumpMap = exports.bumpMap = (new THREE.TextureLoader()).load('images/bump.jpg');
    bumpMap.anisotropy = 4;
    // bumpMap.repeat.set( 10.0, 10.0 );
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.format = THREE.RGBFormat;

    var alphaMap = exports.alphaMap = (new THREE.TextureLoader()).load('images/alpha.jpg');
    alphaMap.wrapS = alphaMap.wrapT = THREE.RepeatWrapping;
    alphaMap.format = THREE.RGBFormat;

    _geometry = new THREE.CircleGeometry( 300, 32 );
    // _geometry = new THREE.PlaneGeometry( 1200, 1200, 10, 10 );
    _material = new THREE.MeshStandardMaterial( {
        color: new THREE.Color(0x394d80),
        roughness : 0.7,
        metalness : 0.5,
        opacity: 1,
        bumpMap: bumpMap,
        bumpScale: 1,
        alphaMap: alphaMap,
        transparent: true,
        fog: false
    });

    mesh = exports.mesh = new THREE.Mesh( _geometry, _material );
    mesh.position.y = (- settings.volumeHeight) / 2;
    mesh.rotation.x = -1.57;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

}

function update() {

}
