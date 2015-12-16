var settings = require('../core/settings');
var THREE = require('three');

var particles = require('./particles');
var math = require('../utils/math');
var ease = require('../utils/ease');

var undef;

var mesh = exports.mesh = undef;
exports.init = init;
exports.update = update;

var HEIGHT = settings.HEIGHT = 20;
var GLASS_RADIUS = settings.volumeWidth / 2;
var BASE_RADIUS = 68;
var BASE_INNER_RADIUS = 44;
var TREE_SCALE = 12;

var _tree;
var _time = 0;
var _easePop = 0;

function init() {

    mesh = exports.mesh = new THREE.Object3D();
    particles.init();
    mesh.add(particles.mesh);
    mesh.position.y = 0.5;

    _initGlass();
    _initBase();
    _initTree();
}

function _initGlass() {
    var geometry = new THREE.IcosahedronGeometry(GLASS_RADIUS, 3);
    var glass = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xFFFFFF),
        roughness : 0.5,
        metalness : 0.9,
        side: THREE.BackSide,
        envMap: settings.envMap,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.2
    }));

    var glassFront = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xFFFFFF),
        roughness : 0.3,
        metalness : 0.3,
        transparent: true,
        // blending: THREE.AdditiveBlending,
        envMap: settings.envMap,
        opacity: 0.1
    }));

    glass.add(glassFront);

    mesh.add(glass);
}

function _initBase() {
    var geometry = new THREE.CylinderGeometry( BASE_RADIUS, BASE_RADIUS, HEIGHT, 32, 20, false, 0, Math.PI * 2 );
    var vertices = geometry.vertices;
    var vertex, ratio;
    var innerRadiusRatio = BASE_INNER_RADIUS / BASE_RADIUS;
    for( var i = 0, len = vertices.length; i < len; ++i ) {
        vertex = vertices[i];
        ratio = math.unMix( - HEIGHT / 2 + 4, HEIGHT / 2, vertex.y);
        ratio = math.mix(math.mix(innerRadiusRatio, 1, 1 - (Math.sin(ratio * 7) * 0.3 + ratio * 0.7)), innerRadiusRatio, ratio);
        vertex.x *= ratio;
        vertex.z *= ratio;
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var bumpMap = settings.envMap = (new THREE.TextureLoader()).load('images/bump.jpg');
    bumpMap.anisotropy = 0;
    bumpMap.repeat.set( 2, 2);
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.format = THREE.RGBFormat;

    var material = new THREE.MeshStandardMaterial( {
        color: new THREE.Color(0xff0606),
        roughness : 0.9,
        metalness : 0.4,
        envMap: settings.envMap,
        bumpMap: bumpMap,
        bumpScale: 1
    });

    var base = new THREE.Mesh( geometry, material );
    base.position.y = (HEIGHT - settings.volumeHeight) / 2;
    base.castShadow = true;
    base.receiveShadow = true;

    mesh.add(base);
}

function _initTree() {
    var treeData = (new THREE.JSONLoader()).parse(settings.treeData);
    var materials = treeData.materials;
    var material;
    for(var i = 0, len = materials.length; i < len; i++) {
        material = new THREE.MeshStandardMaterial({
            color: materials[i].color,
            roughness : 0.7,
            metalness : 0.1,
            envMap: settings.envMap,
            envMapIntensity: 1.0
        });
        materials[i] = material;
    }
    _tree = new THREE.Mesh(treeData.geometry, new THREE.MeshFaceMaterial(materials));
    _tree.scale.set(TREE_SCALE, TREE_SCALE, TREE_SCALE);
    _tree.castShadow = true;
    _tree.receiveShadow = true;
    mesh.add(_tree);
}

function update(dt) {
    _time += dt * 0.002;

    if(settings.pop) {
        _easePop = 1;
    } else {
        _easePop += (0 - _easePop) * 0.2;
    }

    mesh.position.y = (1 - ease.easeInBack(1 - _easePop)) * 5;

    settings.treeOffset = 3 * Math.sin(_time);

    _tree.rotation.y += dt * 0.001;
    _tree.position.set(0, - TREE_SCALE * 1.2 + settings.treeOffset, 0);
    particles.update(dt);
}
