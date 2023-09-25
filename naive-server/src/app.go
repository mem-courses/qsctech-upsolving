package main

import (
//  "net/http";

  "github.com/gin-gonic/gin";
)

func resp(data gin.H) gin.H {
  return gin.H{
    "code": 0,
    "msg": "",
    "data": data,
  }
}

func main() {
  r := gin.Default()
  r.GET("/ping", func(c *gin.Context) {
    c.JSON(200, resp(gin.H{
      "msg": "pong",
    }))
  })
  r.Run()
}