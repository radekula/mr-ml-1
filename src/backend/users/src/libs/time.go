package libs

import (
    "time"
)

func CurrentTime() (string) {
    current_time := time.Now().Local()

    return current_time.Format("2006-01-02 15:04:05")
}

func CalculateExpirationTime(interval int) (string) {
    expiration_time := time.Now().Local().Add(time.Duration(interval)*time.Second)
    
    return expiration_time.Format("2006-01-02 15:04:05")
}


func CompareDates(reference string, check string) (bool) {
    ref, err := time.Parse("2006-01-02 15:04:05", reference)
    if err != nil {
        panic(err)
    }

    chk, err := time.Parse("2006-01-02 15:04:05", check)
    if err != nil {
        panic(err)
    }

    return ref.After(chk)
}

