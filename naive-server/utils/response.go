package utils

import "github.com/gin-gonic/gin"

func Success(data gin.H) gin.H {
	return gin.H{
		"code": 0,
		"msg":  "",
		"data": data,
	}
}

func Rejected(code int, msg string) gin.H {
	return gin.H{
		"code": code,
		"msg":  msg,
		"data": nil,
	}
}
