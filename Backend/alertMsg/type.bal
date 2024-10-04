import ballerina/http;

type Post record {|
    readonly int id;
    string description;
    string tags;
    string category;
|};

type NewPost record {|
    int userId;
    string description;
    string tags;
    string category;
|};

type PostCreated record {|
    *http:Created;
    Post body;
|};

type Meta record{|
string[] tags;
string category;
|};

type PostWithMeta record{|
    int id;
    int userId;
    string description;
    Meta meta;
|};
