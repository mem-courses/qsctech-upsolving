# Naive Server

[TOC]

## 前言

本题希望大家实现一个简单的后端HTTP服务器，能响应简单的注册、登陆、签到的功能。在正式开启本题之前，我们希望大家能做到以下几点：

- 有充分的、有条理的、尽可能简明规范的注释。
- 良好的错误处理，**你的代码能够对网络访问中返回的错误进行处理**，并输出在日志或控制台中，~~一个好的Log可以在Debug 的时候大大降低血压~~。
- 学会自己在网络上查找合适的文档资料并自主学习完成。**这份教程没有给出充分的实现细节，这旨在驱动大家自己动手充分利用互联网获取自己想要的信息。**
- 编写一份简明的文档，介绍一下你是如何实现这个Server的，包括语言、框架... 另外还需要列出错误代码以及其含义
- 如果实现全部的功能比较困难，**可以只实现部分**

最后需要大家提交的文件包括源代码和文档。

下面是一些额外的要求，希望大家尽量去做：

- 使用Golang 语言完成

- 规范化编程。规范化的编程不仅可以增加代码的可读性，还可以避免一些意料之外的 bug。

- 模块化编程。模块化的编程便于调试，也可以使代码更易读。

## 可能用得上的参考文档

- [The Little Go Book 【Golang 教程】](https://www.openmymind.net/assets/go/go.pdf)
- [What is Hypertext Transfer Protocol(HTTP)](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol)
- [HTTP Tutorial【HTTP教程——菜鸟教程】](https://www.runoob.com/http/http-tutorial.html)
- [Gin quickstart](https://www.runoob.com/sql/sql-intro.html)
- [SQL 简介——菜鸟教程](https://www.runoob.com/sql/sql-intro.html)
- [使用SQLite 数据库](https://learnku.com/docs/build-web-application-with-golang/053-uses-the-sqlite-database/3183)
- [GORM 指南](https://gorm.io/zh_CN/docs/)
- [JSON Web Token 入门教程](https://ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
- [Logrus](https://github.com/sirupsen/logrus) 



## 前后端分离的工作流程

用户在浏览器访问域名之后，浏览器会请求对应的前端服务器，服务器收到请求之后会返回对应的前端代码【也就是html,js,css】得到前端代码的浏览器可以渲染出网站的结构，但是此时还没有数据，网站只有架子

前端代码中包含怎么获取数据的url，浏览器会根据这个 url 访问后端服务器，然后根据后端服务器返回的数据把整个网页填充完整

~~图是自己画的，凑合着看看x~~

![backend](./assest/backend.svg)

## 后端服务器要做什么

**正确地**接受请求然后返回数据

为了完成这个工作需要：

- 鉴权
- 查询数据库
- ...

---

## API

对于服务端，有以下的api 希望在您的代码中实现：

| 需求           | HTTP 路由        |
| -------------- | ---------------- |
| 检查网络连通性 | `[GET]` /ping    |
| 用户注册       | `[POST]`/signup  |
| 用户登录       | `[POST]`/signin  |
| 用户签到       | `[POST]`/checkin |

对于api 还有一些规范：

- 请求和响应都将采用 JSON

- 服务端所有的返回值都需要符合以下格式：

  ```json
  {
      "code": int,	// 错误码， 非0表示失败
      "msg": string,	// 错误描述， 没有错误时为空字符串
      "data": any		// 数据主体， 没有数据时为null
  }
  ```

下面是对每一个api 的详细说明【为简单起见，这里**略去通用部分**，只描述data 部分的格式】

`[GET]` /ping

返回：

```json
{
    "msg": "pong!"
}
```

`[POST]` /signin

请求体：

```json
{
    "username": string,
    "password": string
}
```

返回值

```json
{
    "access_token": string	// 身份验证token
}
```

可能的错误情况：

- 用户不存在或者密码错误

  ```json
  // 一个请求错误的返回例子，错误代码和错误信息由您决定，但是要呈现在文档中
  {
      "code": 100,
      "msg": "invalid username or password",
      "data": null
  }
  ```

  

`[POST]` /checkin

请求体：

```json
{
    "access_token": string, 
    "checkword": string
}
```

返回值：

```json
{
    "point": int	// 签到奖励点数
}
```

可能的错误情况：

- token 没有 或者无效
- 用户今天签到过了 [为了简单起见这个可以不实现x]

`[POST]` \signup

请求体：

```json
{
    "username": string,
    "password": string
}
```

返回值：

```json
{
    "access_token": string	// 身份验证token
}
```

可能的错误：

- 用户名重复了
- 用户名为空或者密码为空

## 实现上的建议

可以考虑使用Gin 框架来起服务器

以及使用ORM 代替直接写SQL

还有使用 Logrus 代替 print 来打log

另外您可能需要 使用Postman 来完成调试的工作

## PS

我们还提供了一个小脚本`test_api.py` 其中有一些自动化测试

需要装的依赖有 `requests` 和 `pytest` 测试使用的python 版本是 python3.8

或者你也可以使用

```shell
pip install -r requirements.txt
```

来安装依赖

测试运行的方法是

```shell
pytest ./test_api.py
```

另外关于`config.json` 的说明：

- 是自动化测试的配置文件
- `db` 应为 SQLite 的数据库文件名 默认为 `main.db` users 表中有20个随机生成的用户
- `host` 是您的服务器主机名，不出意外应该是本地 `localhost`
- `port` 是您的服务器端口， Gin 框架默认的端口是8080, 如果不一致请修改

## 总结与反思

在文档中，需要你在开头或者结尾部分回答下列问题：

1. 你觉得解决这个任务的过程有意思吗？
2. 你在网上找到了哪些资料供你学习？你觉得去哪里/用什么方式搜索可以比较有效的获得自己想要的资料？
3. 在过程中，你遇到最大的困难是什么？你是怎么解决的？
4. 完成任务之后，再回去阅读你写下的代码和文档，有没有看不懂的地方？如果再过一年，你觉得那时你还可以看懂你的代码吗？
5. 其他想说的想法或者建议。

那么二面题就到这里了, 期待与你的见面~

以上。
