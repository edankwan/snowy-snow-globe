var quickLoader = require('quick-loader');
var dat = require('dat-gui');
var Stats = require('stats.js');
var css = require('dom-css');
var raf = require('raf');

var THREE = require('three');

var OrbitControls = require('./controls/OrbitControls');
var settings = require('./core/settings');

var globe = require('./3d/globe');
var vignette = require('./3d/vignette');
var lights = require('./3d/lights');
var bg = require('./3d/bg');
var simulator = require('./3d/simulator');

var math = require('./utils/math');
var ease = require('./utils/ease');
var mobile = require('./fallback/mobile');

var browser = require('./helpers/browser');

var undef;
var _gui;
var _stats;

var _width = 0;
var _height = 0;

var _control;
var _camera;
var _scene;
var _renderer;

var _time = 0;
var _ray = new THREE.Ray();

var _initAnimation = 0;

var _logo;
var _footerItems;

function init() {

    if(settings.useStats) {
        _stats = new Stats();
        css(_stats.domElement, {
            position : 'absolute',
            left : '0px',
            top : '0px',
            zIndex : 2048
        });

        document.body.appendChild( _stats.domElement );
    }

    settings.mouse = new THREE.Vector2(-9999,0);
    settings.mouse3d = _ray.origin;

    var envMap = settings.envMap = (new THREE.TextureLoader()).load('images/env.jpg');
    envMap.format = THREE.RGBFormat;
    envMap.wrapS = envMap.wrapT = THREE.MirroredRepeatWrapping;
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.magFilter = THREE.LinearFilter;
    envMap.minFilter = THREE.LinearMipMapLinearFilter;

    _renderer = new THREE.WebGLRenderer({
        // transparent : true,
        // premultipliedAlpha : false,
        antialias : true
    });
    _renderer.setClearColor(0x05091c);
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    _renderer.shadowMap.enabled = true;
    document.body.appendChild(_renderer.domElement);

    _scene = new THREE.Scene();
    _scene.fog = new THREE.FogExp2( 0x05091c, 0.001 );

    _camera = new THREE.PerspectiveCamera( 45, 1, 10, 3000);
    _camera.position.set(300, 120, -300).normalize().multiplyScalar(1000);
    settings.cameraPosition = _camera.position;

    _control = new OrbitControls( _camera, _renderer.domElement );
    _control.maxDistance = 1000;
    _control.minPolarAngle = 0.3;
    _control.maxPolarAngle = Math.PI / 2 - 0.1;
    _control.noPan = true;
    _control.update();

    lights.init();
    _scene.add(lights.mesh);

    bg.init();
    _scene.add(bg.mesh);

    simulator.init(_renderer);

    globe.init();
    _scene.add(globe.mesh);

    vignette.init();
    _scene.add(vignette.mesh);

    quickLoader.load('audio/bgm.' + browser.audioFormat, {
        onLoad: function(audio) {
            settings.bgm = audio;
            settings.bgm.loop = true;
            audio.play();
        }
    });

    quickLoader.load('audio/bell.' + browser.audioFormat, {
        onLoad: function(audio) {
            settings.bell = audio;
        }
    });

    var guiFuntions = {
        pop : function() {
            settings.pop = true;
            if(settings.bell) {
                settings.bell.currentTime = 0.01;
                settings.bell.play();
            }
        }
    };

    _gui = new dat.GUI();
    _gui.add(settings, 'gravity', -0.3, 0.3);
    _gui.add(guiFuntions, 'pop');


    _logo = document.querySelector('.logo');
    document.querySelector('.footer').style.display = 'block';
    _footerItems = document.querySelectorAll('.footer span');


    _gui.domElement.addEventListener('mousedown', _stopPropagation);
    _gui.domElement.addEventListener('touchstart', _stopPropagation);

    window.addEventListener('resize', _onResize);

    _time = Date.now();
    _onResize();
    _loop();

}

function _stopPropagation(evt) {
    evt.stopPropagation();
}

function _onResize() {
    _width = window.innerWidth;
    _height = window.innerHeight;

    vignette.resize(_width, _height);

    _camera.aspect = _width / _height;
    _camera.updateProjectionMatrix();
    _renderer.setSize(_width, _height);

}

function _loop() {
    var newTime = Date.now();
    raf(_loop);
    if(settings.useStats) _stats.begin();
    _render(newTime - _time);
    if(settings.useStats) _stats.end();
    _time = newTime;
}

function _render(dt) {

    var ratio;

    _initAnimation = Math.min(_initAnimation + dt * 0.00015, 1);

    vignette.alphaUniform.value = math.lerp(1, 0.5, math.unLerp(0, 0.5, _initAnimation));

    globe.mesh.rotation.y += (1 - _initAnimation) * 0.03;

    _control.maxDistance = _initAnimation === 1 ? 1000 : math.lerp(1000, 350, ease.easeOutCubic(_initAnimation));
    _control.update();

    simulator.update(dt);

    bg.update(dt);

    vignette.update(dt);

    globe.update(dt);

    _renderer.render(_scene, _camera);

    ratio = Math.min((1 - Math.abs(_initAnimation - 0.5) * 2) * 1.2, 1);
    var blur = (1 - ratio) * 10;
    _logo.style.display = ratio ? 'block' : 'none';
    if(ratio) {
        _logo.style.opacity = ratio;
        _logo.style.webkitFilter = 'blur(' + blur + 'px)';
        ratio = (0.8 + Math.pow(_initAnimation, 1.5) * 0.5);
        if(_width < 580) ratio *= 0.5;
        _logo.style.transform = 'scale3d(' + ratio + ',' + ratio + ',1)';
    }

    for(var i = 0, len = _footerItems.length; i < len; i++) {
        ratio = math.unLerp(0.5 + i * 0.01, 0.6 + i * 0.01, _initAnimation);
        _footerItems[i].style.transform = 'translate3d(0,' + ((1 - Math.pow(ratio, 3)) * 50) + 'px,0)';
    }

    settings.pop = false;
}

mobile.pass(function() {
    var loader = document.querySelector('.loader');
    loader.style.display = 'block';
    quickLoader.add('models/christmas_tree.json', {
        onLoad: function(data) {
            settings.treeData = data;
        }
    });
    quickLoader.add('images/bump.jpg');
    quickLoader.add('images/env.jpg');
    quickLoader.add('images/logo.png');
    quickLoader.start(function(percent) {
        if(percent === 1) {
            loader.style.display = 'none';
            init();
        }
    });
});
