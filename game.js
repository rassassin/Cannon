class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0, 0, 0);
    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(new THREE.Vector3(0, 1, 0));

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const buttons = document.getElementById("gui").childNodes;
    buttons[1].onclick = () => {
      game.addBody();
    };
    buttons[3].onclick = () => {
      game.addBody(false);
    };

    this.initPhysics();
  }
  initPhysics() {
    const world = new CANNON.World();
    this.world = world;
    this.fixedTimeStep = 1.0 / 60.0;
    this.damping = 0.01;

    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, -10, 0);
    this.debugRenderer = new THREE.CannonDebugRenderer(this.scene, this.world);

    const groundShape = new CANNON.Plane();
    const groundMaterial = new CANNON.Material();
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    groundBody.addShape(groundShape);
    world.add(groundBody);

    this.shapes = {};
    this.shapes.sphere = new CANNON.Sphere(0.5);
    this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.shapes.material = new THREE.MeshNormalMaterial();

    this.groundMaterial = groundMaterial;

    this.animate();
  }
  animate() {
    const game = this;
    requestAnimationFrame(() => {
      game.animate();
    });

    this.world.step(this.fixedTimeStep);
    this.debugRenderer.update();

    this.renderer.render(this.scene, this.camera);
  }
  addBody(sphere = true) {
    const material = new CANNON.Material();
    const body = new CANNON.Body({ mass: 5, material: material });
    if (sphere) {
      body.addShape(this.shapes.sphere);
    } else {
      body.addShape(this.shapes.box);
    }

    const x = Math.random() * 0.3 + 1;
    body.position.set(sphere ? -x : x, 5, 0);
    body.linearDamping = this.damping;
    this.world.add(body);

    const material_ground = new CANNON.ContactMaterial(
      this.groundMaterial,
      material,
      { friction: 0.0, restitution: sphere ? 0.9 : 0.3 }
    );

    this.world.addContactMaterial(material_ground);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  window.game = game;
});
