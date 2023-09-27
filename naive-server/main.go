package main

import (
	"net/http"
	"os"
	"project/models"
	"project/utils"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"

	"github.com/sirupsen/logrus"
)

var db *gorm.DB
var logger *logrus.Logger

func succ(data gin.H) gin.H {
	return gin.H{
		"code": 0,
		"msg":  "",
		"data": data,
	}
}

func reject(code int, msg string) gin.H {
	return gin.H{
		"code": code,
		"msg":  msg,
		"data": nil,
	}
}

func initLogger() {
	logger = logrus.New()
	logger.Formatter = &logrus.JSONFormatter{}
	logger.Out = os.Stdout
}

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("./main.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.User{})
}

func setupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, succ(gin.H{
			"msg": "pong",
		}))
	})

	r.POST("/signin", func(c *gin.Context) {
		var user models.User
		if err := c.BindJSON(&user); err != nil {
			logger.Error("Error parsing JSON: ", err)
			c.JSON(http.StatusBadRequest, reject(100, "Unvalid request"))
			return
		}

		var existingUser models.User
		result := db.Where("username = ?", user.Username).First(&existingUser)

		if result.Error != nil || existingUser.Password != user.Password {
			c.JSON(http.StatusUnauthorized, reject(101, "Wrong username or password"))
			return
		}

		c.JSON(http.StatusOK, succ(gin.H{
			"access_token": utils.GenerateToken(60),
		}))
	})

	return r
}

func main() {
	initLogger()
	initDB()

	r := setupRouter(db)
	r.Run("127.0.0.1:8080")
}
