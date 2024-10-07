import ballerina/http;
import ballerina/time;

type Post record {|
    readonly int id;
    time:Date publishedDate;
    string description;
    string tags;
    string category;
|};

type NewPost record {|
    time:Date publishedDate;
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
