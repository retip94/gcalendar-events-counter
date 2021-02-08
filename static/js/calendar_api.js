document.getElementById('start_date').valueAsDate = new Date();
document.getElementById('finish_date').valueAsDate = new Date();
let events_form = document.getElementById("events_form");
let results_div = document.getElementById("results");

if (events_form) {
    events_form.addEventListener('submit', event => {
        event.preventDefault();
        listUpcomingEvents();
    });
}


// Client ID and API key from the Developer Console
let CLIENT_ID = '383274053971-5m7o3eo3m4r700tc3rt59hqdct4rshjm.apps.googleusercontent.com';
let API_KEY = 'AIzaSyA9a0XqhZVr6A4PtcB_zfctANRlsxcEm8w';

// Array of API discovery doc URLs for APIs used by the quickstart
let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
let SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let eventsFormDiv = document.getElementById('events_form_div');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        let error_msg = JSON.stringify(error, null, 2);
        let error_msg_node = document.createTextNode(error_msg + '\n');
        showResults(error_msg_node)
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        eventsFormDiv.classList.remove('d-none');
        listCalendars();
        results_div.innerHTML = "";
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        eventsFormDiv.classList.add('d-none');
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a div element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in div element.
 */
function showResults(node) {
    let div = document.getElementById('results');
    let inner_div = document.createElement("div");
    inner_div.id = "events_results";
    inner_div.appendChild(node);
    div.replaceChild(inner_div, document.getElementById("events_results"));
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    let events_results_div = document.createElement('div');
    let occurrence_div = document.createElement('div');
    let calendar = document.getElementById("calendar_name").value;
    let timeMin = document.getElementById("start_date").value;
    let timeMax = document.getElementById("finish_date").value;
    let event_name = document.getElementById("event_name").value;
    results_div.innerHTML = '';
    if (!calendar) {
        calendar = "primary"
    }
    if (timeMin == "" || timeMax == "") {
        console.log("lipa");
    } else {
        gapi.client.calendar.events.list({
            'calendarId': calendar,
            'timeMin': new Date(Date.parse(timeMin)).toISOString(),
            'timeMax': new Date(Date.parse(timeMax)).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'orderBy': 'startTime',
        }).then(function (response) {
            let events = response.result.items;
            if (events.length > 0) {
                let events_ul = document.createElement("ul");
                events_ul.id = "events_list";
                events = events.filter(e => e.summary.includes(event_name));
                occurrence_div.innerHTML = `The event you were looking for occurred <span style="font-size: 40px">${events.length}</span> times on the selected dates.`;
                for (i = 0; i < events.length; i++) {
                    let event = events[i];
                    let when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    let event_li = document.createElement("li");
                    event_li.appendChild(document.createTextNode(event.summary + ' (' + when + ')'));
                    events_ul.appendChild(event_li)
                }
                events_results_div.appendChild(events_ul);
            } else {
                events_results_div.appendChild(document.createTextNode('There are no events with the given criteria' + '\n'));
            }
        });
    }
    results_div.appendChild(document.createTextNode('Events found:'));
    results_div.appendChild(occurrence_div);
    results_div.appendChild(events_results_div);

}


function listCalendars() {
    gapi.client.calendar.calendarList.list().then(function (response) {
        let calendars = response.result.items;
        // calendars = calendars.filter(c => c.summary.includes("gmail.com"));
        console.log(calendars);
        let select_list = document.getElementById("calendar_name");
        select_list.innerHTML = '';
        for (i = 0; i < calendars.length; i++) {
            let calendar = calendars[i];
            let option = document.createElement("option");
            option.value = calendar.id;
            option.innerHTML = calendar.summary;
            select_list.appendChild(option);
        }
    })
}

function resetPick() {
    document.getElementById("calendar_name").value = "";
}