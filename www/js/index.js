$(window).on("orientationchange", function(e) {
    alert(e.orientation);
});

$(document).on("pageshow", "#addpage", function() {
    var melCentral = { lat: 10.744278, lng: 106.644262 };
    initMap1(melCentral);
});

$(document).on("vclick", "#btn-resaddressLocation", getAddressLocation);
$(document).on("vclick", "#btn-reslatlngLocation", getLatLngLocation);
$(document).on("vclick", "#btn-curLocation", getCurrentLocation);


$(document).on("pageshow", "#updatepage", function() {
    var melCentral = { lat: 10.744278, lng: 106.644262 };
    initMap2(melCentral);
});

$(document).on("vclick", "#btn-newresaddressLocation", getNewAddressLocation);
$(document).on("vclick", "#btn-newreslatlngLocation", getNewLatLngLocation);
$(document).on("vclick", "#btn-newcurLocation", getNewCurrentLocation);

$(document).ready(function(){
    $(".rater").rate();
});

var resetRater = {
    initial_value: 0,
}

var db = window.openDatabase("Restaurants", "1.0", "Restaurants", 200000);

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on("deviceready", onDeviceReady);
} else {
    onDeviceReady();
}

function transError(err) {
    alert("Error processing SQL: " + err.code);
}

function transError1(err) {
    alert("Duplicate input for restaurant name. Please enter a different restaurant name");
}

function transError2(err) {
    alert("The needed restaurant rating can not be updated because the updated restaurant name already existed in the database");
}

function transError3(err) {
    alert("The new account can not be created successfully because there already an account with the sign-up username and password");
}


function onDeviceReady() {
    db.transaction(function(tx) {
        var query = "CREATE TABLE IF NOT EXISTS Restaurant (Id INTEGER PRIMARY KEY AUTOINCREMENT," +
                                                        "Restaurantname TEXT NOT NULL UNIQUE," +
                                                        "Restauranttype TEXT NOT NULL," +
                                                        "Visittime TEXT NOT NULL," +
                                                        "Mealprice INTEGER NOT NULL," +
                                                        "Service FLOAT NOT NULL," +
                                                        "Cleanliness FLOAT NOT NULL," +
                                                        "Foodquality FLOAT NOT NULL," +
                                                        "Totalrating FLOAT NOT NULL," +
                                                        "Note TEXT," +
                                                        "Reportername TEXT NOT NULL," +
                                                        "Address TEXT," +
                                                        "Latitude TEXT," +
                                                        "Longitude TEXT," +
                                                        "Image TEXT" +
                                                        ")";
        tx.executeSql(query, [], function() {
            alert("Create TABLE Restaurant successfully!");
        }, transError);

        query = "CREATE TABLE IF NOT EXISTS Description (Id INTEGER PRIMARY KEY AUTOINCREMENT," +
                                                 "Description TEXT NOT NULL," +
                                                 "Restaurant_Id INTEGER NOT NULL," +
                                                 "FOREIGN KEY (Restaurant_Id) REFERENCES Restaurant (Id)" +
                                                 ")";
        tx.executeSql(query, [], function() {
            alert("Create TABLE Description successfully!");
        }, transError);

        query = "CREATE TABLE IF NOT EXISTS User (Id INTEGER PRIMARY KEY AUTOINCREMENT," +
                                                        "Username TEXT NOT NULL UNIQUE," +
                                                        "Password TEXT NOT NULL" +
                                                        ")";
        
        tx.executeSql(query, [], function() {
            alert("Create TABLE User successfully!");
        }, transError);

    });
}

$(document).on("submit", "#frm-create-restaurant", createRestaurant);

function createRestaurant(e) {
    e.preventDefault();
    
    var restaurantname = $("#frm-create-restaurant #txt-restaurantname").val();
    var restauranttype = $("#frm-create-restaurant #txt-restauranttype").val();
    var visittime = $("#frm-create-restaurant #txt-visittime").val();
    var mealprice = $("#frm-create-restaurant #txt-mealprice").val();
    var service = $("#frm-create-restaurant #txt-servicerating").rate("getValue");
    var cleanliness = $("#frm-create-restaurant #txt-cleanlinessrating").rate("getValue");
    var foodquality = $("#frm-create-restaurant #txt-foodrating").rate("getValue");
    var totalrating = ( service + cleanliness + foodquality)/3;
    totalrating = parseFloat(totalrating).toFixed(1);
    totalrating = parseFloat(totalrating);

    var note = $("#frm-create-restaurant #txt-note").val();
    var reportername = $("#frm-create-restaurant #txt-reportername").val();
    var address = $("#frm-create-restaurant #txt-address").val();
    var latitude = $("#frm-create-restaurant #txt-latitude").val();
    var longitude = $("#frm-create-restaurant #txt-longitude").val();
    var image = $("#frm-create-restaurant #image").attr("src");



    db.transaction(function(tx) {
        var query = "INSERT INTO Restaurant (Restaurantname, Restauranttype, Visittime, Mealprice, Service, Cleanliness, Foodquality, Totalrating, Note, Reportername, Address, Latitude, Longitude, Image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        tx.executeSql(query, [restaurantname, restauranttype, visittime, mealprice, service, cleanliness, foodquality, totalrating, note, reportername, address, latitude, longitude, image], function() {
            alert("Create a new restaurant rating successfully!");
            $("#frm-create-restaurant").trigger("reset");
            $("#frm-create-restaurant #txt-restaurantname").focus();
            $("#frm-create-restaurant #image").attr("src", "");
            $("#frm-create-restaurant #txt-address").attr("value", "");
            $("#frm-create-restaurant #txt-latitude").attr("value", "");
            $("#frm-create-restaurant #txt-longitude").attr("value", "");

            var melCentral = { lat: 10.744278, lng: 106.644262 };
            initMap1(melCentral);

            /*
            var message = {
                text: "There is a new restaurant rating that has been successfully added in the i-Rate app",
                activityTypes: ["PostToFacebook", "PostToTwitter"]
            };
            window.socialmessage.send(message);
            */
            
        }, transError1);
    });

    $("#frm-create-restaurant").validate(
        { submitHandler: function(form) {} }
    );
}

$(document).on("pageshow", "#viewpage", Searcher);
function Searcher(){
    $("#searchname").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#lv-restaurant-list li").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
}



$(document).on("pageshow", "#viewpage", listRestaurant);

function listRestaurant() {
    db.transaction(function(tx) {
        var query = "SELECT * FROM Restaurant";
        tx.executeSql(query, [], listRestaurantSuccess, transError);
    });
}

function listRestaurantSuccess(tx, result) {
    $("#viewpage #lv-restaurant-list").empty();
    
    var newList = "<ul data-role='listview' id='lv-restaurant-list'>";
    
    $.each(result.rows, function(i, item) {
        newList += "<li class='ui-content'><a href='#viewdetailpage' data-details='" + JSON.stringify(item) + "'>" +
                   "<h3 class='ui-li-heading'>Restaurant Name: " + item.Restaurantname + "</h3>" +
                   "<h3 class='ui-li-heading'>Restaurant Type: " + item.Restauranttype + "</h3>" +
                   "<h3 class='ui-li-heading'>Average Meal Price Per Person: " + item.Mealprice + "</h3>" +
                   "<h3 class='ui-li-heading'>Total Rating: " + item.Totalrating + " Stars</h3>" +
                   "<div class='rated' data-rate-value=" + item.Totalrating + " style='float:left;'></div>" +
                   "<img height='100px' width='100px' src='"+item.Image+"' style='float: right;'>" + 
                   "</a></li>";
    });
    
    newList += "</ul>";
    
    $("#viewpage #lv-restaurant-list").append(newList).listview("refresh").trigger("create");
    var options = {
        step_size: 0.1,
        readonly: true,
    }
    $(".rated").rate(options);
}

var resId = 0;

$(document).on("vclick", "#viewpage #lv-restaurant-list li a", function() {
    var restaurant = $(this).data("details");
    listRestaurantDetail(restaurant);
});

function listRestaurantDetail(restaurant) {
    $("#viewdetailpage #restaurantinfo").empty();
    $("#viewdetailpage #description").empty();
    $("#viewdetailpage #btn-add-descriptions").empty();
    
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Restaurant Name: " + restaurant.Restaurantname + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Restaurant Type: " + restaurant.Restauranttype + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Date And Time Of The Visit: " + restaurant.Visittime + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Average Meal Price Per Person: " + restaurant.Mealprice + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Service Rating: " + restaurant.Service + " Stars</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<div class='ratedDetail' data-rate-value=" + restaurant.Service + "></div>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Cleanliness Rating: " + restaurant.Cleanliness + " Stars</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<div class='ratedDetail' data-rate-value=" + restaurant.Cleanliness + "></div>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Food Quality Rating: " + restaurant.Foodquality + " Stars</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<div class='ratedDetail' data-rate-value=" + restaurant.Foodquality + "></div>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Total Rating: " + restaurant.Totalrating + " Stars</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<div class='ratedDetail' data-rate-value=" + restaurant.Totalrating + "></div>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Notes: " + restaurant.Note + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Reporter Name: " + restaurant.Reportername + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Resraurant Address: " + restaurant.Address + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Restaurant Latitude: " + restaurant.Latitude + "</strong></p>");
    $("#viewdetailpage #restaurantinfo").append("<p><strong>Restaurant Longitude: " + restaurant.Longitude + "</strong></p>");
    resId = parseInt(restaurant.Id);
    var reslat = parseFloat(restaurant.Latitude);
    var reslng = parseFloat(restaurant.Longitude);

    var latlng = { lat: reslat, lng: reslng };
    initMap(latlng);

    $("#viewdetailpage #restaurantinfo").append("<p><strong>Restaurant Related Image: </strong></p><img height='300px' src='" + restaurant.Image + "'/>");

    $("#viewdetailpage #btn-add-descriptions").append("<a href='#frm-add-description' data-rel='popup' data-position-to='window' data-transition='pop' class='ui-btn ui-corner-all ui-icon-plus ui-btn-inline ui-btn-icon-notext ui-nodisc-icon ui-alt-icon' data-details='" + restaurant.Id + "'>Add description</a>");
    $(".ratedDetail").rate({
        readonly: true,
    });
    viewDescription(restaurant.Id);

    
}

function viewDescription(id) {
    $("#viewdetailpage #description").empty();
    
    db.transaction(function(tx) {
        var query = "SELECT * FROM Description WHERE Restaurant_Id = ?";
        
        tx.executeSql(query, [id], function(tx, result) {
            if(result.rows.length) {
                $.each(result.rows, function(i, descriptionItem) {
                    $("#viewdetailpage #description").append("<p>" + descriptionItem.Description + "</p>");
                });
            }

            else {
                $("#viewdetailpage #description").append("<p>There is no description.</p>");
            }
        }, transError);
    });
}

$(document).on("vclick", "#viewdetailpage #btn-add-descriptions a", function() {
    var id = $(this).data("details");
    
    $("#frm-add-description #txt-Id").val(id);
});

$(document).on("submit", "#frm-add-description", function(e) {
    e.preventDefault();
    
    var id = $("#frm-add-description #txt-Id").val();
    var description = $("#frm-add-description #ta-description").val();

    if(description != "") {
        db.transaction(function(tx) {
            var query = "INSERT INTO Description(Description, Restaurant_Id) VALUES (?, ?)";
            
            tx.executeSql(query, [description, id], function() {
                alert("Create a restaurant rating description successfully!");
                $("#frm-add-description #ta-description").val("");

                viewDescription(id);
            }, transError);
        });
    }
    
    $.mobile.changePage("#viewdetailpage", { transition: "none" });
});

$(document).on("vclick", "#frm-add-description #btn-clear", function() {
    $("#frm-add-description #ta-description").val("");
});

function getCurrentLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(posSuccess, posError, { timeout: 5000, enableHighAccuracy: true });
        
        function posSuccess(pos) {
            var latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            initMap1(latlng);
            $("#txt-latitude").attr("value", pos.coords.latitude);
            $("#txt-longitude").attr("value", pos.coords.longitude);

            // Convert latlng to address (using keyword "location").
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK") {
                    $("#txt-address").attr("value", results[0].formatted_address);
                }
                
                else { alert("Geocode was not successful for the following reason: " + status); }
            });
        }
        
        function posError(err) { alert("Code: " + err.code + "\nMessage: " + err.message); }
    }

    else { alert("No geolocation support!"); }
}

function getAddressLocation() {
    var address = $("#txt-address").val();
    
    if(address) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK") {
                initMap1(results[0].geometry.location);
                $("#txt-address").attr("value", results[0].formatted_address);
                $("#txt-latitude").attr("value", results[0].geometry.location.lat().toString());
                $("#txt-longitude").attr("value", results[0].geometry.location.lng().toString());
            }
            
            else { alert("Geocode was not successful for the following reason: " + status); }
        });
    }
    
    else { alert("Please enter address..."); }
}

function getLatLngLocation() {
    var lat = parseFloat($("#txt-latitude").val());
    var lng = parseFloat($("#txt-longitude").val());

    // Check if latitude and longitude are valid.
    if( -85 <= lat && lat <= 85 && -180 <= lng && lng <= 180 ) {
        getAddress(lat,lng);
        var latlng = { lat: lat, lng: lng };
        initMap1(latlng);
        
    }
    
    else { alert("Enter valid latitude and longitude..."); }
}

function getAddress(reslat, reslng) {
    var geocoder	= new google.maps.Geocoder();
    var location	= new google.maps.LatLng(reslat, reslng);	

    geocoder.geocode({'latLng': location}, function (results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
            $("#txt-address").attr("value", results[0].formatted_address);
        } else {
          alert("Geocode failure: " + status);
          return false;
        }
    });
}


function initMap1(latlng) {
    var map = new google.maps.Map(document.getElementById("viewlatlngmap"), { zoom: 15, center: latlng });
    var marker = new google.maps.Marker({ position: latlng, map: map });
}



$(document).on("submit", "#frm-search-restaurant", searchRestaurant);

function searchRestaurant(e) {
    e.preventDefault();

    var searchtype = $("#frm-search-restaurant #txt-searchtype").val();

    db.transaction(function(tx) {
        var query = "SELECT * FROM Restaurant WHERE Restauranttype = ?";

        tx.executeSql(query, [searchtype], listSearchSuccess, transError);
    });
}

function listSearchSuccess(tx, result) {
    $("#searchpage #lv-search-list").empty();

    var searchList = "<ul data-role='listview' id='lv-search-list'>";
    
    $.each(result.rows, function(i, item) {
        searchList += "<li class='ui-content'><a href='#viewdetailpage' data-details='"+ JSON.stringify(item) + "'>" +
                        "    <h3 class='ui-li-heading'>Restaurant Name: " + item.Restaurantname + "</h3>" +
                        "    <h3 class='ui-li-heading'>Restaurant Type: " + item.Restauranttype + "</h3>" +
                        "    <p class='ui-li-desc'><strong>Average Meal Price Per Person: " + item.Mealprice + "</strong></p>" +
                        "    <p style='float:left;'><strong>Total Rating: </strong></p>" +
                        "    <div class='rated' data-rate-value=" + item.Totalrating + " style='float:left;'></div>" +
                        "    <img height='100px' width='100px' src='"+item.Image +"' style='float: right;'>" + 
                        "</a></li>";
    });

    searchList += "</ul>";

    $("#searchpage #lv-search-list").append(searchList).listview("refresh").trigger("create");
    var options = {
        step_size: 0.1,
        readonly: true,
    }
    $(".rated").rate(options);
}

$(document).on("vclick", "#searchpage #lv-search-list li a", function() {
    var restaurant = $(this).data("details");

    listRestaurantDetail(restaurant);
});


$(document).on("submit", "#frm-signup", createUser);

function createUser(e) {
    e.preventDefault();

    var signupusername = $("#frm-signup #txt-signupusername").val();
    var signuppassword = $("#frm-signup #txt-signuppassword").val();

    db.transaction(function(tx) {
        var query = "INSERT INTO User (Username, Password) VALUES (?, ?)";
        tx.executeSql(query, [signupusername, signuppassword], function() {
            alert("Create a new user successfully!");
            location.replace("#homepage");
            $("#frm-signup").trigger("reset");
        }, transError3);
    });

    $("#frm-signup").validate(
        { submitHandler: function(form) {} }
    );
}

$(document).on("submit", "#frm-login", searchUser);

function searchUser(e) {
    e.preventDefault();
    var username = $("#frm-login #txt-username").val();
    var password = $("#frm-login #txt-password").val();

    db.transaction(function(tx) {
        var query = "SELECT * FROM User WHERE Username = ? AND Password = ?";
        tx.executeSql(query, [username, password], loginUser, transError);
    });
}

function loginUser(tx, result){
    if(result.rows.length > 0) {
        location.replace("#homepage");
    }
    else {
        alert("Invalid username/password!");
    }
}

$(document).on("vclick", "#btn-take-picture", cameraTakePicture);

function cameraTakePicture() {
    navigator.camera.getPicture(onSuccess, onFail, {
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        alert(imageData);
        $("#image").attr("src", "data:image/jpeq;base64," + imageData);
    }

    function onFail (message) {
        alert("Failed because: " + message);
    }
}

$(document).on("vclick", "#btn-retake-picture", cameraRetakePicture);

function cameraRetakePicture() {
    navigator.camera.getPicture(onSuccess, onFail, {
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(newimageData) {
        alert(newimageData);
        $("#updateimage").attr("src", "data:image/jpeq;base64," + newimageData);
    }

    function onFail (message) {
        alert("Failed because: " + message);
    }
}

$(document).on("vclick", "#btn-deleterestaurant", deleteRestaurant);

function deleteRestaurant(e){
    e.preventDefault();
    db.transaction(function(tx) {
        var query = "DELETE FROM Restaurant WHERE Id = ?";
        tx.executeSql(query, [resId], deleteSuccess1, transError);
    });
}

function deleteSuccess1(){
    alert("The specific restaurant rating has been deleted successfully!");
    resId = 0;
    location.replace('#viewpage');
}

$(document).on("submit", "#frm-update-restaurant", updateRestaurant);

function updateRestaurant(){
    
    var newrestaurantname = $("#frm-update-restaurant #txt-updaterestaurantname").val();
    var newrestauranttype = $("#frm-update-restaurant #txt-updaterestauranttype").val();
    var newvisittime = $("#frm-update-restaurant #txt-updatevisittime").val();
    var newmealprice = $("#frm-update-restaurant #txt-updatemealprice").val();
    var newservice = $("#frm-update-restaurant #txt-updateservicerating").rate("getValue");
    var newcleanliness = $("#frm-update-restaurant #txt-updatecleanlinessrating").rate("getValue");
    var newfoodquality = $("#frm-update-restaurant #txt-updatefoodrating").rate("getValue");
    var newtotalrating = (newservice + newcleanliness + newfoodquality)/3;
    newtotalrating = parseFloat(newtotalrating).toFixed(1);
    newtotalrating = parseFloat(newtotalrating);
    

    var newnote = $("#frm-update-restaurant #txt-updatenote").val();
    var newreportername = $("#frm-update-restaurant #txt-updatereportername").val();
    var newaddress = $("#frm-update-restaurant #txt-updaterestaurantaddress").val();
    var newrestaurantlatitude = $("#frm-update-restaurant #txt-updaterestaurantlatitude").val();
    var newrestaurantlongitude = $("#frm-update-restaurant #txt-updaterestaurantlongitude").val();
    var newimage = $("#frm-update-restaurant #updateimage").attr("src");


    db.transaction(function(tx) {

    var query = "UPDATE Restaurant SET Restaurantname = '" + newrestaurantname + "', Restauranttype = '" + newrestauranttype + "', Visittime = '" 
                                            + newvisittime + "', Mealprice = '" + newmealprice + "', Service = '" + newservice + "', Cleanliness = '" 
                                            + newcleanliness + "', Foodquality = '" + newfoodquality + "', Totalrating = '" + newtotalrating + "', Note = '" 
                                            + newnote + "', Reportername = '" + newreportername + "', Address = '" + newaddress + 
                                            " ' , Latitude = '" + newrestaurantlatitude + " ' , Longitude = '" + newrestaurantlongitude + 
                                            "' , Image = '" + newimage + "' WHERE Id = '" + resId + "'";
            
        tx.executeSql(query, [], function() {
            alert("The searched restaurant rating has been updated successfully");
            $("#frm-update-restaurant").trigger("reset");
            $("#frm-update-restaurant #txt-searchresname").focus();
            $("#frm-update-restaurant #updateimage").attr("src", "");
            $("#frm-update-restaurant #txt-updaterestaurantaddress").attr("value", "");
            $("#frm-update-restaurant #txt-updaterestaurantlatitude").attr("value", "");
            $("#frm-update-restaurant #txt-updaterestaurantlongitude").attr("value", "");
            var melCentral = { lat: 10.744278, lng: 106.644262 };
            initMap2(melCentral);
        }, transError2);
    });
    location.replace('#viewpage');
}


$(document).on("submit", "#frm-delete-restaurant", deletesearchRestaurant);

function deletesearchRestaurant(e) {
    e.preventDefault();

    var searchname = $("#frm-delete-restaurant #txt-searchname").val();

    db.transaction(function(tx) {
        var query = "SELECT * FROM Restaurant WHERE Restaurantname = ?";
        tx.executeSql(query, [searchname], deleteSuccess, transError);
    });
}

function deleteSuccess(tx, result) {
    var searchname = $("#frm-delete-restaurant #txt-searchname").val();
    if (result.rows.length > 0) {
        var query = "DELETE FROM Restaurant WHERE Restaurantname = ?";
        tx.executeSql(query, [searchname], (txi, results) => {
            alert("The searched restaurant rating has been successfully deleted");
            location.reload();
        }, transError);
    } else {
        alert("The searched restaurant is not existed for deleting");
    }
    
}

function getNewCurrentLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(posSuccess, posError, { timeout: 5000, enableHighAccuracy: true });
        
        function posSuccess(pos) {
            var latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            initMap2(latlng);
            $("#txt-updaterestaurantaddress").attr("value", "1600 Amphitheatre Parkway, Mountain View, CA 94043 Mountain View California United States");
            $("#txt-updaterestaurantlatitude").attr("value", pos.coords.latitude);
            $("#txt-updaterestaurantlongitude").attr("value", pos.coords.longitude);
        }
        
        function posError(err) { alert("Code: " + err.code + "\nMessage: " + err.message); }
    }

    else { alert("No geolocation support!"); }
}

function getNewAddressLocation() {
    var address = $("#txt-updaterestaurantaddress").val();
    
    if(address) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK") {
                initMap2(results[0].geometry.location);
                $("#txt-updaterestaurantaddress").attr("value", results[0].formatted_address);
                $("#txt-updaterestaurantlatitude").attr("value", results[0].geometry.location.lat().toString());
                $("#txt-updaterestaurantlongitude").attr("value", results[0].geometry.location.lng().toString());
            }
            
            else { alert("Geocode was not successful for the following reason: " + status); }
        });
    }
    
    else { alert("Please enter address..."); }
}

function getNewLatLngLocation() {
    var lat = parseFloat($("#txt-updaterestaurantlatitude").val());
    var lng = parseFloat($("#txt-updaterestaurantlongitude").val());
    
    // Check if latitude and longitude are valid.
    if( -85 <= lat && lat <= 85 && -180 <= lng && lng <= 180 ) {
        getNewAddress(lat,lng);
        var latlng = { lat: lat, lng: lng };
        initMap2(latlng);
    }
    
    else { alert("Enter valid latitude and longitude..."); }
}

function getNewAddress(newreslat, newreslng) {
    var geocoder	= new google.maps.Geocoder();
    var location	= new google.maps.LatLng(newreslat, newreslng);	

    geocoder.geocode({'latLng': location}, function (results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
            $("#txt-updaterestaurantaddress").attr("value", results[0].formatted_address);
        } else {
          alert("Geocode failure: " + status);
          return false;
        }
    });
}

function initMap2(latlng) {
    var map = new google.maps.Map(document.getElementById("viewnewlatlngmap"), { zoom: 15, center: latlng });
    var marker = new google.maps.Marker({ position: latlng, map: map });
}

function initMap(latlong) {

    var map = new google.maps.Map(document.getElementById("map"),{zoom: 18, center: latlong});

    var marker = new google.maps.Marker({position: latlong, map: map});
}
