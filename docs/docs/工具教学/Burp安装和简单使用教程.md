# 杨CC有话说

> Burp破解版安装和简单使用教程，本教程用于Windows。MAC、Linux请自行查找对应教程。
>
> 如果需要深入使用,请等待`杨CC`更新~



# 下载安装包。

- 打开[ycc资源站](https://ycc77.cn)
- 右上角搜索框，搜索：Burp Suite-25.9破解版
- 如图：
- ![](https://pic1.imgdb.cn/item/694b5568c3594c4bdf9d1fd0.png)
- 随后下载对应的apk，如果是Windows，则下载Windows，如果是mac，就下载mac版本。
- ![](https://pic1.imgdb.cn/item/694b55a2b65a54c49ff513e9.png)
- `我们这里以Windows为例`

# 解压

- 我们打开文件下载位置以后，
- 点击：查看 -》 勾选上显示扩展名 ，如下图：
- ![](https://pic1.imgdb.cn/item/694b562cc3594c4bdf9d261d.png)
- 随后我们会看到：下载的文件是下面的名称：
- ![](https://pic1.imgdb.cn/item/694b5660c3594c4bdf9d27ba.png)
- 右键 》 重命名 》删除`.apk`
- ![](https://pic1.imgdb.cn/item/694b568bc3594c4bdf9d2909.png)
- 然后解压到一个自己喜欢的地方即可。
- 解压后如图：
- ![](https://pic1.imgdb.cn/item/694b56e6b65a54c49ff51b7a.png)
- `到此,解压完成`



# 安装环境(必须,不然会报错)

- 打开java jdk 21 目录.
- 双击打开里面唯一的一个exe文件.
- ![](https://pic1.imgdb.cn/item/694b57a3c3594c4bdf9d2f75.png)
- ![](https://pic1.imgdb.cn/item/694b57c4c3594c4bdf9d3016.png)
- `注意,目录的话,可以改,可以不改,如果你是小白,则不要更改.`
- ![](https://pic1.imgdb.cn/item/694b57eac3594c4bdf9d30d5.png)
- ![](https://pic1.imgdb.cn/item/694b57fac3594c4bdf9d311f.png)
- `打开终端(cmd\powershell都可以)`

```shell
# 输入
java --version

# 输出如下,则为正确
java 21.0.2 2024-01-16 LTS
Java(TM) SE Runtime Environment (build 21.0.2+13-LTS-58)
Java HotSpot(TM) 64-Bit Server VM (build 21.0.2+13-LTS-58, mixed mode, sharing)

```

- 如图
- ![](https://pic1.imgdb.cn/item/694b5863c3594c4bdf9d32cd.png)
- 到这里,环境安装成功

# 安装

- 找到解压目录,地址栏输入:cmd然后回车.
- ![](https://pic1.imgdb.cn/item/694b5922c3594c4bdf9d37b4.png)
- 然后会出现下图:
- ![](https://pic1.imgdb.cn/item/694b5943c3594c4bdf9d38bb.png)
- 可能略有偏差,不过没关系,按照下面步骤一点一点来即可.

```shell
java --version # 检查java环境 如果没有输出,或者报错,请回到上方安装环境的步骤.
java -jar BurpSuiteLoader1.jar # 运行破解器
# 运行破解器后,会出现下图
```

![](https://pic1.imgdb.cn/item/694b5a01c3594c4bdf9d3b70.png)

- 点击 `run`
- 会出现一个新的界面.具体操作看下图
- ![](https://pic1.imgdb.cn/item/694b5a68c3594c4bdf9d3bd1.png)
- ![](https://pic1.imgdb.cn/item/694b5a8ac3594c4bdf9d3c00.png)
- ![](https://pic1.imgdb.cn/item/694b5ac0c3594c4bdf9d3dac.png)
- ![](https://pic1.imgdb.cn/item/694b5ae7c3594c4bdf9d3faa.png)
- ![](https://pic1.imgdb.cn/item/694b5af9c3594c4bdf9d40a5.png)
- ![](https://pic1.imgdb.cn/item/694b5b03c3594c4bdf9d411d.png)
- 再然后,就激活成功,进来了.
- ![](https://pic1.imgdb.cn/item/694b5b13c3594c4bdf9d4184.png)

# 汉化

- 先关闭打开的所有的终端以及软件.
- 回到解压的目录中.
- 找到:`BurpSuiteLoader.vbs`
- 然后双击运行.就会出现软件界面
- ![](https://pic1.imgdb.cn/item/694b5b8cc3594c4bdf9d41e7.png)
- ![](https://pic1.imgdb.cn/item/694b5b9cc3594c4bdf9d4208.png)
- 启动Burp
- 就进入了咱们的软件了.
- ![](https://pic1.imgdb.cn/item/694b5bbbc3594c4bdf9d4234.png)

# 创建桌面快捷方式.

- 再次回到解压的目录.
- 找到:`创建桌面快捷方式.bat`

- 双击运行,即可
- ![](https://pic1.imgdb.cn/item/694b5bf7c3594c4bdf9d42df.png)

- 随后,你就可以正常的从桌面启动Burp,愉快的渗透了.

# Burp 基础使用教学

- 进入软件后,是这样的一个界面.
- ![](https://pic1.imgdb.cn/item/694b5c68c3594c4bdf9d49be.png)

## 抓包

- 界面中的代理,算是burp的基础玩法了,如图
- ![](https://pic1.imgdb.cn/item/694b5ce5c3594c4bdf9d4dfc.png)
- 打开内置浏览器
- ![](https://pic1.imgdb.cn/item/694b5d04c3594c4bdf9d4ef5.png)
- 开启抓包
- ![](https://pic1.imgdb.cn/item/694b5d26c3594c4bdf9d500d.png)
- 访问百度,尝试抓包
- ![](https://pic1.imgdb.cn/item/694b5d4fc3594c4bdf9d5164.png)
- 成功抓包.

## 查看历史经过的包.

- 代理 -> HTTP历史记录
- ![](https://pic1.imgdb.cn/item/694b5d83c3594c4bdf9d5333.png)
- 可以看到以往抓的包.



## 重放器-常用

- ![](https://pic1.imgdb.cn/item/694b5dc8b65a54c49ff560ab.png)
- 进入重放器查看具体数据
- ![](https://pic1.imgdb.cn/item/694b5df1b65a54c49ff56122.png)
- 随后即可调整参数,重新发送对应包



# 结束语

- **CTRl+D** 将本网站:ycc77.cn添加到书签栏哦~

- QQ交流群:660264846(满)
- QQ交流群2:721170435
- B站: 疯狂的杨CC
- 抖音: 疯狂的杨CC
- 快手: 疯狂的杨CC
- 公众号:SGY安全
- 91: 疯狂的杨CC
- p站: 疯狂的杨CC



