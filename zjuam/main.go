package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/go-resty/resty/v2"
)

const LOGIN_API = "https://zjuam.zju.edu.cn/cas/login"
const SECKEY_API = "https://zjuam.zju.edu.cn/cas/v2/getPubKey"
const TEST_API = "http://appservice.zju.edu.cn/"
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

	// 从配置文件中读取用户名和密码，或要求使用者从标准输入流中读入
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

	// 从登录页面中获取 execution
	resp, err := client.R().Get(LOGIN_API)
	fmt.Println("Headers:", resp.Header())
	if err != nil {
		log.Fatal(err)
	}

	execution := resp.String()
	execution = strings.Split(execution, "<input type=\"hidden\" name=\"execution\" value=\"")[1]
	execution = strings.Split(execution, "\" />")[0]
	// fmt.Println("execution", execution)

	// 获取 RSA 的指数和模数
	resp, err = client.R().Get(SECKEY_API)
	fmt.Println("Headers:", resp.Header())
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

	// 调用 goja 来计算加密后的密码
	encryptedPassword, err := SolveEncryptPassword(exponent, modulus, password)

	// 使用原生 Golang 加密密码，未调试成功
	// reversedPassword := ReverseString(password)
	// privKey := NewRSAKeyPair(exponent, modulus)
	// encryptedPassword, err := EncryptedString(&privKey.PublicKey, reversedPassword)

	if err != nil {
		log.Fatal(err)
	}

	formData := url.Values{}
	formData.Add("username", username)
	formData.Add("password", encryptedPassword)
	formData.Add("execution", execution)
	formData.Add("_eventId", "submit")
	formData.Add("authcode", "")
	fmt.Println("form:", formData.Encode())

	if err != nil {
		log.Fatal(err)
	}

	resp, err = client.R().
		SetHeader("Content-Type", "application/x-www-form-urlencoded").
		SetBody(formData.Encode()).
		Post(LOGIN_API)
	// 注意一定要以 application/x-www-form-urlencoded 编码 POST Body

	fmt.Println("login response code:", resp.StatusCode())
	if err != nil {
		log.Fatal(err)
	}

	if resp.StatusCode() == 403 {
		// 说明账号被锁定
		fmt.Println("Incorrect password too many times, account has been locked")
		return
	}
	if resp.StatusCode() == 200 {
		// 说明登录失败，重新返回登录页面
		errorMsg := resp.String()
		errorMsg = strings.Split(errorMsg, "<p class=\"error text-left\" id=\"errormsg\">")[1]
		errorMsg = strings.Split(errorMsg, "</p>")[0]
		errorMsg = strings.TrimSpace(errorMsg)
		fmt.Println("login failed:", errorMsg)
		return
	}

	if resp.StatusCode() == 302 {
		// 说明成功登录
		fmt.Println("Successful logged in")
	}

	resp, err = client.R().Get(TEST_API)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(resp.String())
}
