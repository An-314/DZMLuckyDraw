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
var camera, scene, renderer, cssScene, cssRenderer;
var objects = [];
var cssObjects = []; // 用于CSS3D的卡片对象
var clock = new THREE.Clock(); // 时钟对象，用于计算时间间隔
var isRotating = false
var isCardRotating = false

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
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.position = 'absolute';
	document.getElementById('container').appendChild(renderer.domElement);
	// CSS3DRenderer
	cssRenderer = new THREE.CSS3DRenderer({ alpha: true });
	renderer.setClearColor(0x000000, 0);
	cssRenderer.setSize(window.innerWidth, window.innerHeight);
	cssRenderer.domElement.style.position = 'absolute';
	cssRenderer.domElement.style.top = 0;
	cssRenderer.domElement.style.zIndex = 1;
	cssRenderer.domElement.style.pointerEvents = 'none';
	document.getElementById('container').appendChild(cssRenderer.domElement);
	// 开始
	onlyAnimate();
	// 监听浏览器尺寸
	window.addEventListener('resize', onWindowResize, false);
}


function createCSS3DCards(users) {
	console.log('createCSS3DCards', users);
	// 清除旧的CSS3D对象
	clearCSSObjects();
	let element, front, back;
	const cardWidth = 250; // 卡片宽度
	const cardHeight = 450; // 卡片高度
	const rowSpacing = 500; // 行间距
	const colSpacing = 400; // 列间距
	const cardsPerRow = 5; // 每行固定5个卡片
	// 计算屏幕高度和卡片行数 	
	const numRows = Math.ceil(users.length / cardsPerRow);
	const offsetY = - rowSpacing / 2 * (numRows - 1);
	// 创建CSS3D对象
	for (let i = 0, l = users.length; i < l; i++) {
		element = document.createElement('div');
		element.className = 'card';
		element.style.width = `${cardWidth}px`;
		element.style.height = `${cardHeight}px`;
		element.style.position = 'relative';
		element.style.transformStyle = 'preserve-3d';
		element.style.transition = 'transform 0.5s';
		// 正面
		front = document.createElement('div');
		front.className = 'card-front';
		front.style.width = '100%';
		front.style.height = '100%';
		// front.style.backgroundColor = 'rgba(0, 127, 127, 0.5)';
		front.style.color = '#fff';
		front.style.display = 'flex';
		front.style.alignItems = 'center';
		front.style.justifyContent = 'center';
		front.style.position = 'absolute';
		front.style.backfaceVisibility = 'hidden';
		element.appendChild(front);
		// 背面
		back = document.createElement('div');
		back.className = 'card-back';
		back.style.width = '100%';
		back.style.height = '100%';
		// back.style.backgroundColor = 'rgba(127, 0, 127, 0.5)';
		back.style.color = '#fff';
		back.style.display = 'flex';
		back.style.alignItems = 'center';
		back.style.justifyContent = 'center';
		back.style.position = 'absolute';
		back.style.backfaceVisibility = 'hidden';
		back.style.transform = 'rotateY(180deg)';
		back.innerHTML = `<div>${users[i].name}</div><div>${users[i].department}</div>`; // 正面内容
		element.appendChild(back);
		// 计算卡片的位置
		const row = Math.floor(i / cardsPerRow);
		const col = i % cardsPerRow;
		const numCardsInCurrentRow = Math.min(cardsPerRow, users.length - row * cardsPerRow);
		const posX = col * colSpacing - (numCardsInCurrentRow - 1) * colSpacing / 2;
		const posY = row * rowSpacing + offsetY;
		// 创建CSS3D对象
		let objectCSS = new THREE.CSS3DObject(element);
		objectCSS.position.x = posX;
		objectCSS.position.y = posY;
		objectCSS.position.z = 0;
		cssScene.add(objectCSS);
		cssObjects.push(objectCSS);
	}
}


// 更新CSS3D卡片
function updateCSS3DCards(users) {
	console.log('updateCSS3DCards', users);
	// 假设 cssObjects 数组长度和 users 数组长度相同
	for (let i = 0; i < users.length; i++) {
		let objectCSS = cssObjects[i];
		let element = objectCSS.element;
		// 找到卡片的背面元素并更新内容
		let back = element.querySelector('.card-back');
		if (back) {
			back.innerHTML = `<div>${users[i].name}</div><div>${users[i].department}</div>`;
		} else {
			console.error('No back element found for card', i);
		}
	}
}


// 清空CSS3D对象
function clearCSSObjects() {
	console.log('clearCSSObjects', cssObjects);
	while (cssObjects.length) {
		cssScene.remove(cssObjects.pop());
	}
}


// 反转卡片
function flipCards() {
	console.log('flipCards', cssObjects);
	for (var i = 0; i < cssObjects.length; i++) {
		cssObjects[i].rotation.y = Math.PI;
	}
}


// 刷新坐标
function reloadGridPosition() {
	for (var i = 0; i < targets.grid.length; i++) {
		var scale = Number((Math.random() + 0.2).toFixed(1))
		var newPerspective = Number((perspective * scale).toFixed(0))
		var object = targets.grid[i]
		// object.position.x = ((i % 10) * 400) - 1800
		// object.position.y = (- (Math.floor(i / 10) % 5) * 400) + 800
		object.position.z = (Math.floor(i / 25)) * 1000 - newPerspective
	}
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
	renderer.render(scene, camera);
	cssRenderer.render(cssScene, camera);
}


// 重新绘制
function render() {
	renderer.render(scene, camera)
}
function cssRender() {
	cssRenderer.render(cssScene, camera)
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
	// 旋转
	for (var i = 0; i < objects.length; i++) {
		var object = objects[i];
		var angle = i * 0.175 + Math.PI + elapsed * 1.2;
		var targetX = 900 * Math.sin(angle);
		var targetZ = 900 * Math.cos(angle);
		// 创建TWEEN动画
		new TWEEN.Tween(object.position)
			.to({ x: targetX, z: targetZ }, 50)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
	}
	// 绕对称轴旋转
	for (var i = 0; i < cssObjects.length; i++) {
		var object = cssObjects[i];
		var angle = elapsed * 3;
		object.rotation.y = angle;
		new TWEEN.Tween(object.rotation)
			.to({ y: angle }, 50)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
	}
	// 更新TWEEN
	TWEEN.update();
}