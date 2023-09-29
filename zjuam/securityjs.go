package main

import (
	"fmt"
	"io/ioutil"
	"strings"

	"github.com/dop251/goja"
)

func SolveEncryptPassword(exponent, modulus, password string) (string, error) {
	jsBytes, err := ioutil.ReadFile("security.js")
	if err != nil {
		return "", err
	}

	jsCode := string(jsBytes)
	jsCode = strings.Replace(jsCode, "{{exponent}}", exponent, -1)
	jsCode = strings.Replace(jsCode, "{{modulus}}", modulus, -1)
	jsCode = strings.Replace(jsCode, "{{password}}", password, -1)

	vm := goja.New()

	var result string
	console := make(map[string]interface{})
	console["log"] = func(msg string) {
		fmt.Println("JS stdout:", msg)
		result = msg
	}
	vm.Set("console", console)

	// fmt.Println(jsCode)
	_, err = vm.RunString(jsCode)
	if err != nil {
		return "", err
	}

	return result, err
}
