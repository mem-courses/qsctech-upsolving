package models

import (
	"time"

	"gorm.io/gorm"
)

type Checkin struct {
	gorm.Model
	Username   string
	Checkword  string
	CreateTime time.Time
}

func (Checkin) TableName() string {
	return "checkin"
}
