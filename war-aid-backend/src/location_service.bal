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
    Location body;
|};

table<Location> key(locId) locationsTable = table [
    {
        locId: 0,
        longitude: 0.0,
        latitude: 0.0,
        locationType: "PreDefined",
        districtName: "PreDefined"
    }
];

// Create an HTTP service that listens on port 8080
service /api on new http:Listener(9090) {

    resource function post location(NewLocation newLocation) returns LocationAdded|error {
        int locId = locationsTable.nextKey();
        Location location = {
            locId,
            ...newLocation
        };
        locationsTable.add(location);

        return {
            body: location
        };
    }

    resource function get locations() returns Location[] {
        return locationsTable.toArray();
    }
    resource function get location/[int locId]() returns Location | http:NotFound{
        return locationsTable.hasKey(locId) ? locationsTable.get(locId) : http:NOT_FOUND;
    }
    resource function delete location/[int locId]() returns http:NoContent | http:NotFound {
        if locationsTable.hasKey(locId){
            _ = locationsTable.remove(locId);
            return http:NO_CONTENT;
        }
        return http:NOT_FOUND;
    }
    resource function get location(string? districtName) returns Location[] | http:NotFound{
        if(districtName is string){
            Location[] filteredLocations = from Location location in locationsTable
                                           where location.districtName == districtName 
                                           select location;
            return filteredLocations;
        }
        else {
            return http:NOT_FOUND;                                
        }

    }

}

