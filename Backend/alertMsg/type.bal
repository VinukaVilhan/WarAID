import ballerina/http;
import ballerina/sql;

public type Alert record {|
    @sql:Column {name: "ID"}
    readonly int id;
    @sql:Column {name: "DESCRIPTION"}
    string description;
    @sql:Column {name: "CATEGORY"}
    string category;
|};

public type NewAlert record {|
    string description;
    string category;
|};

public type AlertCreated record {|
    *http:Created;
    Alert body;
|};

