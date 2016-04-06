/**
 @author Kevin See
 script.js
 File that contains the scripts to run the Reverb Deal Finder
*/

/**
 To get the JSON from the server
 @param: url, the url of the server to get JSON from
 @param: successHandler, function to execute upon success
 @param: errorHandler, function to execute upon failure
*/
var getJSON = function(url, successHandler, errorHandler) {
  var xhr = typeof XMLHttpRequest != 'undefined'
    ? new XMLHttpRequest()
    : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    var status;
    var data;
    if (xhr.readyState == 4) { 
      status = xhr.status;
      if (status == 200) {
        data = JSON.parse(xhr.responseText);
        successHandler && successHandler(data);
      } else {
        errorHandler && errorHandler(status);
      }
    }
  };
  xhr.send();
};

/**
 Takes the array with the listing ID matched to the DOM element and conjoins it with the array with price data.
 Ensures that the pricing data corresponds to the correct DOM element.

 @param: dom, the array of { ID, DomRef }
 @param: data, the array of { ID, top, bottom, actual }
 @return: toReturn, the array of { ID, top, bottom, actual, DomRef }
*/
function matchDomToData( dom, data ){
	var toReturn = new Array();
	for( c = 0; c < data.length; c++ ){
		for(d = 0; d < data.length; d++ ){
			if( data[c].ID == dom[d].ID){
				toReturn.push({"ID":data[c].ID, "bottom":data[c].bottom, "top":data[c].top, "actual":data[c].actual, "DomRef": dom[d].DomRef});
			}
		}
	}
	return toReturn;
}

/**
 Takes the output of the matchDomtoData method and applies styling in the DOM accordingly.
 @param: arr, the output of the matchDomtoData method
*/ 
function processData( arr ){
	for( q = 0; q < arr.length; q++ ){
		//If there was no price guide for the item
		if( (arr[q].bottom == 0) && (arr[q].top == 0)){
			toChange = (arr[q].DomRef).getElementsByClassName("text-orange");
			toChange[0].style.color = "black";
		}else{
			//Bad deal
			if( arr[q].actual > (arr[q].top - ((arr[q].top - arr[q].bottom) * .3) )){
				toChange = (arr[q].DomRef).getElementsByClassName("text-orange");
				toChange[0].style.color = "red";
			//Good deal
			} else if(arr[q].actual < (arr[q].bottom + ((arr[q].top - arr[q].bottom) * .3) )){
				toChange = (arr[q].DomRef).getElementsByClassName("text-orange");
				toChange[0].style.color = "green";
			//Ok deal
			} else{
				toChange = (arr[q].DomRef).getElementsByClassName("text-orange");
				toChange[0].style.color = "#e6b800";
			}
		}
	}
}


//Program start
x = document.getElementsByClassName("product");
queryStr = ""
var infoArr = new Array();
var urlArr = new Array();
var domArr = new Array();
var topPr = 0;
var bottom = 0;
var url = "";
var actual = 0;
var n = 0;
var id = "";

//Loop to populate urlArr and domArr
for( i = 0; i < x.length; i++ ){
	className = x[i].getAttribute("class");
	top = 0;
	bottom = 0;
	//The first three featured posts need to be handled differently
    if( className == "product bordered bumped position-relative" ){
        queryStr = String(x[i].getAttribute("data-listing-id"));}
    else if( className == "product" ){
        y = x[i].getElementsByTagName("a");
        queryStr = (y[0].getAttribute("href")).substring(24,31);
    }
    //Remove non-numeric characters from the ID query string
    queryStr = queryStr.replace(/\D/g,'');
    url = "https://reverb.com/api/listings/" + queryStr;
    urlArr.push(url);
    domArr.push({"ID":queryStr, "DomRef":x[i]});
}

for( i = 0; i < urlArr.length; i++ ){
    data = getJSON(urlArr[i], 
    	function(data) {
			n++ //n counts the number of times this success function executes.  
	  		actual = data.price.amount;
	  		id = data.id;
	  		try{
	  			topPr = Number(data._embedded.price_guide.estimated_value.top_price);
		  		bottom = Number(data._embedded.price_guide.estimated_value.bottom_price);
	  		}catch(err){
	  			topPr = 0;
	  			bottom = 0;
	  		}
	  		infoArr.push({"ID": id, "top":topPr, "bottom": bottom, "actual": actual});
	  		//If we've processed all items on the page, do end processing
	  		if( n == urlArr.length ){
	  			finalArr = matchDomToData( domArr, infoArr );
	  			processData(finalArr);
	  		}
	}, 
	function(status) {
  		console.log('Something went wrong.');
  		return 'Something is wrong';
	});
}
