package main

import (
	"math/rand"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"

	"github.com/sirupsen/logrus"
)

type User struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Product struct {
	gorm.Model
	Code  string
	Price uint
}

func resp(data gin.H) gin.H {
	return gin.H{
		"code": 0,
		"msg":  "",
		"data": data,
	}
}

var CHARSET = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func generate_token(n int) string {
	rand.Seed(time.Now().Unix())
	token := make([]rune, n)
	for i := range token {
		token[i] = CHARSET[rand.Intn(len(CHARSET))]
	}
	return string(token)
}

func setupRouter() *gin.Engine {
	db, err := gorm.Open(sqlite.Open("../main.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&Product{})

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, resp(gin.H{
			"msg": "pong",
		}))
	})

	r.POST("/signin", func(c *gin.Context) {
		json := User{}
		c.BindJSON(&json)
		logrus.Printf("%v", &json)
		token := generate_token(60)
		c.JSON(200, resp(gin.H{
			"access_token": token,
		}))
	})

	return r
}

func main() {
	logrus.SetLevel(logrus.TraceLevel)

	r := setupRouter()
	r.Run("127.0.0.1:8080")
}
