package handlers

import (
	"net/http"
	"project/common"
	"project/models"
	"project/utils"
	"time"

	"github.com/gin-gonic/gin"
)

func Checkin(c *gin.Context) {
	user := c.MustGet("user")
	if user == nil {
		c.JSON(http.StatusOK, utils.Rejected(101, "Invalid access token"))
		return
	}

	username := user.(models.User).Username
	checkword := c.PostForm("checkword")

	newCheckin := models.Checkin{
		Username:   username,
		Checkword:  checkword,
		CreateTime: time.Now(),
	}
	common.DB.Create(&newCheckin)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"point": 1,
	}))
}
