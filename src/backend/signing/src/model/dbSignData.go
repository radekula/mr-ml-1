package model

type DBSignData struct {
    Login string                 `bson:"login"`
    SignDate string              `bson:"date"`
    Signature string             `bson:"signature"`
    Checksum string              `bson:"checksum"`
}


type DBDocumentData struct {
    Id string                   `bson:"id"`
    Signatures []DBSignData     `bson:"signatures"`
}


type DBKeysData struct {
    Login string                `bson:"login"`
    PublicKey string            `bson:"public_key"`
    PrivateKey string           `bson:"private_key"`
}
