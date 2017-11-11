package model

type DBDocument struct {
    Id string `bson:"id,omitempty"`
    Title string `bson:"title,omitempty"`
    FileName string `bson:"file_name,omitempty"`
    CreateDate string `bson:"create_date,omitempty"`
    Description string `bson:"description,omitempty"`
    Owner []string `bson:"owner,omitempty"`
    Metadata []DocumentMetadata `bson:"metadata,omitempty"`
    Thumbnail string `bson:"thumbnail,omitempty"`
    Data string `bson:"data,omitempty"`
}
