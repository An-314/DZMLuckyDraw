// 取出用户列表
var users = JSON.parse(localStorage.getItem('users')) || []

// 没有用户，填充点测试数据
if (!users.length) {
	users = [{
		id: 0,
		name: 'Test',
		department: 'Dep',
		number: 0
	}]
}

// 中奖栏是否支持滚动条拖拽(推荐鼠标用户打开，触摸板用户关闭)
var isScrollbarVisible = true
// 内定用户在剩余用户充足情况允许进入随机池
var isTagUsersAllowRandom = false
// 当剩余用户 <= 内定用户时，只能抽取内定用户了，可以指定优先抽中顺序
// 标签值：就是导入用户名单中那个【第几轮中奖(只能数字，不设置随机)】的值，例如：例如：“张三-副总-3” 里面的 “3”
// 取值范围：0、随机抽取中奖 1、标签值小的优先中奖 2、标签值最大的优先中奖
var tagUsersRandomWinningOrderType = 2
// 用户展示效果的用户列表，不足 maxCount 会自动二次抽取补全
// 这里设置的 maxCount，只是单纯为了动画效果，抽奖还是会按实际名单抽取，不会使用展示效果名单抽取
// 根据自身电脑性能增加效果，使用 mac m2 设置 700+ 有点卡
var maxCount = 300
var perspective = maxCount * 11.5
var userPros = []
var index = 0
if (users.length > maxCount) {
	userPros = users.slice(0, maxCount)
} else {
	userPros = [...users]
	while (userPros.length < maxCount) {
		userPros.push(users[index % users.length])
		index++
	}
}

// 属性
var camera, scene, renderer, cssScene, cssRenderer, objects = [];
var cssObjects = []; // 用于CSS3D的卡片对象
var clock = new THREE.Clock(); // 时钟对象，用于计算时间间隔
var isRotating = false

// 名片3D坐标
var objects = []
var targets = { sphere: [], grid: [] }

// 动画类型
var animateTypes = ['sphere', 'grid', 'none']
var animateType = undefined
var animateDuration = 3000

init()
animate()

// 初始化
function init() {
	// 摄像机
	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
	camera.position.z = 3000;

	// 场景
	scene = new THREE.Scene();
	cssScene = new THREE.Scene();

	// 准备3D模型的材质和几何体
	var geometry = new THREE.BoxGeometry(130, 220, 5);  // 盒子模型，代表扑克牌
	// var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // 绿色材质

	// 加载贴图
	var textureLoader = new THREE.TextureLoader();
	textureLoader.load('../fig/back.png', function (texture) {
		var material = new THREE.MeshBasicMaterial({ map: texture });  // 使用贴图创建材质

		var vector = new THREE.Vector3();

		console.log(userPros);

		for (var i = 0, l = userPros.length; i < l; i++) {
			// 创建Mesh对象
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = Math.random() * 4000 - 2000;
			mesh.position.y = Math.random() * 4000 - 2000;
			mesh.position.z = Math.random() * 4000 - 2000;
			scene.add(mesh);
			objects.push(mesh);

			// sphere
			var phi = i * 0.175 + Math.PI;
			var object = new THREE.Object3D();
			object.position.x = 900 * Math.sin(phi);
			object.position.y = - (i * 8) + 900;
			object.position.z = 900 * Math.cos(phi);
			vector.x = object.position.x * 2;
			vector.y = object.position.y;
			vector.z = object.position.z * 2;
			object.lookAt(vector);
			targets.sphere.push(object);
		}
		// grid
		for (var i = 0; i < objects.length; i++) {
			var object = new THREE.Object3D();
			object.position.x = ((i % 10) * 400) - 1800;
			object.position.y = (- (Math.floor(i / 10) % 5) * 400) + 800;
			object.position.z = (Math.floor(i / 25)) * 1000 - perspective;
			targets.grid.push(object);
		}
	});

	// WebGLRenderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.position = 'absolute';
	document.getElementById('container').appendChild(renderer.domElement);

	// CSS3DRenderer
	cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize(window.innerWidth, window.innerHeight);
	cssRenderer.domElement.style.position = 'absolute';
	cssRenderer.domElement.style.top = 0;
	document.getElementById('container').appendChild(cssRenderer.domElement);

	// 开始
	onlyAnimate();
	// 监听浏览器尺寸
	window.addEventListener('resize', onWindowResize, false);
}

// // 创建CSS3D卡片对象
// function createCSS3DCards() {
// 	var element, front, back;

// 	for (var i = 0, l = userPros.length; i < l; i++) {
// 		element = document.createElement('div');
// 		element.className = 'card';

// 		front = document.createElement('div');
// 		front.className = 'card-front';
// 		front.textContent = 'Back Side'; // 背面内容
// 		element.appendChild(front);

// 		back = document.createElement('div');
// 		back.className = 'card-back';
// 		back.innerHTML = `<div>${userPros[i].name}</div><div>${userPros[i].department}</div>`; // 正面内容
// 		element.appendChild(back);

// 		var objectCSS = new THREE.CSS3DObject(element);
// 		objectCSS.position.x = (i - userPros.length / 2) * 160;
// 		objectCSS.position.y = 0;
// 		objectCSS.position.z = 0;
// 		cssScene.add(objectCSS);
// 		cssObjects.push(objectCSS);
// 	}
// }

// 动画函数
function animate() {
	requestAnimationFrame(animate);
	TWEEN.update();
	renderer.render(scene, camera);
	cssRenderer.render(cssScene, camera);
}

// 卡片翻转函数
function flipCards() {
	for (var i = 0; i < cssObjects.length; i++) {
		new TWEEN.Tween(cssObjects[i].rotation)
			.to({ y: Math.PI }, 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.start();
	}
}

window.flipCards = flipCards;  // 暴露函数以便外部调用


// 刷新坐标
function reloadGridPosition() {
	console.log('reloadGridPosition')
	console.log(targets.grid)
	for (var i = 0; i < targets.grid.length; i++) {
		var scale = Number((Math.random() + 0.2).toFixed(1))
		var newPerspective = Number((perspective * scale).toFixed(0))
		var object = targets.grid[i]
		// object.position.x = ((i % 10) * 400) - 1800
		// object.position.y = (- (Math.floor(i / 10) % 5) * 400) + 800
		object.position.z = (Math.floor(i / 25)) * 1000 - newPerspective
	}
	console.log(targets.grid)
}

// 刷新3D定位
function transform(targets, duration) {
	TWEEN.removeAll()
	for (var i = 0; i < objects.length; i++) {
		var object = objects[i]
		var target = targets[i]
		new TWEEN.Tween(object.position)
			.to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start()
		new TWEEN.Tween(object.rotation)
			.to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start()
	}
	new TWEEN.Tween(this)
		.to({}, duration * 2)
		.onUpdate(render)
		.start()
}

// 窗口尺寸变化
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	cssRenderer.setSize(window.innerWidth, window.innerHeight);
	render()
}

// 动画
function animate() {
	requestAnimationFrame(animate);
	if (isRotating) {
		update();
	}
	TWEEN.update();
	renderer.render(scene, camera); // 确保添加渲染调用
}

// 重新绘制
function render() {
	renderer.render(scene, camera)
}

// 开始动画
function onlyAnimate() {
	setAnimate('grid')
	setTimeout(() => {
		setAnimate('sphere');
	}, 2000)

}

// 停止动画
function stopAnimate(type) {
	if (type === 'grid') {
		reloadGridPosition()
	}
	// 设置展示
	setAnimate(type)
}

// 动画展示模版
function setAnimate(type) {
	// 记录
	animateType = type
	// 根据类型展示
	if (type === 'sphere') {
		// 球形
		transform(targets.sphere, animateDuration)
	} else if (type === 'grid') {
		// 有序的悬浮
		transform(targets.grid, animateDuration)
	} else {
		// 无序的悬浮
		transform(objects, animateDuration)
	}
}

// 旋转
function update() {
	var elapsed = clock.getElapsedTime();
	for (var i = 0; i < objects.length; i++) {
		var object = objects[i];
		var angle = i * 0.175 + Math.PI + elapsed * 1.2;
		var targetX = 900 * Math.sin(angle);
		var targetZ = 900 * Math.cos(angle);
		// 创建TWEEN动画
		new TWEEN.Tween(object.position)
			.to({ x: targetX, z: targetZ }, 100)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
	}
	// 更新TWEEN
	TWEEN.update();
}


function generateResult(users) {
	var textureLoader = new THREE.TextureLoader();
	var backMaterial, frontMaterials = [];

	// 加载背面贴图
	textureLoader.load('../fig/back.png', function (backTexture) {
		backMaterial = new THREE.MeshBasicMaterial({ map: backTexture });
		// 加载正面贴图
		textureLoader.load('../fig/front.png', function (frontTexture) {
			users.forEach((user, index) => {
				var canvas = document.createElement('canvas');
				canvas.width = 512;
				canvas.height = 512;
				var context = canvas.getContext('2d');
				// 绘制正面贴图
				context.drawImage(frontTexture.image, 0, 0);
				// 设置用户数据
				context.font = '30px Arial';
				context.fillStyle = 'white';
				context.fillText(user.name, 20, 470); // 显示用户名
				context.fillText(user.department, 20, 510); // 显示用户部门
				var userTexture = new THREE.CanvasTexture(canvas);
				var userMaterial = new THREE.MeshBasicMaterial({ map: userTexture });
				frontMaterials.push(userMaterial);
			});

			createCards();
		});
	});
	function createCards() {
		var geometry = new THREE.PlaneGeometry(300, 500); // 卡片大小
		for (var i = 0; i < users.length; i++) {
			// 创建正反两面的材质
			var materials = [
				backMaterial,
				frontMaterials[i]
			];
			// 使用正反两面的材质创建Mesh
			var mesh = new THREE.Mesh(geometry, materials);
			// 将卡片放置在屏幕中央
			mesh.position.set(0, 0, 0);
			// 将卡片添加到场景中
			scene.add(mesh);
			objects.push(mesh);
		}
	}
}



// function update() {
// 	var elapsed = clock.getElapsedTime();
// 	for (var i = 0; i < objects.length; i++) {
// 		var object = objects[i]
// 		var angle = i * 0.175 + Math.PI + elapsed;
// 		// object.rotation.y = angle;
// 		object.position.x = 900 * Math.sin(angle);
// 		object.position.z = 900 * Math.cos(angle);
// 	}
// }


// // 初始化
// function init() {

// 	// 摄像机
// 	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
// 	camera.position.z = 3000

// 	// 场景
// 	scene = new THREE.Scene()

// 	// sphere || none
// 	var vector = new THREE.Vector3()
// 	for (var i = 0, l = userPros.length; i < l; i++) {

// 		// 用户
// 		const user = userPros[i]

// 		// 名片
// 		var element = document.createElement('div')
// 		element.className = 'element'
// 		// 名片背景颜色（为了效果，给了个随机透明度）
// 		element.style.backgroundColor = `rgba(0, 127, 127, ${Math.random() * 0.5 + 0.25})`

// 		// var number = document.createElement( 'div' )
// 		// number.className = 'number'
// 		// number.textContent = user.id
// 		// element.appendChild( number )

// 		// 名称
// 		var symbol = document.createElement('div')
// 		symbol.className = 'symbol'
// 		symbol.textContent = user.name
// 		element.appendChild(symbol)

// 		// 描述
// 		var details = document.createElement('div')
// 		details.className = 'details'
// 		details.textContent = user.department
// 		element.appendChild(details)

// 		// none
// 		var object = new THREE.CSS3DObject(element)
// 		object.position.x = Math.random() * 4000 - 2000
// 		object.position.y = Math.random() * 4000 - 2000
// 		object.position.z = Math.random() * 4000 - 2000
// 		scene.add(object)
// 		objects.push(object)

// 		// sphere
// 		var phi = Math.acos(-1 + (2 * i) / l)
// 		var theta = Math.sqrt(l * Math.PI) * phi
// 		var object = new THREE.Object3D()
// 		object.position.x = 800 * Math.cos(theta) * Math.sin(phi)
// 		object.position.y = 800 * Math.sin(theta) * Math.sin(phi)
// 		object.position.z = 800 * Math.cos(phi)
// 		vector.copy(object.position).multiplyScalar(2)
// 		object.lookAt(vector)
// 		targets.sphere.push(object)
// 	}

// 	// grid
// 	for (var i = 0; i < objects.length; i++) {
// 		var object = new THREE.Object3D()
// 		object.position.x = ((i % 10) * 400) - 1800
// 		object.position.y = (- (Math.floor(i / 10) % 5) * 400) + 800
// 		object.position.z = (Math.floor(i / 25)) * 1000 - perspective
// 		targets.grid.push(object)
// 	}

// 	// 父容器
// 	renderer = new THREE.CSS3DRenderer()
// 	renderer.setSize(window.innerWidth, window.innerHeight)
// 	renderer.domElement.style.position = 'absolute'
// 	document.getElementById('container').appendChild(renderer.domElement)

// 	// 开始
// 	onlyAnimate()

// 	// 监听浏览器尺寸
// 	window.addEventListener('resize', onWindowResize, false)
// }
