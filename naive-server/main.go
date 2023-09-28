package main

import (
	"project/common"
	"project/handlers"
	"project/utils"

	"github.com/gin-gonic/gin"
)

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken := c.PostForm("access_token")
		common.Logger.Info("=== access token map ===")
		for key, value := range common.AccessTokenMap {
			common.Logger.Info(key + ": " + value.Username)
		}
		common.Logger.Info("=== access token map ===")

		if _, ok := common.AccessTokenMap[accessToken]; !ok {
			c.Set("user", nil)
		} else {
			storedUser := common.AccessTokenMap[accessToken]
			common.Logger.Info("=> " + accessToken + " found user: " + storedUser.Username)
			c.Set("user", storedUser)
		}

		c.Next()
	}
}

func main() {
	common.InitLogger()
	common.InitDB()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, utils.Success(gin.H{
			"msg": "pong!",
		}))
	})

	r.POST("/signup", handlers.Signup)
	r.POST("/signin", handlers.Signin)
	r.Use(authMiddleware())

	r.POST("/checkin", handlers.Checkin)

	r.Run("127.0.0.1:8080")
}
