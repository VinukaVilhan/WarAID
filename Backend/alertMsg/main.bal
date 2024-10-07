import ballerina/http;
//import ballerina/time;

table<Post> key(id) postTable = table [
    {

        id: 1,
        publishedDate: {year: 2024, month: 10, day: 6 },
        description: "//",
        tags: "//",
        category: "//"
    },

    {
        id: 2,
        publishedDate: {year: 2024, month: 10, day: 6 },
        description: "//",
        tags: "//",
        category: "///"

    }
];

service /api on new http:Listener(9090) {
    resource function get posts(string? category) returns Post[] {

        return postTable.toArray();
    }

    resource function get posts/[int id]() returns Post|http:NotFound {

        return postTable.hasKey(id) ? postTable.get(id) : http:NOT_FOUND;

    }

    resource function post posts(NewPost newPost) returns PostCreated|error {

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

    resource function put posts/[int id](NewPost updatedPost) returns Post|http:NotFound {
        if (postTable.hasKey(id)) {
            Post post = {
                id: id,
                publishedDate: updatedPost.publishedDate,
                description: updatedPost.description,
                tags: updatedPost.tags,
                category: updatedPost.category
            };
            postTable.put(post);
            return post;
        }
        return http:NOT_FOUND;
    }

    resource function delete posts/[int id]() returns http:Ok|http:NotFound {
        if (postTable.hasKey(id)) {
            _ = postTable.remove(id);
            return http:OK;
        }
        return http:NOT_FOUND;
    }

}
