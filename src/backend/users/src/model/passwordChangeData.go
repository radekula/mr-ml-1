package model

type PasswordChangeData struct {
    OldPassword string               `json: "old_password" bson:"old_password,omitempty"`
    NewPassword string               `json: "new_password" bson:"new_password,omitempty"`
}
