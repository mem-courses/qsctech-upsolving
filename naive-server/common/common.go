package common

import (
	"os"
	"project/models"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB
var Logger *logrus.Logger

var AccessTokenMap = make(map[string]models.User)

func InitLogger() {
	Logger = logrus.New()
	Logger.Formatter = &logrus.TextFormatter{
		FullTimestamp: true,
		ForceQuote:    true,
	}
	Logger.Out = os.Stdout
}

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("./main.DB"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	DB.AutoMigrate(&models.User{})
}
