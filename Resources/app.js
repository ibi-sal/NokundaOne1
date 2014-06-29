var win = Titanium.UI.createWindow({
	title : "Submit Report",
	backgroundColor : '#bdc3c7',
	exitOnClose : true
});

var bannerTop = Titanium.UI.createLabel({
	text : 'sample guide text',
	font : {
		fontSize : 10,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
	top : '0%',
	width : '100%',
	height : '5%',
	color : '#7f8c8d',
	backgroundColor : '#ecf0f1'
});

var lat = 0;
var longi = 0;

Titanium.Media.showCamera({
	success : function(e) {
		win.open();
		img = e.media.imageAsResized(300, 300);
		var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'temp.jpg');
		f.write(img);
		theimg = f.nativePath;
		var imagee = e.media;
		var imView = Titanium.UI.createImageView({
			image : theimg,
			width : 150,
			height : 105,
			borderRadius : 10,
			top : '7%'
		});

		win.add(imView);
		var myview = Ti.UI.createView({
			layout : 'vertical',
			top : '29%',
			height : Titanium.UI.SIZE,
		});

		var title = Ti.UI.createTextField({
			height : '12%',
			left : '2%',
			right : '2%',
			top : '2%',
			paddingLeft : 6,
			paddingRight : 6,
			paddingTop : 3,
			paddingBottom : 3,
			hintText : 'Title Of Report (MUST)',
			bubbleParent : false,

			font : {
				fontSize : 13,
				fontFamily : 'Helvetica Neue'
			},
			color : '#2c3e50',
			backgroundColor : '#ecf0f1',
			borderRadius : 10,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,

			keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
			returnKeyType : Titanium.UI.RETURNKEY_NEXT
		});

		title.addEventListener('return', function() {
			descr.focus();
		});

		var descr = Ti.UI.createTextField({
			height : '12%',
			left : '2%',
			right : '2%',
			top : '2%',

			paddingLeft : 6,
			paddingRight : 6,
			paddingTop : 3,
			paddingBottom : 3,
			hintText : 'Description (MUST)',
			font : {
				fontSize : 13,
				fontFamily : 'Helvetica Neue'
			},
			color : '#2c3e50',
			backgroundColor : '#ecf0f1',
			borderRadius : 10,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
			returnKeyType : Titanium.UI.RETURNKEY_NEXT
		});
		var loc = Ti.UI.createTextField({
			height : '12%',
			left : '2%',
			right : '2%',
			top : '2%',

			paddingLeft : 6,
			paddingRight : 6,
			paddingTop : 3,
			paddingBottom : 3,
			hintText : 'Location (MUST)',
			font : {
				fontSize : 13,
				fontFamily : 'Helvetica Neue'
			},
			color : '#2c3e50',
			backgroundColor : '#ecf0f1',
			borderRadius : 10,
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
			returnKeyType : Titanium.UI.RETURNKEY_DONE
		});

		loc.addEventListener('focus', function() {
			win.animate({
				bottom : '30%',
				duration : 100
			});
		});
		loc.addEventListener('blur', function() {
			win.animate({
				bottom : 0,
				duration : 100
			});
		});
		loc.addEventListener('return', function() {
			win.animate({
				bottom : 0,
				duration : 100
			});
		});

		myview.add(title);
		myview.add(descr);
		myview.add(loc);
		win.add(bannerTop);

		var btn = Ti.UI.createButton({
			title : 'Submit Report!',
			font : {
				fontSize : 14,
				fontWeight : 'bold',
				fontFamily : 'Helvetica Neue'
			},
			width : '40%',
			height : '12%',
			top : '5%',
			paddingLeft : 10,
			paddingRight : 10,
			paddingTop : 3,
			paddingBottom : 3,
			color : '#ecf0f1',
			backgroundColor : '#3498db',
			borderRadius : 20,
		});

		myview.add(btn);

		btn.addEventListener('click', function(e) {
			if (lat == 0 && longi == 0) {
				displaydata.text = 'Wait for coordinates! Cant submit yet!';
				return;
			}

			var amPM = '';
			var currentTime = new Date();

			var hour = currentTime.getHours();
			var min = currentTime.getMinutes();
			var year = currentTime.getFullYear();

			var twomonth = ((currentTime.getMonth() + 1) >= 10) ? (currentTime.getMonth() + 1) : '0' + (currentTime.getMonth() + 1);
			var twoday = ((currentTime.getDate()) >= 10) ? (currentTime.getDate()) : '0' + (currentTime.getDate());
			var dateform = twomonth + "/" + twoday + "/" + year;

			if (hour < 12) {
				amPM = 'am';
			} else {
				amPM = 'pm';
			}

			//Converting 24hr format to 12 hr for Ushahidi
			if (hour == 0) {
				hour = 12;
			}

			if (hour > 12) {
				hour = hour - 12;
			}

			var rclient = Titanium.Network.createHTTPClient();
			rclient.open("POST", "http://nokunda.labandroid.com/api");
			rclient.setRequestHeader("Connection", "close");

			rclient.onload = function() {
				alert("responseText: " + this.responseText);

			};

			rclient.onsendstream = function(e) {
				displaydata.text = e.progress;
			};

			rclient.onerror = function(e) {
				alert('Transmission error: ' + e.error);
			};

			var params = {
				"task" : "report",
				"incident_title" : title.value,
				incident_description : descr.value,
				incident_date : dateform,
				incident_hour : hour,
				incident_minute : min,
				incident_ampm : amPM,
				incident_category : '1',
				latitude : lat,
				longitude : longi,
				location_name : loc.value,
				"incident_photo[]" : imagee
			};

			rclient.send(params);

			// Facebook Integration starts here //

			var fb = require('facebook');
			fb.appid = 729171797119580;
			fb.permissions = ['publish_stream'];
			fb.forceDialogAuth = true;
			fb.addEventListener('login', function(e) {
				if (e.success) {
					alert('Logged In');
				} else if (e.error) {
					alert(e.error);
				} else if (e.cancelled) {
					alert("Canceled");
				}
			});
			fb.authorize();

			var f = Ti.Filesystem.getFile('alhamdulillah.jpg');
			var reward = f.read();
			var data = {
				message : 'Reported',
				picture : reward
			};
			fb.requestWithGraphPath('me/photos', data, 'POST', function(e) {
				if (e.success) {
					//alert("Success!  From FB: " + e.result);
					alert("Successfully posted to facebook");
				} else {
					if (e.error) {
						alert(e.error);
					} else {
						alert("Unkown result");
					}
				}
			});

			// Integration over //

		});
		var coordss = Titanium.UI.createLabel({
			font : {
				fontSize : 10,
				fontFamily : 'Helvetica Neue'
			},
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			top : '5%',
			width : '80%',
			height : '10%',
			color : '#7f8c8d',
			backgroundColor : '#ecf0f1'
		});

		myview.add(coordss);
		win.add(myview);

		//listener to hide keyboard when clicked outside of a text field
		win.addEventListener('click', function(e) {
			if (e.source != '[object TiUITextField]') {
				title.blur();
				descr.blur();
				loc.blur();
			}
		});

		if (Ti.Platform.osname == "android") {
			var providerGps = Ti.Geolocation.Android.createLocationProvider({
				name : Ti.Geolocation.PROVIDER_GPS,
				minUpdateDistance : 0,
				minUpdateTime : 0
			});

			Ti.Geolocation.Android.addLocationProvider(providerGps);
			Ti.Geolocation.Android.manualMode = true;
		} else {
			win.title = 'Camera Preview iOS';

			Ti.Geolocation.purpose = 'Get Current Location';
			Ti.Geolocation.distanceFilter = 1;
			Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;
			Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
		}

		Ti.Geolocation.addEventListener('location', function(e) {
			if (!e.success || e.error) {
				coordss.text = 'Coordinates N/A right now... wait?';
				lat = 0;
				longi = 0;
				return;
			}
			coordss.text = 'Lat: ' + e.coords.latitude + ' Long: ' + e.coords.longitude + ' Accu: ' + e.coords.accuracy + '\n Heading: ' + e.coords.heading + ' Speed: ' + e.coords.speed;
			lat = e.coords.latitude;
			longi = e.coords.longitude;

		});

	},

	error : function(e) {
		alert("There was an error");
	},
	cancel : function(e) {
		alert("The event was cancelled");
	},
	saveToPhotoGallery : false,
	mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO],
	showControls : true
});
