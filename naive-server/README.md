# Naïve Server

一个新手上路的 Go 服务器。

### API 文档

| 需求            | HTTP 路由         |
| -------------- | ----------------- |
| 检查网络连通性   | `[GET]` /ping     |
| 用户注册        | `[POST]` /signup  |
| 用户登录        | `[POST]` /signin  |
| 用户签到        | `[POST]` /checkin |

- 请求使用 `form-data`，响应采用 JSON

- 服务端所有的返回值都需要符合以下格式：

  ```json
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

#### `[GET]` /ping

返回值

```json
{
    "msg": "pong!"
}
```

#### `[POST]` /signin

请求体

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

可能的错误代码与信息

| 错误编码 | 原因             |
| :-----: | --------------- |
| 401     | 错误的用户名或密码 |

#### `[POST]` /signup

请求体

```json
{
    "username": string,
    "password": string
}
```

返回值

```json
{
    "access_token": string
}
```

| 错误编码 | 原因         |
| :-----: | ----------- |
| 402     | 用户已存在   |
| 403     | 用户名不合法 |
| 404     | 密码不合法   |

#### `[POST]` /checkin

请求体

```json
{
    "access_token": string, 
    "checkword": string
}
```

返回值

```json
{
    "point": int	// 签到的奖励点数，默认为 1
}
```