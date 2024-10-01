import ballerina/http;

type Location record {|
    readonly int locId;
    float longitude;
    float latitude;
    string locationType;
    string districtName;
|};

type NewLocation record {|
    float longitude;
    float latitude;
    string locationType;
    string districtName;
|};

type LocationAdded record {|
    *http:Ok;
    NewLocation body;
|};