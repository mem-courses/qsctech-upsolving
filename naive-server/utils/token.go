package utils

import (
	"math/rand"
	"time"
)

var CHARSET = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func GenerateToken(n int) string {
	rand.Seed(time.Now().Unix())
	token := make([]rune, n)
	for i := range token {
		token[i] = CHARSET[rand.Intn(len(CHARSET))]
	}
	return string(token)
}
