# 清华大学未央书院第二届学生节——“未来式”抽奖程序

![未来式](fig/back.png)

使用 `html` + `js` 实现的抽奖程序，支持导入 `svc` 文件，自动抽取中奖者。

依赖 `Three.js` 和 `Vue.js` 实现。

可以用 `electron` 打包成 `exe` 文件
```bash
npm install
npm run build
```

## 使用

- 打开 index.html 导入 svc 文件，根据提示操作即可。
- 使用完毕后，可以下载查看抽奖结果。


## 使用效果

<video controls>
  <source src="demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

![demo gif](demo.gif)

## 特别鸣谢

Fork 自 [DZMLuckyDraw](https://github.com/dengzemiao/DZMLuckyDraw)。在原有的基础上做了很多修改：
- 初始化两个 `THREE.Scene()` ，一个用于显示抽奖结果，一个用于显示抽奖效果。这样做主要是为了渲染贴图、并且有更加炫酷的效果。
- 初始化两个renderer，分别处理WebGL和CSS3D。
- 重新更改了抽奖动画，使其更符合学生节的主题。
- 更改了抽奖结果的显示方式，使其不再廉价。
- 增加功能：**逐位揭示**
  - 在设置“自定义类型”的时候，将“标签”设为-1，即可开启逐位揭示。
  - 选择抽奖人数为5的倍数，点击“继续揭示”，即可逐位揭示中奖者。~~让抽奖变得更刺激吧！~~
- 新增功能：**特等奖抽取**
  - 在设置“自定义类型”的时候，将“标签”设为0，即可开启抽四位随机数。
  - 选择抽奖人数为1。
- 细节优化：在设置“自定义类型”的时候，将“标签”设为大于0的数，则默认抽取该标签的人数。