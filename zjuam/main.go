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
const SECKEY_API = "https://zjuam.zju.edu.cn/cas/v2/getPubKey"
const CONFIG_PATH = "config.json"

type Config struct {
	Username string
	Password string
}

type SecKey struct {
	Modulus  string
	Exponent string
}

func loadUserFromConfig(username *string, password *string) bool {
	_, err := os.Stat(CONFIG_PATH)
	if os.IsNotExist(err) {
		return false
	}

	file, err := os.Open(CONFIG_PATH)
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

	resp, err := client.R().Get(LOGIN_API)
	fmt.Println("Headers:", resp.Header())
	if err != nil {
		log.Fatal(err)
	}

	execution := resp.String()
	execution = strings.Split(execution, "<input type=\"hidden\" name=\"execution\" value=\"")[1]
	execution = strings.Split(execution, "\" />")[0]
	// fmt.Println("execution", execution)

	resp, err = client.R().Get(SECKEY_API)
	if err != nil {
		log.Fatal(err)
	}

	secKeyJson := resp.String()
	var secKey SecKey
	err = json.Unmarshal([]byte(secKeyJson), &secKey)
	if err != nil {
		log.Fatal(err)
	}
	exponent := secKey.Exponent
	modulus := secKey.Modulus
	fmt.Println("exponent:", exponent)
	fmt.Println("modulus:", modulus)

	// reversedPassword := ReverseString(password)
	// privKey := NewRSAKeyPair(exponent, modulus)
	// encryptedPassword, err := EncryptedString(&privKey.PublicKey, reversedPassword)
	encryptedPassword, err := SolveEncryptPassword(exponent, modulus, password)
	fmt.Println("encrypted password:", encryptedPassword)
	if err != nil {
		log.Fatal(err)
	}

	postBody := map[string]interface{}{
		"username":  username,
		"password":  encryptedPassword,
		"execution": execution,
		"_eventId":  "submit",
		"authcode":  "",
	}
	postBytes, err := json.Marshal(&postBody)
	postJson := string(postBytes)
	fmt.Println("post json:", postJson)

	if err != nil {
		log.Fatal(err)
	}

	resp, err = client.R().SetBody(postJson).Post(LOGIN_API)
	fmt.Println("Headers:", resp.Header())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.String())
}
