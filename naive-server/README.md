# Naïve Server

一个新手上路的 Go 服务器。

### 心得感受

这是我时隔 n 年之后第二次开发 Golang 项目。由于对 Go 的语法十分生疏，我使用 ChatGPT 代替 Google 作为编程时的主要辅助工具。他高效的帮我解决了跨函数调包时只能使用大写字母开头的函数、变量等问题，也帮我示范了较为规范的 Gin/GORM 使用方式。

本项目虽然较为简单，但我还是选用了一般后端项目的开发模式，将各函数拆分到 `models`、`handlers` 和 `utils` 等多个子模块中。调试方面，这是我的第一次使用 pytest 作为单元测试工具。不得不说，pytest 的手感十分优秀，相比于使用 Postman 手动调试，大大提高了我的调试效率，是个值得使用的工具。

### API 文档

| 需求            | HTTP 路由         |
| -------------- | ----------------- |
| 检查网络连通性   | `[GET]` /ping     |
| 用户注册        | `[POST]` /signup  |
| 用户登录        | `[POST]` /signin  |
| 用户签到        | `[POST]` /checkin |

- 请求使用 `form-data`，响应采用 JSON

- 服务端所有的返回值都需要符合以下格式：

  ```javascript
  {
      "code": int,	// 错误码， 非 0 表示失败
      "msg": string,	// 错误描述， 没有错误时为空字符串
      "data": any		// 数据主体， 没有数据时为 null
  }
  ```

	为了方便，下文描述的都是 `data` 字段的数据内容。

通用的错误代码与信息

| 错误编码 | 原因                     |
| :-----: | ----------------------- |
| 100     | 未被捕捉的错误            |
| 101     | access_token 不存在或失效 |

#### `[GET]` /ping 连通性检测

返回值

```javascript
{
    "msg": "pong!"
}
```

#### `[POST]` /signin 用户登录

请求体

```javascript
{
    "username": string,
    "password": string
}
```

返回值

```javascript
{
    "access_token": string	// 身份验证token
}
```

可能的错误代码与信息

| 错误编码 | 原因             |
| :-----: | --------------- |
| 401     | 错误的用户名或密码 |

#### `[POST]` /signup 用户注册

请求体

```javascript
{
    "username": string,
    "password": string
}
```

返回值

```javascript
{
    "access_token": string
}
```

| 错误编码 | 原因         |
| :-----: | ----------- |
| 402     | 用户已存在   |
| 403     | 用户名不合法 |
| 404     | 密码不合法   |

#### `[POST]` /checkin 打卡

请求体

```javascript
{
    "access_token": string, 
    "checkword": string
}
```

返回值

```javascript
{
    "point": int	// 签到的奖励点数，默认为 1
}
```