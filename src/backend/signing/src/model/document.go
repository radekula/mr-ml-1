package model

type DocumentMetadata struct {
    Name string `json:"name"`
    Value string `json:"value"`
}

type Document struct {
    Id string `json:"id"`
    Title string `json:"title"`
    FileName string `json:"file_name"`
    CreateDate string `json:"create_date"`
    Description string `json:"description"`
    Owner []string `json:"owner"`
    Metadata []DocumentMetadata `json:"metadata"`
    Thumbnail string `json:"thumbnail"`
    Data string `json:"data"`
}

type DocumentLite struct {
    Id string `json:"id"`
    Title string `json:"title"`
    FileName string `json:"file_name"`
    CreateDate string `json:"create_date"`
    Description string `json:"description"`
    Owner []string `json:"owner""`
    Metadata []DocumentMetadata `json:"metadata"`
    Thumbnail string `json:"thumbnail"`
}
