import ballerina/http;

table<Post> key(id) postTable = table [
    {
        
        id: 1,
        publishedDate:1,
        description: "exploring ballerina language",
        tags: "ballerina, programming,language",
        category: "technology"
    },
    {
        id: 2,
        publishedDate: 2,
        description: "introduction to microservices",
        tags: "microservices,architecrure,language",
        category: "software engineering"

    }
];

service /api on new http:Listener(9090) {
    resource function get posts(string? category) returns Post[] {

        return postTable.toArray();
    }

    resource function get posts/[int id]() returns Post|http:NotFound{

            return postTable.hasKey(id)?postTable.get(id):http:NOT_FOUND;

    }
    resource function post posts(NewPost newPost) returns PostCreated {

        int nextId = postTable.nextKey();
        Post post = {
            id: nextId,
            publishedDate: newPost.publishedDate,
            description: newPost.description,
            tags: newPost.tags,
            category: newPost.category

            };
        postTable.add(post);
        return {
                body: post
            };
    }
}
