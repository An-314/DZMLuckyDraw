# DZMLuckyDraw

HTML 5 网页端年会抽奖源码，只需要导入名单列表即可，可内定中奖人员！

支持模式：直接抽取、自定义奖项抽取

内定功能：支持

# 使用说明

    0、index.html: 主入口
    1、关闭窗口清空所有数据（重置），刷新网页不会清空用户列表，但是会重置抽奖记录，相当于刚导入名单的时候。
    2、支持 .xlsx、.xls、.csv 文件格式上传
    3、支持自定义奖项模式、默认抽奖模式
    4、已经中过奖的人不会重复中奖
    5、在上面支持的文件格式中每个单元格是一个用户
    6、每个单元格支持的用户格式，可以混合存在文件中：
    （没有设置指定第几轮中奖的会完全随机抽，所以不需要内定的时候，不要用设置第几轮中奖的名单方式就行了）

      名字
      名字-部门(或职位, 或描述)
      名字-第几轮中奖(只能数字，不设置随机)
      名字-部门(或职位, 或描述)
      名字-部门(或职位, 或描述)-第几轮中奖(只能数字，不设置随机)

      注意：第几轮中奖(只能数字，不设置随机) 这一项在自定义奖项模式、默认抽奖模式中用法一样，作用不同。
      默认抽奖模式：指的是第几轮中奖
      自定义奖项模式：这个模式下就不会按轮来进行中奖，对应的是自定义奖项时填写的标签，如果一个自定义奖项的标签设置为1，然后选择这个奖项抽奖时，用户列表里面有按上面模式设置了1的用户则会中奖，这个标签是可选项，不设置就完全随机，如果设置就会去名单列表中找到匹配的用户。

      例如：
      
      张三
      李四-1
      王五-财务部
      赵六-副总-2

# 使用效果

![效果](test.gif)

# 自定义奖项模式配置

![效果](custom.png)

  
