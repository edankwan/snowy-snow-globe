var settings = require('../core/settings');
var THREE = require('three');

var undef;

var mesh = exports.mesh = undef;
var spot = exports.spot = undef;
exports.init = init;
exports.update = update;

var _moveTime = 0;

function init() {

    mesh = exports.mesh = new THREE.Object3D();

    var ambient = new THREE.AmbientLight( 0xa5b3f6 );
    // var ambient = new THREE.AmbientLight( 0xcccccc );
    mesh.add( ambient );

    spot = exports.spot = new THREE.SpotLight( 0x4e95de, 1, 0, Math.PI / 2, 1 );
    spot.position.x = 300;
    spot.position.y = 200;
    spot.position.z = 400;
    spot.target.position.set( 0, 0, 0 );

    spot.castShadow = true;

    spot.shadowCameraNear = 100;
    spot.shadowCameraFar = 2500;
    spot.shadowCameraFov = 120;

    spot.shadowBias = 0.0003;
    spot.shadowDarkness = 0.7;

    spot.shadowMapWidth = 1024;
    spot.shadowMapHeight = 2048;

    mesh.add( spot );

}

function update(dt, camera) {
    _moveTime += 0;//dt * settings.lightSpeed;
    var angle = _moveTime * 0.0005 - 0.2;
    // mesh.position.x = Math.cos(angle) * 400;
    // mesh.position.z = Math.sin(angle) * 400;

}
