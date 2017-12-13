package model

type NewKeysData struct {
    PrivateKey string            `json:"private_key"`
    PublicKey string             `json:"public_key"`
}


type PublicKeyData struct {
    PublicKey string             `json:"public_key"`
}
