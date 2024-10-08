import ballerina/http;
import ballerina/sql;

public type Location record {|
    @sql:Column {name: "LOCID"}
    readonly int locId;
    @sql:Column {name: "LONGITUDE"}
    float longitude;
    @sql:Column {name: "LATITUDE"}
    float latitude;
    @sql:Column {name: "LOCATIONTYPE"}
    string locationType;
    @sql:Column {name: "DISTRICTNAME"}
    string districtName;
|};

public type NewLocation record {|
    float longitude;
    float latitude;
    string locationType;
    string districtName;
|};

public type LocationAdded record {|
    *http:Created;
    Location body;
|};