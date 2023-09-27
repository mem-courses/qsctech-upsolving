package main

import (
	"net/http"
	"project/common"
	"project/handlers"
	"project/utils"

	"github.com/gin-gonic/gin"
)

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken := c.PostForm("access_token")

		if _, ok := common.AccessTokenMap[accessToken]; !ok {
			c.JSON(http.StatusUnauthorized, utils.Rejected(100, "Invalid access token"))
			c.Abort()
		}

		storedUser := common.AccessTokenMap[accessToken]
		c.Set("user", storedUser)
		c.Next()
	}
}

func main() {
	common.InitLogger()
	common.InitDB()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, utils.Success(gin.H{
			"msg": "pong",
		}))
	})

	r.POST("/signin", handlers.Signin)
	r.Use(authMiddleware())

	r.Run("127.0.0.1:8080")
}
