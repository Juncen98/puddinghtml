已完成的事项：

1.完成了ecilpse的配置，本地和服务器上的Tomcat,mysql配置。

2.在本地配置了navicat和MobaXterm用于链接数据库和远程服务器（因为我的git配置的有些问题，暂时还不能直接用git push代码到自己的服务器，所以目前是用手动拖拽文件到服务器上）。

3.本地可以实现和数据库的链接，并从本地数据库里获取数据，实现了一个小的样例，从数据库中获取用户的用户名和密码。

![](C:\Users\xbd980904\Desktop\网页学习报告\数据库结果.PNG)

4.制作了一个简单的个人主页的欢迎页，目前本地和服务器端都可以访问，这里主要使用了bootstrap的框架，使网页显得比较美观，网页上的一些按钮可以实现跳转，注册可以对数据进行验证，但是验证内容暂时还不完善（如重名，密码限制）。网页上的按钮均可点击，但是跳转的界面还未设计完善。

![](C:\Users\xbd980904\Desktop\网页学习报告\欢迎.PNG)

5.制作了一个简单的个人主页，通过点击欢迎页左上方的小房子进行跳转。

![](C:\Users\xbd980904\Desktop\网页学习报告\个人主页.PNG)

PS：我的服务器是之前在vultr上租来自己翻墙用的，价格有些贵，建议还是租用阿里云的服务器比较划算，学生优惠只要9.9一个月。

未完成事项：

1.欢迎页的背景图片太大了，在本地会有一点卡顿，但是在服务器上就非常非常非常卡，几乎是一格一格的在加载，目前还未找到解决方法。

2.对于注册数据的验证，以及写入数据库，登录功能的实现。

3.完善个人主页，并且制作可以让访客留言的界面，实时获取访客留言。

一些问题：

1.那个背景图片实在太卡了，但是又不想舍弃，想知道有没有解决方法。

2.通过打war包到tomcat/webapps目录进行访问的时候出现问题，总是显示404。



附注：

1.所有的代码已经上传到我的github，欢迎大家交流学习，希望找到我以上问题解决方案的同学可以交流一下。

以下是我的Git仓库地址：

https://github.com/xiaobudingzjc/puddinghtml.git

git@github.com:xiaobudingzjc/puddinghtml.git

password:pudding

2.以下是我学习过程使用的一些教程和一些坑，供大家参考。

本地端：

（1）首先你需要安装一下JDK

<https://blog.csdn.net/u012934325/article/details/73441617/>

（2）然后你需要在本地安装一下eclipse和Tomcat

<https://www.cnblogs.com/greenteaone/p/7929571.html>

（3）接着你需要配置一下你的Tomcat

<https://www.cnblogs.com/puresoul/p/4234742.html>

这里！！我！！踩坑了！！

由于目前的Tomcat都是8.0及以上的版本（比如我的8.5）所以在这个教程告诉你修改comf/tomcat-users.xml时其实少了一部分解决方案如下：

<https://www.cnblogs.com/liliyang/p/9743948.html>

（4）接下来安装一下mysql，然后进行配置。这个教程非常详细，而且还提供了例子。

<https://blog.csdn.net/qq_41850194/article/details/79674078>

注意！！这里！！！虽然mysql8比mysql5快了一倍，但是！！很多服务器的硬件不支持mysql8！比如我的，所以建议大家还是安装5就可以了。

（5）最后你需要一点图形化界面（navicat和MobaXterm）和JDBC。

这个挺简单的自己安装一下就好啦。

Tips:注意路径的配置！一定要记得添加系统路径！

服务器端：（适用于centOS 7操作系统）

（1）安装一下Tomcat

<https://www.vultr.com/docs/how-to-install-apache-tomcat-8-on-centos-7>

  (2)安装一下mysql

<https://linuxize.com/post/install-mysql-on-centos-7/>

（3）安装JDBC并测试

<https://blog.csdn.net/qq_41179679/article/details/79214116>

3.我的网页设计使用的是dreamweaver8，个人觉得这个软件设计前端挺好的，软件压缩包也在github上，不用安装，先点击绿.exe然后再启动软件就可以了。

4.这是我的个人主页的地址，欢迎大家提出建议。（建议使用Chorm打开，ie不支持部分框架内容，网页不完整）

<http://140.82.48.10:8080/WebContent/user/index.html>

