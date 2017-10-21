package libs

import (
    "golang.org/x/crypto/bcrypt"
)



func HashPasswd(passwd string) (string) {

    hashPasswd, err := bcrypt.GenerateFromPassword([]byte(passwd), bcrypt.DefaultCost)
    if err != nil {
        panic(err)
    }
    
    return string(hashPasswd) 
}

func ComparePasswd(passwd string, hashPasswd string) (bool) {

    err := bcrypt.CompareHashAndPassword([]byte(hashPasswd), []byte(passwd))
    if err != nil {
        return false
    }
    
    return true 
}
