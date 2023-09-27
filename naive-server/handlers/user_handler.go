package handlers

import (
	"net/http"
	"project/common"
	"project/models"
	"project/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func Signin(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")

	var existingUser models.User
	result := common.DB.Where("username = ?", username).First(&existingUser)
	common.Logger.WithFields(logrus.Fields{
		"username":        username,
		"password":        password,
		"result username": existingUser.Username,
		"result password": existingUser.Password,
	}).Info("signin")

	if result.Error != nil || existingUser.Password != password {
		c.JSON(http.StatusUnauthorized, utils.Rejected(401, "Wrong username or password"))
		return
	}

	accessToken := utils.GenerateToken(60)
	common.AccessTokenMap[accessToken] = existingUser

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"access_token": accessToken,
	}))
}

func Signup(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")

	if len(password) < 8 || len(password) > 32 {
		c.JSON(http.StatusBadRequest, utils.Rejected(403, "Password length must be between 8 and 32 characters"))
		return
	}

	var existingUser models.User
	result := common.DB.Where("username = ?", username).First(&existingUser)
	if result.RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, utils.Rejected(402, "Username already exists"))
		return
	}

	newUser := models.User{
		Username: username,
		Password: password,
	}
	common.DB.Create(&newUser)

	accessToken := utils.GenerateToken(60)
	common.AccessTokenMap[accessToken] = newUser

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"access_token": accessToken,
	}))
}
