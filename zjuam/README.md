# zjuam

## 前言

本题希望大家了解基础的html、js，通过浏览器提供的开发者工具分析浙大统一认证的登录过程，并使用一门编程语言从零开始实现一个自动登录浙大统一认证的客户端。在正式开启本题之前，我们希望大家做到以下几点：

* 有充分的、有条理的、尽可能简明规范的注释。
* 良好的错误处理，你的代码能够对网络访问中返回的错误进行处理，并输出在日志或控制台中。
* 学会自己在网络上查找合适的文档资料并自主学习完成。**这份教程没有给出充分的实现细节，这旨在驱动大家自己动手充分利用互联网获取自己想要的信息。**
* 编写一份简明的文档，列出主要函数的调用方式、参数信息、重要注释等。
* 如果实现全部的功能比较困难，**可以只实现部分**

最后需要大家提交的文件包括源代码和文档。

下面是一些额外的要求，希望大家尽量去做：

- 面向对象编程。具体的实现方式可以自行发挥（如数据类型、函数定义等），但我们希望你可以尝试一下面向对象的思路。

- 使用 Go 语言。当然，如果你没有任何 Go 基础，可能会比较困难，那么你可以使用其他你较为熟悉的语言。如果你对 Go 非常熟悉，那么可以试试其他你没那么熟悉的语言，比如 Python、Java 等。这条是希望大家在能力范围内勇于使用自己舒适区外的语言，同时学会查阅语言文档。
- 规范化编程。规范化的编程不仅可以增加代码的可读性，还可以避免一些意料之外的 bug。
- 模块化编程。模块化的编程便于调试，也可以使代码更易读。
- 使自己的代码文件可以供他人作为库导入。为此，你撰写的文档应当足够明晰（不需要卷！）。

## 一些辅助工具的参考文档

- [Git Documentation](https://git-scm.com/doc)
- [Git Tutorial](https://www.runoob.com/git/git-tutorial.html)
- [What is Secure Shell(SSH)](https://en.wikipedia.org/wiki/Secure_Shell)
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)
- [Markdown Tutorial](https://www.runoob.com/markdown/md-tutorial.html)

## 开发者工具

开发者工具是一组网页制作和调试的工具，往往内嵌于浏览器中。开发者工具能够使开发者更加深入的了解浏览器内部以及他们编写的应用，是前端调试js脚本的重要工具。作为一道后端的题目，你不需要对其调试功能有过多的了解，你只需要知道如何通过开发者工具方便的查看网页端的html和js代码，并通过对其代码的分析理解浙大统一认证的登录过程并在后端的代码中模拟其实现。

温馨提示：在本题中，你主要只需要对Element和Sources模块有所了解即可。

参考文档：

* [Chrome DevTools](https://developer.chrome.com/docs/devtools/?utm_source=dcc&utm_medium=redirect&utm_campaign=2018Q2)
* [What are browser developer tools?](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/What_are_browser_developer_tools)

## Cookie

众所周知，http协议是无状态的，由浏览器发起的请求是各自独立的，因此基础的http协议无法判断请求是否来自同一用户。为了实现这一功能，http Cookie应运而生。cookie是储存在浏览器上的一小段数据块，在http请求中添加cookie的相关信息后，服务端就可以判断请求来自哪一用户了。

你可以通过开发者工具-Application-Cookies 查看当前浏览器上的Cookie信息。

浙大统一认证同样使用Cookie存储用户信息，因此你实现的客户端需要注意对Cookie信息的保存。

参考文档：

* [Cookies - Information that websites store on your computer](https://support.mozilla.org/en/kb/cookies-information-websites-store-on-your-computer)
* [What Are HTTP Cookies and How Do They Work?](https://brightdata.com/blog/web-data/http-cookies#:~:text=Summary-,HTTP%20Cookie%20Definition,the%20server%20with%20each%20request.)

## 浙大统一认证登录过程

下面会简要介绍一下浙大统一认证的过程，省略了部分的细节，这些细节都可以通过开发者工具中js的代码中找到。

浙大统一认证的网址：https://zjuam.zju.edu.cn/cas/login

### RSA加密

RSA加密是常见的非对称加密的算法。非对称加密的核心是就算公钥被知道，加密算法依然不可以被破解，因此被广泛应用于网络中。一般密码的信息不会明文传递，因此需要先进行加密。

RSA加密需要获得一个模数$N$和一个指数$e$，首先你就需要获得这两个公钥，这可以在通过某个url下的get方法获得，具体请自行使用开发者工具查看。

接下来只需要先将password转化为ASCII码，再根据公式
$$
c = n^{e}  \ mod \ N
$$
你会发现n（password对应的值）、e、N的值还需要进行一定的转换，具体的内容还是请自行使用开发者工具分析。

参考资料

* [RSA算法原理](https://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html)
* [RSA加密算法](https://zh.wikipedia.org/zh-cn/RSA%E5%8A%A0%E5%AF%86%E6%BC%94%E7%AE%97%E6%B3%95)

### 发送数据

这里为了方便起见直接说明一下登录发送的数据，使用POST方法对url发送请求，请求的数据的格式如下：

```json
{
  "username": userId,
  "password": password,
  "execution": execution,
  "_eventId": "",
  "authcode": "",
},
```

数据的格式为x-www-form-urlencoded

其中userId就是学号，password为经过RSA加密后的密码串

execution为html代码中的一个字符串，具体的位置请自行分析

_eventId 的值为固定值，请自行分析。authcode为空即可。

### 结果检测

如果登录不成功，则会返回错误的信息。

如果登录成功，可以尝试 https://zjuam.zju.edu.cn/cas/login?service=http%3A%2F%2Fappservice.zju.edu.cn%2Findex 该url，成功登陆后便可以通过这个客户端访问 https://appservice.zju.edu.cn 的相关信息。

## bonus

如果您想了解浙大统一认证是如何解决多个网页的登陆问题，可以参考OAuth的相关资料，并尝试解释浙大统一认证在登录appservice的过程中发生了什么。

请把你的解答过程用适当的方式描述并保留在您认为合适的位置。

## 总结与反思

在文档中，需要你在开头或者结尾部分回答下列问题：

1. 你觉得解决这个任务的过程有意思吗？
2. 你在网上找到了哪些资料供你学习？你觉得去哪里/用什么方式搜索可以比较有效的获得自己想要的资料？
3. 在过程中，你遇到最大的困难是什么？你是怎么解决的？
4. 完成任务之后，再回去阅读你写下的代码和文档，有没有看不懂的地方？如果再过一年，你觉得那时你还可以看懂你的代码吗？
5. 其他想说的想法或者建议。

那么二面题就到这里了, 期待与你的见面~

以上。