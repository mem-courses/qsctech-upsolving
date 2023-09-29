# zjuam

完成 [浙大统一身份认证](https://zjuam.zju.edu.cn/cas/login) 的模拟登录。

### 心得感受

本项目的难点在于处理 RSA 加密部分。我尝试了多种 RSA 加密方法均未能复现目标 JS 的加密效果，最终我选用 goja 库直接在 Golang 中模拟运行 Javascript 代码来实现加密。
