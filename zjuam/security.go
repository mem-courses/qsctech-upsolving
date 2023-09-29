package main

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/hex"
	"math/big"
)

func NewRSAKeyPair(exponentString, modulusString string) *rsa.PrivateKey {
	exponent, _ := new(big.Int).SetString(exponentString, 16)
	modulus, _ := new(big.Int).SetString(modulusString, 16)

	privKey := &rsa.PrivateKey{
		PublicKey: rsa.PublicKey{
			N: modulus,
			E: int(exponent.Int64()),
		},
	}
	return privKey
}

func EncryptedString(pubKey *rsa.PublicKey, message string) (string, error) {
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, pubKey, []byte(message))
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(ciphertext), nil
}

func ReverseString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}
