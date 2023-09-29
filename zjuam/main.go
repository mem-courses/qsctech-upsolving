package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/go-resty/resty/v2"
)

const LOGIN_API = "https://zjuam.zju.edu.cn/cas/login"

type Config struct {
	Username string
	Password string
}

func loadUserFromConfig(username *string, password *string) bool {
	_, err := os.Stat("config.json")
	if os.IsNotExist(err) {
		return false
	}

	file, err := os.Open("config.json")
	if err != nil {
		fmt.Println("Failed to open `config.json`:", err)
		return false
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config := Config{}
	err = decoder.Decode(&config)
	if err != nil {
		fmt.Println("Failed to parse `config.json`:", err)
		return false
	}

	*username = config.Username
	*password = config.Password

	return true
}

func main() {
	client := resty.New()

	var (
		username string
		password string
	)
	if loadUserFromConfig(&username, &password) {
		fmt.Println("Load username and password from config.json")
	} else {
		fmt.Print("Please enter username: ")
		fmt.Scanln(&username)
		fmt.Print("Please enter password: ")
		fmt.Scanln(&password)
	}
	fmt.Println("Login with username =", username, "password =", password)

	// GET 登录页面，获取 execution
	resp, err := client.R().Get(LOGIN_API)
	if err != nil {
		log.Fatal(err)
	}

	execution := resp.String()
	execution = strings.Split(execution, "<input type=\"hidden\" name=\"execution\" value=\"")[1]
	execution = strings.Split(execution, "\" />")[0]
	// fmt.Println("excution", execution)

	postBody := map[string]interface{}{
		"username":  username,
		"password":  password,
		"execution": execution,
		"_eventId":  "submit",
		"authcode":  "",
	}
	postJson, err := json.Marshal(&postBody)
	if err != nil {
		log.Fatal(err)
	}

	resp, err = client.R().SetBody(postJson).Post(LOGIN_API)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.String())
}
