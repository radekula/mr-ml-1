package libs

import (
    "time"
)

func CurrentTime() (string) {
    current_time := time.Now().Local()

    return current_time.Format("2006-01-02 15:04:05")
}
